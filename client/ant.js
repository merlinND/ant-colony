const Phaser = require("phaser");
const Class = Phaser.Class;
const logger = require("./logger.js");

const kTwoPi = 2 * Math.PI;
const normalizeAngle = function(angle) {
    // Ensures that `angle` is in [-pi, pi].
    // Source: https://stackoverflow.com/a/2323034/3792942
    angle =  angle % kTwoPi;
    angle = (angle + kTwoPi) % kTwoPi;
    if (angle > Math.PI)
        angle -= kTwoPi;
    return angle;
}

var Ant = new Class({
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
        const updatePeriod = this.agent.updatePeriod();
        this.obj.anims.play("walk");

        var direction = new Phaser.Math.Vector2(
            x - this.obj.x, y - this.obj.y);
        var distance  = direction.length();

        // First, make sure the ant is oriented correctly
        var currentAngle = normalizeAngle(this.obj.rotation);
        var angleTo = Math.atan2(
            direction.y / distance, direction.x / distance) + 0.5 * Math.PI;
        angleTo = normalizeAngle(angleTo);
        var diff = angleTo - currentAngle;
        if (diff > Math.PI) {
            diff -= kTwoPi;
        }
        if (diff < -Math.PI) {
            diff += kTwoPi;
        }

        if (Math.abs(diff) > 0.1) {
            this.obj.body.setAngularVelocity(100.0 * Math.sign(diff));
            // TODO: what's the right time to angle?
            var timeToAngle = 70.0 * 1000.0 * Math.abs(diff) / 100.0;
            if (timeToAngle <= updatePeriod) {
                this.scene.time.delayedCall(timeToAngle, function() {
                    this.obj.body.setAngularVelocity(0.0);
                }, [], this);
            }
        } else {
            // Snap to correct angle
            this.obj.body.setAngularVelocity(0.0);
        }

        // Now, walk toward the goal
        var timeToPos = distance / (this.obj.maxWalkSpeed / 1000);
        this.scene.physics.moveTo(this.obj, x, y, 30);
        if (timeToPos <= updatePeriod) {
            this.scene.time.delayedCall(timeToPos, function() {
                this.obj.body.reset(x,y);
                this.obj.body.setAngularVelocity(0.0);
                this.obj.anims.stop();
            }, [], this);
        }
    },
});

module.exports = {
    Ant: Ant,
}
