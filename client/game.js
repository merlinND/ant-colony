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
});

const TestLevel1 = new Class({
    Extends: GameLevel,

    preload: function preload() {
        this.game.load.image('objective-item', 'images/fruit.png');
    },

    create: function create() {
        this.inventory = [];
        this.items = [];
        for (var i = 0; i < 5; ++i) {
            var item = this.game.physics.add.sprite(300 + 32 * i, 100 + 32 * i, "objective-item");
            this.items.push(item);

            this.game.physics.add.overlap(this.game.player, item, function(a, b) {
                var picked = a;
                if (picked == this.game.player) { picked = b }
                this.inventory.push(picked);
                picked.disableBody(true, true);
            }, null, this);
        }
    },

    isComplete: function isComplete() {
        return this.inventory.length == this.items.length;
    },

});


module.exports = {
    GameLevel: GameLevel,
    levels: {
        TEST1: TestLevel1,
    }
}
