const Phaser = require("phaser");
const Class = Phaser.Class;

// TODO: decide on a nice agent behavior architecture (single function, state enum, higher-level)?
const behaviors = {
    IDLE: 'idle',
    MOVING: 'moving',
}

var Agent = new Class({

    initialize: function Agent() {
        this.behavior = behaviors.IDLE;

        this.maxAngularVelocity = 90;
        this.counter = this.maxAngularVelocity;
    },

    update: function update(player) {
        if (this.counter < -this.maxAngularVelocity) {
            this.counter = this.maxAngularVelocity;
        }
        player.body.setAngularVelocity(this.counter);
        this.counter -= 1;
    }

});


module.exports = {
    Agent: Agent,
}
