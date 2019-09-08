const Phaser = require("phaser");
const Class = Phaser.Class;

var Ant = new Class({ // TODO can extend the Phaser object ? 
    initialize: function initialize(ant, game) {
       this.obj = ant;
       this.game = game;
    },

    goto: function goto(x,y) { // TODO: cannot pass func with "this" set to instance receiver ?
        var newDirection = new Phaser.Math.Vector2(x - this.obj.x, y - this.obj.y);
            var newDistance = newDirection.length();
            if (newDistance < distance) {
                distance = newDistance;
                direction = newDirection;
            }
            direction.normalize().scale(this.obj.maxWalkSpeed);
            this.obj.body.setVelocity(direction.x, direction.y);
    },
});

module.exports = {
    Ant: Ant,
}