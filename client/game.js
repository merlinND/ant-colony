const Phaser = require("phaser");
const Agent = require("./agent.js");
const Level = require('./level.js');
const Ant = require("./ant.js");
const logger = require("./logger.js");

const init = function(container) {
    console.log('Initializing ants game...');

    let defaultAgentName = 'level';

    let CurrentLevel = Level.levels[container[0].getAttribute("level")];

    function preload () {
        this.load.image('tiles', '/images/terrain.png');

        this.load.spritesheet('ant',
            '/images/ant-walk.png',
            // { frameWidth: 1616/8, frameHeight: 1984/8 }
            { frameWidth: 417/8, frameHeight: 512/8 }
        );

        this.level = new CurrentLevel(this);
        this.level.preload();
        this.levelComplete = false;

        // For interactive debugging / introspection
        window.scene = this;
        window.level = this.level;
    }


    function create () {
        this.cursors = this.input.keyboard.createCursorKeys();

        this.level.create();

        // Spawn ants (either specified by the map spawn points or at random)
        this.ants = [];
        var antPositions = [];
        if (this.level.spawns) {
            for (let i = 0; i < this.level.spawns.length; i++) {
                let tile = this.level.spawns[i];
                antPositions.push([ (tile.x + 0.5) * tile.width,
                                    (tile.y + 0.5) * tile.height ]);
            }
        } else {
            for (let i = 0; i < 3; i++) {
                antPositions.push([this.level.randomXPos(), this.level.randomYPos()]);
            }
        }
        for (let i = 0; i < antPositions.length; i++) {
            var ant = new Ant.Ant(this, antPositions[i][0], antPositions[i][1]);
            this.physics.add.collider(ant.obj, this.level.worldLayer);
            ant.obj.setCollideWorldBounds(true);
            // Face random direction
            ant.obj.rotation = Math.random() * 2.0 * Math.PI;
            this.ants.push(ant);
        }

        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('ant', { start: 0, end: 61 }),
            frameRate: 90,
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

            this.setAgent(nextAgentName);
        }, this);


        // Camera configuration
        this.cameras.main.setBounds(0, 0, this.level.map.widthInPixels, this.level.map.heightInPixels);
        this.cameras.main.setDeadzone(150, 150);
        // this.cameras.main.setZoom(2);
        this.cameras.main.startFollow(this.ants[0].obj, true);

        // Collision rule with pickable items
        const game = this.game;
        this.level.items.forEach(item => {
            this.ants.forEach(ant => {
                this.physics.add.overlap(ant.obj, item, function(a, b) {
                    var picked = a;
                    if (picked == ant.obj) { picked = b }
                    // Agent may refuse to pick this object
                    const args = [logger.print, ant.goto.bind(ant), ant.scene];
                    if (ant.agent.shouldPick !== undefined
                        && !ant.agent.shouldPick(picked, game, ant, args)) {
                        return;
                    }

                    ant.inventory.push(picked);
                    picked.isPicked = true;
                    picked.disableBody(true, true);
                    logger.print('Trouvé de la nourriture!');
                }, null, this);
            });
        });
    }

    function update(time, delta) {
        if (!this.levelComplete && this.level.isComplete()) {
            // var text = this.add.text(game.scale.width / 2, 10,
            //                          "Level complete!", {'align': 'center'});
            // text.setScrollFactor(0);
            this.levelComplete = true;
        }

        this.ants.forEach(ant => {
            ant.update(game, delta);
        });
    }

    var setAgent = function(name) {
        const self = this;
        this.currentAgentName = name;
        this.ants.forEach(ant => {
            if (ant.agent)
                ant.agent.stop(this, ant);
            if (name == 'level') {
                const LevelAgent = self.level.getAgent();
                if (LevelAgent == null)
                    return self.setAgent('programmable');
                ant.agent = new LevelAgent(this);
            } else {
                ant.agent = new Agent.available[name](this);
            }
        });

        if (name == 'level' || name == 'rotating')
            this.agentIndicator.setText('');
        else
            this.agentIndicator.setText("Agent: " + this.currentAgentName);
    };

    var setUserCode = function(code) {
        if (this.currentAgentName != 'level' && this.currentAgentName != 'programmable')
            this.setAgent("level");

        this.ants.forEach(ant => {
            ant.agent.setUserCode(new Function('game', 'ant', 'print', 'goto', 'scene', code));
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
            // keyboard: {
            //     target: container[0],
            // },
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
    game.setAgent = function (agentName) {
        // TODO: support multiple scenes.
        this.scene.scenes[0].setAgent(agentName);
    };
    game.setUserCode = function (code) {
        // TODO: support multiple scenes.
        this.scene.scenes[0].setUserCode(code);
    };
    return game;
}

module.exports = {
    init: init,
}
