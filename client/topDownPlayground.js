const Phaser = require("phaser");

const init = function(container) {
    console.log('Initializing top-down playground (game only)');

    let player;
    let cursors;

    function preload () {
        this.load.tilemapTiledJSON('test-level', 'maps/test.json');
        this.load.image('tiles', 'images/terrain.png');
        this.load.image('player', 'images/player.png');

    //     this.load.spritesheet('dude',
    //         'assets/sprites/dude.png',
    //         { frameWidth: 32, frameHeight: 48 }
    //     );
    }

    function create () {
        cursors = this.input.keyboard.createCursorKeys();

        const map = this.make.tilemap({ key: "test-level" });

        const tileset = map.addTilesetImage("Terrain", "tiles");

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


        player = this.physics.add.sprite(400, 350, "player");
        this.physics.add.collider(player, worldLayer);
    }

    function update() {
        // Stop any previous movement from the last frame
        player.body.setVelocity(0);

        // Horizontal movement
        if (cursors.left.isDown) {
            player.body.setVelocityX(-100);
        } else if (cursors.right.isDown) {
            player.body.setVelocityX(100);
        }

        // Vertical movement
        if (cursors.up.isDown) {
            player.body.setVelocityY(-100);
        } else if (cursors.down.isDown) {
            player.body.setVelocityY(100);
        }

        // Normalize and scale the velocity so that player can't move faster along a diagonal
        player.body.velocity.normalize().scale(300);
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
