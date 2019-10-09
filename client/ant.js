const Phaser = require("phaser");
const Class = Phaser.Class;
const Playground = require("./game.js");
const logger = require("./logger.js");

var Ant = new Class({ // TODO can extend the Phaser object ?
    initialize: function initialize(scene, xPos, yPos) {
       this.scene = scene;
       this.obj = scene.physics.add.sprite(xPos, yPos, "ant");
       this.obj.maxWalkSpeed = 30;
       this.obj.setScale(this.obj.scale/2);
       this.inventory = [];
       this.timeSinceUpdate = 0;
    },

    update: function update(game, delta) {
        if (this.timeSinceUpdate < this.agent.updatePeriod()) {
            this.timeSinceUpdate += delta;
            return;
        }
        this.timeSinceUpdate = 0;

        args = [logger.print, this.goto.bind(this), this.scene];
        this.agent.update(game, this, args);
    },

    goto: function goto(x,y) {
        var direction = new Phaser.Math.Vector2(x - this.obj.x, y - this.obj.y);
        var distance = direction.length();
        var timeToPos = distance/(this.obj.maxWalkSpeed/1000);
        this.scene.physics.moveTo(this.obj,x,y,30);
        if (timeToPos <= Playground.agentUpdatePeriod) {
            this.scene.time.delayedCall(timeToPos, function(){this.obj.body.reset(x,y)}, [], this);
        }
    },
});

module.exports = {
    Ant: Ant,
}
