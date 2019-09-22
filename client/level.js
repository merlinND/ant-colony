const Phaser = require("phaser");
const Class = Phaser.Class;


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

        this.items = [];
        // const positions = [[332, 100], [543, 64], [256, 460], [64, 680]];
        const positions = [[332, 100], [543, 64], [256, 120], [64, 64]];
        for (var i = 0; i < positions.length; ++i) {
            // var item = this.game.physics.add.sprite(300 + 32 * i, 100 + 32 * i, "objective-item");
            var pos = positions[i];
            var item = this.game.physics.add.sprite(pos[0], pos[1], "objective-item");
            this.items.push(item);
        }
    },

    isComplete: function isComplete() {
        return false;
    },

    randomXPos: function randomXPos() {
        return Math.random() * this.map.widthInPixels;
    },

    randomYPos: function randomYPos() {
        return Math.random() * this.map.heightInPixels;
    },

});


module.exports = {
    GameLevel: GameLevel,
    levels: {
        TEST1: TestLevel1,
    }
}
