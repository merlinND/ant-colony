const Phaser = require("phaser");
const Class = Phaser.Class;
const availableAgents = require("./agent.js").available;
const logger = require("./logger.js");

const GameLevel = new Class({
    initialize: function initialize(game) {
        this.game = game;
    },

    getName: function() { return null; },

    // Load level-specific assets, if necessary.
    preload: function preload() {
        this.game.load.tilemapTiledJSON(this.levelName, '/maps/'+this.levelName+'.json');
        this.game.load.image('objective-item', '/images/fruit.png');
        this.game.load.image('objective-item-aged', '/images/fruit-aged.png');
        this.game.load.image('objective-item-poison', '/images/fruit-poison.png');
    },

    // Create objects and objectives for this level. Should be overwritten by specific levels.
    create: function create() {

        this.map = this.game.make.tilemap({ key: this.levelName });

        const tileset = this.map.addTilesetImage("Terrain", "tiles");
        this.game.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

        // Parameters: layer name (or index) from Tiled, tileset, x, y
        const backgroundLayer = this.map.createStaticLayer("background", tileset, 0, 0);
        this.worldLayer = this.map.createStaticLayer("world", tileset, 0, 0);
        const aboveLayer = this.map.createStaticLayer("above", tileset, 0, 0);

        // `collides` property must be set to true in Tiled for the relevant tiles.
        this.worldLayer.setCollisionByProperty({ collides: true });

        // Spawn pickable items (e.g. food)
        this.items = [];
        const self = this;
        this.worldLayer.filterTiles(function (t) {
            if (!t.properties.food)
                return;

            let position = [ (t.x + 0.5) * t.width,
                             (t.y + 0.5) * t.height ];
            // Make marker tile invisible
            t.setVisible(false);
            t.setCollision(false);

            // Check for special properties (age, poisonous)
            var tileName = 'objective-item'
            const isPoison = (t.properties.poison !== undefined) && t.properties.poison;
            const isOld = (t.properties.age !== undefined) && t.properties.age > 1;
            if (isPoison)
                tileName += '-poison';
            else if (isOld)
                tileName += '-aged';

            // Spawn object
            var item = self.game.physics.add.sprite(position[0], position[1], tileName);
            item.isPicked = false;
            item.poison = isPoison;
            item.age = 1;
            if (isOld)
                item.age = 3;
            self.items.push(item);
        });

        // Find ant spawn locations
        var spawns = [];
        this.worldLayer.filterTiles(function (t) {
            if (t.properties.spawn) {
                spawns.push(t);
                t.setVisible(false);
                t.setCollision(false);
            }
        });
        this.spawns = spawns;
    },

    // Returns an agent that should be run by default on this level. Will typically
    // call the user's programmed function as part of its behavior.
    // May return null if not available.
    getAgent: function() { return null; },

    isComplete: function isComplete() {
        // Level is complete when all objects have been picked
        for (var i = 0; i < this.items.length; ++i) {
            if (!this.items[i].isPicked)
                return false;
        }
        return true;
    },

    randomXPos: function randomXPos() {
        return Math.random() * this.map.widthInPixels;
    },

    randomYPos: function randomYPos() {
        return Math.random() * this.map.heightInPixels;
    },
});

const DirectionOfFoodLevel = new Class({
    Extends: GameLevel,
    initialize: function initialize(game) {
        this.game = game;
        this.levelName = "DirectionOfFood"
    },

    getAgent: function getAgent() {
        const LoopsLevelAgent = new Class({
            Extends: availableAgents['rotating'],
            // TODO
        });
        return LoopsLevelAgent;
    },
});

const DistanceToFoodLevel = new Class({
    Extends: GameLevel,

    initialize: function initialize(game) {
        this.game = game;
        this.levelName = "DistanceToFood"
    },

    getAgent: function getAgent() {
        const testDistanceFunction = function(computeDistance, ant) {
            var d = computeDistance(ant, ant);
            if (d == undefined) {
                logger.error("La fonction n'a pas de valeur de retour !");
                return false;
            }
            if (Math.abs(d) > 1e-4) {
                logger.error("La distance d'un objet à lui même devrait être zéro !");
                return false;
            }
            return true;
        };

        const VarAndFuncLevelAgent = new Class({
            Extends: availableAgents['programmable'],

            levelSpecificFunction: function(game, ant, print, goto, scene) {
                // User function should compute the Euclidean distance
                const computeDistance = this.userFunction(game, ant, goto, scene);
                if (!this.target) {
                    print('Je cherche de la nourriture...');

                    // Quick test of the user function
                    if (!testDistanceFunction(computeDistance, ant, print)) {
                        game.setAgent('idle');
                        return;
                    }

                    this.target = null;
                    // Find new target
                    var distance = Infinity;
                    var self = this;
                    scene.level.items.forEach(function(item) {
                        if (ant.inventory.indexOf(item) >= 0) { return; }
                        var newDistance = computeDistance(item, ant.obj.body);
                        if (newDistance < distance) {
                            distance = newDistance;
                            self.target = item;
                        }
                    });
                }

                if (this.target) {
                    if (this.target.isPicked)
                        this.target = null;
                    else
                        goto(this.target.x, this.target.y);
                }
            },
        });
        return VarAndFuncLevelAgent;
    },
});

