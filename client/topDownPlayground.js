const Phaser = require("phaser");
const agent = require("./agent.js");
const Game = require('./game.js');

const init = function(container) {
    console.log('Initializing top-down playground (game only)');

    let player;
    let CurrentLevel = Game.levels.TEST1;

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


        player = this.physics.add.sprite(400, 350, "ant");
        this.player = player;
        player.maxWalkSpeed = 45;
        player.agent = new agent.Agent();
        this.anims.create({
            key: 'up',
            frames: this.anims.generateFrameNumbers('ant', { start: 0, end: 61 }),
            frameRate: 120,
            repeat: -1
        });
        // For interactive debugging / introspection
        window.player = player;

        this.physics.add.collider(player, worldLayer);

        // Camera configuration
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.setDeadzone(150, 150);
        // this.cameras.main.setZoom(2);
        this.cameras.main.startFollow(player, true);

        player.setCollideWorldBounds(true);

        // TODO: figure out time scaling
        // this.scene.time.timeScale = 2;
        // this.time.timeScale = 4;

        this.level.create();
    }

    function update() {
        const cursors = this.cursors;

        if (!this.levelComplete && this.level.isComplete()) {
            var text = this.add.text(game.scale.width / 2, 10, "Level complete!", {'align': 'center'});
            text.setScrollFactor(0);
            this.levelComplete = true;
        }

        // Stop any previous movement from the last frame
        player.body.setVelocity(0);

        // Horizontal movement
        if (cursors.left.isDown) {
            player.body.setVelocityX(-player.maxWalkSpeed);
            player.anims.play('up', true);
        } else if (cursors.right.isDown) {
            player.body.setVelocityX(player.maxWalkSpeed);
            player.anims.play('up', true);
        }

        // Vertical movement
        if (cursors.up.isDown) {
            player.body.setVelocityY(-player.maxWalkSpeed);
            player.anims.play('up', true);
        } else if (cursors.down.isDown) {
            player.body.setVelocityY(player.maxWalkSpeed);
            player.anims.play('up', true);
        }

        player.agent.update(player);

        // Normalize and scale the velocity so that player can't move faster along a diagonal
        player.body.velocity.normalize().scale(300);

        var isMoving = player.body.velocity.length() > 0;
        if (!isMoving) {
            player.anims.stop();
        }
    }

    var game_config = {
        type: Phaser.AUTO,
        width: 600,
        height: 600,
        parent: container[0],
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0 },
                // debug: true,
            }
        },
        scene: {
            preload: preload,
            create: create,
            update: update
        }
    };

    var game = new Phaser.Game(game_config);
    return game;
}

module.exports = {
    init: init,
}
