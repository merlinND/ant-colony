const $ = require('jquery');
const codemirror = require("codemirror");
const codemirror_js = require("codemirror/mode/javascript/javascript");
const Phaser = require("phaser");

const initAntsApp = function(container) {
    console.log('Initializing ants app (editor + game)');
    var editorTarget = container.find(".code-editor textarea")[0];
    var editor = codemirror.fromTextArea(editorTarget, {
        mode: "javascript",
        lineWrapping: false,
        // extraKeys: {
        //     'Ctrl-Space': 'autocomplete',
        //     'Ctrl-S': fn_saveScript
        // },
        lineNumbers: true,
        theme: 'base16-light', // 'monokai',
        value: "",
        indentUnit: 4,
    });

    // TODO: initialize game engine

    return editor;
}

const initAntsplayground = function(container) {
    console.log('Initializing ants playground (game only)');
    var canvas = container.find('canvas');

    var player;
    var cursors;


    function preload () {
        this.load.setBaseURL('http://labs.phaser.io');

        this.load.image('sky', 'assets/skies/space3.png');
        this.load.image('logo', 'assets/sprites/phaser3-logo.png');
        this.load.image('red-particle', 'assets/particles/red.png');
        this.load.image('sparkle-particle', 'assets/particles/white-flare.png');
        this.load.image('ground', 'assets/sprites/platform.png');
        this.load.image('star', 'assets/sprites/diamond.png');

        this.load.spritesheet('dude',
            'assets/sprites/dude.png',
            { frameWidth: 32, frameHeight: 48 }
        );
    }

    function create () {
        cursors = this.input.keyboard.createCursorKeys();
        this.add.image(400, 300, 'sky');

        var particles = this.add.particles('red-particle');
        var emitter = particles.createEmitter({
            speed: 100,
            scale: { start: 0.5, end: 0 },
            opacity: { start: 0.9, end: 0.6 },
            blendMode: 'ADD'
        });

        player = this.physics.add.sprite(100, 450, 'dude');
        player.setBounce(0.2);
        player.setCollideWorldBounds(true);

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'turn',
            frames: [ { key: 'dude', frame: 4 } ],
            frameRate: 20
        });
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });
        emitter.startFollow(player);

        var platforms = this.physics.add.staticGroup();
        platforms.create(400, 568, 'ground').setScale(2).refreshBody();
        platforms.create(600, 400, 'ground'); //.setScale(0.1, 0.2).refreshBody();
        platforms.create(50, 250, 'ground'); //.setScale(0.1, 0.2).refreshBody();
        platforms.create(750, 220, 'ground'); //.setScale(0.1, 0.2).refreshBody();

        var stars = this.physics.add.group({
            key: 'star',
            repeat: 11,
            setXY: { x: 12, y: 0, stepX: 70 }
        });
        var self = this;
        stars.children.iterate(function (child) {
            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

            var particles = self.add.particles('sparkle-particle');
            var emitter = particles.createEmitter({
                frequency: Phaser.Math.Between(300, 1000),
                // maxParticles: 10,
                lifespan: 2000,
                // speed: 500,
                scale: { start: 0.5, end: 0 },
                blendMode: 'ADD'
            });
            emitter.startFollow(child);

            particles.setDepth(0);
            child.setDepth(1);
            child.emitter = emitter;
        });

        this.physics.add.collider(player, platforms);
        this.physics.add.collider(stars, platforms);
        this.physics.add.overlap(player, stars, collectStar, null, this);
    }

    function update() {
        if (cursors.left.isDown) {
            player.setVelocityX(-160);
            player.anims.play('left', true);
        }
        else if (cursors.right.isDown) {
            player.setVelocityX(160);
            player.anims.play('right', true);
        }
        else {
            player.setVelocityX(0);
            player.anims.play('turn');
        }

        if (cursors.up.isDown && player.body.touching.down) {
            player.setVelocityY(-500);
        }
    }

    function collectStar(player, star) {
        star.disableBody(true, true);
        star.emitter.stop()
    }

    var game_config = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        parent: container[0],
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 600 }
            }
        },
        scene: {
            preload: preload,
            create: create,
            update: update
        }
    };

    var game = new Phaser.Game(game_config);

    return game;
}


$(function() {

    var appContainer = $('#ants-app');
    if (appContainer.length) {
        initAntsApp(appContainer);
        return;
    }

    var playgroundContainer = $('#playground');
    if (playgroundContainer.length) {
        initAntsplayground(playgroundContainer);
        return;
    }

    console.error('Could not detect page type.')
})

