module.exports = function(grunt) {
    grunt.initConfig({
        express: {
            options: {
                script: 'index.js'
            },
            dev : {

            }
        },
        browserify: {
            dist: {
                files: {
                    'static/js/app.js': ['client/app.js']
                },
                options: {
                    transform: []
                }
            },
        },
        watch: {
            // files: ['**/*.js', '!static/js/*'],
            express: {
              // files:  [ '**/*.js' ],
              files:  [ 'index.js', 'locales/*.json' ],
              tasks:  [ 'express:dev' ],
              options: {
                // for grunt-contrib-watch v0.5.0+, "nospawn: true" for lower versions. Without this option specified express won't be reloaded
                spawn: false,
                atBegin: true,
              },
            },
            browserify: {
              files:  [ 'client/**/*.js' ],
              tasks:  [ 'browserify' ],
              options: {
                atBegin: true,
              }
            },
            // tasks: ['browserify']
        },
    })

    grunt.loadNpmTasks('grunt-express-server');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-browserify');

    grunt.registerTask('default', ['watch']);
};
