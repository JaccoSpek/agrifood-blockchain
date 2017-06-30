module.exports = function(grunt) {
    "use strict";

    grunt.initConfig({
        ts: {
            build: {
                src: ["src/\*\*/\*.ts", "!src/.baseDir.ts"],
                dest: "./dist",
                options: {
                    fast: 'never'
                }
            }
        },
        watch: {
            scripts: {
                files: ["src/\*\*/\*.ts", "!src/.baseDir.ts" /*, "!src/initdb.ts" */],
                tasks: ["ts:build","run:initdb"],
                options: {
                    spawn:false
                }
            }
        },
        nodemon: {
            dev: {
                script: 'dist/www.js'
            },
            options: {
                ignore: ['node_modules/**', 'gruntfile.js','src/.baseDir.ts']
            }
        },
        concurrent: {
            watchers: {
                tasks: ['nodemon','watch'],
                options: {
                    logConcurrentOutput: true
                }
            }
        },
        run: {
            initdb: {
                args: [
                    'dist/initdb.js'
                ]
            }
        }
    });

    grunt.loadNpmTasks("grunt-ts");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-nodemon");
    grunt.loadNpmTasks("grunt-concurrent");
    grunt.loadNpmTasks('grunt-run');

    grunt.registerTask("serve", ["ts:build","run:initdb","concurrent:watchers"]);

};