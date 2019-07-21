const Phaser = require("phaser");
const Class = Phaser.Class;

// TODO: decide on a nice agent behavior architecture (single function, state enum, higher-level)?
const behaviors = {
    IDLE: 'idle',
    MOVING: 'moving',
}

var Agent = new Class({
    initialize: function () {},
    // Responsible for updating the player's state based on this agent's behavior. Called with game, player.
    update: function () {},
    // Executed when this agent is deactivated. Called with game, player.
    stop: function () {},
});


var ProgrammableAgent = new Class({
    Extends: Agent,

    // TODO
    initialize: function () {},
    update: function () {},
    stop: function () {},
});

var RotatingAgent = new Class({
    Extends: Agent,

    initialize: function Agent() {
        this.behavior = behaviors.IDLE;

        this.maxAngularVelocity = 90;
        this.counter = this.maxAngularVelocity;
    },

    update: function update(game, player) {
        if (this.counter < -this.maxAngularVelocity) {
            this.counter = this.maxAngularVelocity;
        }
        player.body.setAngularVelocity(this.counter);
        this.counter -= 1;
    },

    stop: function update(game, player) {
        player.body.setAngularVelocity(0);
        this.counter = 0;
    },
});

var KeyboardAgent = new Class({
    Extends: Agent,

    initialize: function Agent() {
        this.behavior = behaviors.IDLE;

        this.maxAngularVelocity = 90;
        this.counter = this.maxAngularVelocity;
    },

    update: function update(game, player) {
        const cursors = game.cursors;

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
    },

    stop: function update(game, player) {
        player.body.setVelocityX(0);
        player.body.setVelocityY(0);
    },
});


module.exports = {
    Agent: Agent,
    available: {
        'rotating': RotatingAgent,
        'keyboard': KeyboardAgent,
        'programnable': ProgrammableAgent,
    }
}
