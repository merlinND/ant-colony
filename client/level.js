const Phaser = require("phaser");
const Class = Phaser.Class;
const availableAgents = require("./agent.js").available;


const GameLevel = new Class({
    initialize: function initialize(game) {
        this.game = game;
    },

    // Load level-specific assets, if necessary.
    preload: function() {},

    // Create objects and objectives for this level. Should be overwritten by specific levels.
    create: function() {},

    // Check whether the level's objectives are complete. Should be overwritten by specific levels.
    isComplete: function() {},

    randomXPos: function() {},
    randomYPos: function() {},

    // Returns an agent that should be run by default on this level. Will typically
    // call the user's programmed function as part of its behavior.
    // May return null if not available.
    getAgent: function() { return null; }
});

const TestLevel1 = new Class({
    Extends: GameLevel,

    preload: function preload() {
        this.game.load.image('objective-item', 'images/fruit.png');
    },

    create: function create() {

        this.map = this.game.make.tilemap({ key: "test-level" });

        const tileset = this.map.addTilesetImage("Terrain", "tiles");
        this.game.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

        // Parameters: layer name (or index) from Tiled, tileset, x, y
        const backgroundLayer = this.map.createStaticLayer("background", tileset, 0, 0);
        this.worldLayer = this.map.createStaticLayer("world", tileset, 0, 0);
        const aboveLayer = this.map.createStaticLayer("above", tileset, 0, 0);

        // `collides` property must be set to true in Tiler for the relevant tiles.
        this.worldLayer.setCollisionByProperty({ collides: true });

        // Debug rendering
        // const debugGraphics = this.add.graphics();
        // debugGraphics.setAlpha(0.75);
        // worldLayer.renderDebug(debugGraphics, {
        //   tileColor: null, // Color of non-colliding tiles
        //   collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
        //   faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
        // });

        // Spawn pickable items (e.g. food)
        var positions = [];
        this.worldLayer.filterTiles(function (t) {
            if (t.properties.food) {
                positions.push([ (t.x + 0.5) * t.width,
                                 (t.y + 0.5) * t.height ]);
                t.setVisible(false);
                t.setCollision(false);
            }
        });
        if (!positions) {
            // Some hardcoded positions for testing
            // positions = [[332, 100], [543, 64], [256, 460], [64, 680]];
            positions = [[332, 100], [543, 64], [256, 120], [64, 64]];
        }

        this.items = [];
        for (var i = 0; i < positions.length; ++i) {
            // var item = this.game.physics.add.sprite(300 + 32 * i, 100 + 32 * i, "objective-item");
            var pos = positions[i];
            var item = this.game.physics.add.sprite(pos[0], pos[1], "objective-item");
            item.isPicked = false;
            this.items.push(item);
        }

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

    getAgent: function getAgent() {
        const f = function(game, ant, print, goto, scene) {
            // User function should
            const computeDistance = this.userFunction(game, ant, print, goto, scene);
            if (!this.once) {
                print('Looking for food...');
                this.once = true;
            }
            var body = ant.obj.body;

            var target = null;
            var distance = Infinity;
            scene.level.items.forEach(function(item) {
                if (ant.inventory.indexOf(item) >= 0) { return; }
                var newDistance = computeDistance(item, body);
                if (newDistance < distance) {
                    distance = newDistance;
                    target = item;
                }
            });
            // TODO: don't redo the computation as long as it is busy
            if (target) {
                goto(target.x, target.y);
            }
        };

        const TestLevel1Agent = new Class({
            Extends: availableAgents['programmable'],

            update: function update(game, ant, args) {
                // Can't do anything until user function has been submitted
                if (!this.userFunction)
                    return;
                if (args[2].level.isComplete()) {
                    args[0]("Level complete!");
                    this.stop(game, ant);
                    game.setAgent("rotating");
                    return;
                }
                this.tryRunningFunction(f.bind(this), game, ant, args);
            },

        });
        return TestLevel1Agent;
    },

    updatePeriod: function () { return 1000; },
});


module.exports = {
    GameLevel: GameLevel,
    levels: {
        TEST1: TestLevel1,
    }
}