const IsFoodEdibleLevel = new Class({
    Extends: GameLevel,
    initialize: function IsFoodEdibleLevel(game) {
        this.game = game;
        this.levelName = "IsFoodEdible"
    },

    isComplete: function() {
        // Level is complete when all *edible* foods have been picked
        for (var i = 0; i < this.items.length; ++i) {
            const isEdible = !this.items[i].poison && (this.items[i].age <= 1);
            if (isEdible && !this.items[i].isPicked)
                return false;
        }
        return true;
    },

    getAgent: function getAgent() {
        const testUserFunction = function(isEdible) {
            var fakeFood = { age: 1, poison: false };
            var b = isEdible(fakeFood);
            if (b == undefined) {
                logger.error("La fonction n'a pas de valeur de retour !");
                return false;
            }
            if (typeof b !== "boolean") {
                logger.error("La fonction devrait retourner `true` ou `false` (type booléen)");
                return false;
            }
            return true;
        };

        const IsFoodEdibleAgent = new Class({
            Extends: availableAgents['programmable'],

            distance: function(o1, o2) {
                var direction = new Phaser.Math.Vector2(o1.x - o2.x, o1.y - o2.y);
                return direction.length();
            },

            shouldPick: function(object, game, ant, args) {
                if (!this.userFunction)
                    return true;
                const f = function(game, ant, print, goto, scene) {
                    const isEdible = this.userFunction(game, ant, goto, scene);
                    return isEdible(object);
                };
                return this.tryRunningFunction(f.bind(this), game, ant, args);
            },

            levelSpecificFunction: function(game, ant, print, goto, scene) {
                // User function should return whether the food is edible
                const isEdible = this.userFunction(game, ant, goto, scene);
                if (!this.target) {
                    print('Je cherche de la nourriture...');

                    // Quick test of the user function
                    if (!testUserFunction(isEdible)) {
                        game.setAgent('idle');
                        return;
                    }

                    this.target = null;
                    // Find new target (closest that is edible)
                    var distance = Infinity;
                    var self = this;
                    scene.level.items.forEach(function(item) {
                        if (ant.inventory.indexOf(item) >= 0) { return; }
                        if (!isEdible(item)) { return; }
                        var newDistance = self.distance(item, ant.obj.body);
                        if (newDistance < distance) {
                            distance = newDistance;
                            self.target = item;
                        }
                    });

                    // Could not find any more targets
                    if (!this.target)
                        this.stop(game, ant);
                }

                if (this.target) {
                    if (this.target.isPicked)
                        this.target = null;
                    else
                        goto(this.target.x, this.target.y);
                }
            },
        });
        return IsFoodEdibleAgent;
    },
});

const ChooseClosestFoodLevel = new Class({
    Extends: GameLevel,
    initialize: function initialize(game) {
        this.game = game;
        this.levelName = "ChooseClosestFood"
    },

    getAgent: function getAgent() {
        const LoopsLevelAgent = new Class({
            Extends: availableAgents['rotating'],
            // TODO
        });
        return LoopsLevelAgent;
    },
});

const ForagingLevel = new Class({
    Extends: GameLevel,
    initialize: function initialize(game) {
        this.game = game;
        this.levelName = "Foraging"
    },

    getAgent: function getAgent() {
        const LoopsLevelAgent = new Class({
            Extends: availableAgents['rotating'],
            // TODO
        });
        return LoopsLevelAgent;
    },
});


module.exports = {
    GameLevel: GameLevel,
    levels: {
        DirectionOfFood: DirectionOfFoodLevel,
        DistanceToFood: DistanceToFoodLevel,
        IsFoodEdible: IsFoodEdibleLevel,
        ChooseClosestFood: ChooseClosestFoodLevel,
        Foraging: ForagingLevel,
    }
}
