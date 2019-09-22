const Phaser = require("phaser");
const Class = Phaser.Class;
const Playground = require("./game.js")

var Ant = new Class({ // TODO can extend the Phaser object ? 
    initialize: function initialize(ant, game) {
       this.obj = ant;
       this.game = game;
       this.obj.maxWalkSpeed = 30;
       this.inventory = [];
    },

    goto: function goto(x,y) {
        var direction = new Phaser.Math.Vector2(x - this.obj.x, y - this.obj.y);
        var distance = direction.length();
        var timeToPos = distance/(this.obj.maxWalkSpeed/1000);
        this.game.physics.moveTo(this.obj,x,y,30);
        if (timeToPos <= Playground.agentUpdatePeriod) {
            this.game.time.delayedCall(timeToPos, function(){this.obj.body.reset(x,y)}, [], this);
        }
    },
});

module.exports = {
    Ant: Ant,
}