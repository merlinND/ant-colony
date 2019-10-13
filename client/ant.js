const Phaser = require("phaser");
const Class = Phaser.Class;
const Playground = require("./game.js");
const logger = require("./logger.js");

var Ant = new Class({ // TODO can extend the Phaser object ?
    initialize: function initialize(scene, xPos, yPos) {
       this.scene = scene;
       this.agent = null;
       this.obj = scene.physics.add.sprite(xPos, yPos, "ant");
       this.obj.maxWalkSpeed = 30;
       this.obj.setScale(this.obj.scale/2);
       this.inventory = [];
       this.timeSinceUpdate = 0;
    },

    update: function update(game, delta) {
        if (!this.agent)
            return;

        if (this.timeSinceUpdate < this.agent.updatePeriod()) {
            this.timeSinceUpdate += delta;
            return;
        }
        this.timeSinceUpdate = 0;

        const args = [logger.print, this.goto.bind(this), this.scene];
        this.agent.update(game, this, args);
    },

    goto: function goto(x,y) {
        var direction = new Phaser.Math.Vector2(x - this.obj.x, y - this.obj.y);
        var distance  = direction.length();
        var timeToPos = distance / (this.obj.maxWalkSpeed / 1000);
        this.scene.physics.moveTo(this.obj, x, y, 30);
        if (timeToPos <= Playground.agentUpdatePeriod) {
            this.scene.time.delayedCall(timeToPos, function(){
                this.obj.body.reset(x,y);
                this.obj.body.setAngularVelocity(0.0);
                this.obj.anims.stop();
            }, [], this);
        }

        // Rotate sprite toward the goal and play walk animation
        var angleTo = Math.atan2(direction.y / distance, direction.x / distance) + 0.5 * Math.PI;
        this.obj.rotation = angleTo;
        // TODO: make sure this works for all combinations of modulo 2 pi
        // this.obj.rotation = this.obj.rotation + 0.1 * (angleTo - this.obj.rotation);
        // this.obj.body.setAngularVelocity(50.0 * (this.obj.rotation - angleTo));
        this.obj.anims.play("walk");
    },
});

module.exports = {
    Ant: Ant,
}
