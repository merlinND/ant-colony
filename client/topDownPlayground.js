const Phaser = require("phaser");
const Agent = require("./agent.js");
const Game = require('./game.js');
const Ant = require("./ant.js");
const logger = require("./logger.js");

const agentUpdatePeriod = 1000;

const init = function(container) {
    console.log('Initializing top-down playground (game only)');

    let CurrentLevel = Game.levels.TEST1;
    let defaultAgentName = 'programmable';

    function preload () {
        this.load.tilemapTiledJSON('test-level', 'maps/test.json');
        this.load.image('tiles', 'images/terrain.png');

        this.load.spritesheet('ant',
            'images/ant-walk.png',
            // { frameWidth: 1616/8, frameHeight: 1984/8 }
            { frameWidth: 417/8, frameHeight: 512/8 }
        );

        this.level = new CurrentLevel(this);
        this.level.preload();
        this.levelComplete = false;

        // For interactive debugging / introspection
        window.game = this;
        window.level = this.level;
    }


    function create () {
        this.cursors = this.input.keyboard.createCursorKeys();

        const map = this.make.tilemap({ key: "test-level" });

        const tileset = map.addTilesetImage("Terrain", "tiles");
        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        // Parameters: layer name (or index) from Tiled, tileset, x, y
        const backgroundLayer = map.createStaticLayer("background", tileset, 0, 0);
        const worldLayer = map.createStaticLayer("world", tileset, 0, 0);
        const aboveLayer = map.createStaticLayer("above", tileset, 0, 0);

        // `collides` property must be set to true in Tiler for the relevant tiles.
        worldLayer.setCollisionByProperty({ collides: true });

        // Debug rendering
        // const debugGraphics = this.add.graphics();
        // debugGraphics.setAlpha(0.75);
        // worldLayer.renderDebug(debugGraphics, {
        //   tileColor: null, // Color of non-colliding tiles
        //   collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
        //   faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
        // });
        this.ants = [];

        for (let i = 0; i < 3; i++) {
            var ant = new Ant.Ant(this.physics.add.sprite(256, (i+1)*128, "ant"), this);
            this.physics.add.collider(ant, worldLayer);
            ant.obj.setCollideWorldBounds(true);
            this.ants.push(ant);
        }
     
        this.anims.create({
            key: 'up',
            frames: this.anims.generateFrameNumbers('ant', { start: 0, end: 61 }),
            frameRate: 5,
            repeat: -1
        });

        // Initialize witht the default agent
        this.agentIndicator = this.add.text(10, 10, "Agent: ", {'align': 'left'});
        this.agentIndicator.setScrollFactor(0);
        this.setAgent(defaultAgentName);

        // Keyboard shortcut to change between agents
        this.cursors.space.addListener('down', function () {
            var availableNames = Object.keys(Agent.available);
            var i = availableNames.indexOf(this.currentAgentName);
            i = (i + 1) % availableNames.length;
            var nextAgentName = availableNames[i];

            this.setAgent(nextAgentName, Agent.available[nextAgentName]);
        }, this);


        // Camera configuration
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.setDeadzone(150, 150);
        // this.cameras.main.setZoom(2);
        this.cameras.main.startFollow(this.ants[0].obj, true);


        // TODO: figure out time scaling
        // this.scene.time.timeScale = 2;
        // this.time.timeScale = 4;

        this.level.create();

        this.level.items.forEach(item => {
            this.ants.forEach(ant => {
                this.physics.add.overlap(ant.obj, item, function(a, b) {
                    var picked = a;
                    if (picked == ant.obj) { picked = b }
                    ant.inventory.push(picked);
                    picked.disableBody(true, true);
                }, null, this);
                });
        });
    }

    let timeSinceAgentUpdate = 0;

    function update(time, delta) {
        if (!this.levelComplete && this.level.isComplete()) {
            var text = this.add.text(game.scale.width / 2, 10, "Level complete!", {'align': 'center'});
            text.setScrollFactor(0);
            this.levelComplete = true;
        }

        timeSinceAgentUpdate += delta;
        if (timeSinceAgentUpdate >= agentUpdatePeriod) {
            
            this.ants.forEach(ant => {
                args = [logger.print, ant.goto.bind(ant)];
                ant.agent.update(game, ant.obj, args);
            });
            
            timeSinceAgentUpdate = 0;
        }
        
    }

    var setAgent = function(name) {
        this.currentAgentName = name;

        this.ants.forEach(ant => {
            if (ant.agent)
                ant.agent.stop(this, ant);
            ant.agent = new Agent.available[name](this);
        });

        this.agentIndicator.setText("Agent: " + this.currentAgentName);
    };

    var setUserCode = function(code) {
        this.setAgent("programmable");

        this.ants.forEach(ant => {
            ant.agent.setUserCode(new Function('game', 'ant', 'print', 'goto', code));
        });
    };


    var game_config = {
        type: Phaser.AUTO,
        width: 600,
        height: 480,
        parent: container[0],
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0 },
                // debug: true,
            }
        },
        input: {
            keyboard: {
                target: container[0],
            },
        },
        scene: {
            preload: preload,
            create: create,
            update: update,
            extend: {
                setAgent: setAgent,
                setUserCode: setUserCode,
            }
        }
    };


    var game = new Phaser.Game(game_config);
    game.setUserCode = function (code) {
        // TODO: support multiple scenes.
        this.scene.scenes[0].setUserCode(code);
    };
    return game;
}

module.exports = {
    init: init,
}

exports.agentUpdatePeriod = agentUpdatePeriod;