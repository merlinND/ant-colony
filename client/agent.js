const Phaser = require("phaser");
const Class = Phaser.Class;
const editor = require('./editor.js');

var Agent = new Class({
    initialize: function () {},
    // Responsible for updating the ant's state based on this agent's behavior. Called with game, ant, args.
    update: function () {},
    // Executed when this agent is deactivated. Called with game, ant.
    stop: function () {},

    // Returns the interval at which the update function should be called (millisecond)
    updatePeriod: function () { return 1000; },
});

var ProgrammableAgent = new Class({
    Extends: Agent,

    initialize: function () {
        this.clearUserCode();
    },

    setUserCode: function (func) {
        this.userFunction = func;
    },
    clearUserCode: function () {
        this.userFunction = null;
    },

    tryRunningFunction: function(f, game, ant, args) {
        if (!f)
            return false;
        editor.clearCodeErrors(game.codeEditor);

        try {
            f(game, ant, ...args);
        } catch (e) {
            editor.showCodeError(game.codeEditor, e);
            this.clearUserCode();
            return false;
        }
        return true;
    },

    update: function update(game, ant, args) {
        this.tryRunningFunction(this.userFunction, game, ant, args);
    },

    stop: function update(game, ant) {
        ant.obj.body.setAngularVelocity(0);
        ant.obj.body.setVelocity(0, 0);
    },
});

var GreedyAgent = new Class({
    Extends: ProgrammableAgent,

    update: function (game, ant, args) {
        const scene = args[2];
        var level = scene.level;
        if (level.isComplete()) {
            ant.obj.body.setVelocity(0, 0);
            game.setAgent('rotating', RotatingAgent);
            return;
        }

        var target = null;
        var direction;
        var distance = Infinity;
        level.items.forEach(function(item) {
            if (item.isPicked || ant.inventory.indexOf(item) >= 0) { return; }
            var newDirection = new Phaser.Math.Vector2(item.x - ant.obj.x, item.y - ant.obj.y);
            var newDistance = newDirection.length();
            if (newDistance < distance) {
                distance = newDistance;
                direction = newDirection;
                target = item;
            }
        });
        if (target) {
            // TODO: handle obstructions (path planning)
            direction.normalize().scale(ant.obj.maxWalkSpeed);
            ant.obj.body.setVelocity(direction.x, direction.y);
        }
    },

    stop: function (game, ant) {
        ant.obj.body.setVelocity(0, 0);
    },
});

var RotatingAgent = new Class({
    Extends: Agent,

    initialize: function Agent() {
        this.maxAngularVelocity = 90;
        this.counter = this.maxAngularVelocity;
    },

    update: function update(game, ant, args) {
        if (this.counter < -this.maxAngularVelocity) {
            this.counter = this.maxAngularVelocity;
        }
        ant.obj.body.setAngularVelocity(this.counter);
        this.counter -= 1;
    },

    stop: function update(game, ant) {
        ant.obj.body.setAngularVelocity(0);
        this.counter = 0;
    },
});

var KeyboardAgent = new Class({
    Extends: Agent,

    initialize: function Agent() {
    },

    update: function update(game, ant, args) {
        const scene = args[2];
        const cursors = scene.cursors;

        // Stop any previous movement from the last frame
        ant.obj.body.setVelocity(0);

        // Horizontal movement
        if (cursors.left.isDown) {
            ant.obj.body.setVelocityX(-3 * ant.obj.maxWalkSpeed);
            ant.obj.anims.play('up', true);
        } else if (cursors.right.isDown) {
            ant.obj.body.setVelocityX(3 * ant.obj.maxWalkSpeed);
            ant.obj.anims.play('up', true);
        }

        // Vertical movement
        if (cursors.up.isDown) {
            ant.obj.body.setVelocityY(-3 * ant.obj.maxWalkSpeed);
            ant.obj.anims.play('up', true);
        } else if (cursors.down.isDown) {
            ant.obj.body.setVelocityY(3 * ant.obj.maxWalkSpeed);
            ant.obj.anims.play('up', true);
        }
    },

    stop: function update(game, ant) {
        ant.obj.body.setVelocity(0, 0);
    },

    updatePeriod: function () { return 1; },
});


module.exports = {
    Agent: Agent,
    available: {
        'programmable': ProgrammableAgent,
        'rotating': RotatingAgent,
        'keyboard': KeyboardAgent,
        'greedy': GreedyAgent,
        /// Agent provided by the level
        'level': null,
    }
}
