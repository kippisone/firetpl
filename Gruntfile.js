module.exports = function(grunt) {
    'use strict';
    
    var pkg = grunt.file.readJSON('package.json'),
        version = pkg.version.replace(/-\d+$/g, '');

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        syntax: {
            fire: JSON.stringify(grunt.file.readJSON('syntax/fire/fire.json')),
            hbs: JSON.stringify(grunt.file.readJSON('syntax/hbs/hbs.json'))
        },
        bumpup: {
            file: 'package.json'
        },
        concat: {
            options: {
                process: true
            },
            build: {
                src: [
                    'src/firetpl.js',
                    'src/firetpl-error.js',
                    'src/firetpl-parser.js',
                    'src/firetpl-compiler.js',
                    'syntax/syntax.js',
                    'src/firetpl-runtime.js',
                    'src/functions/*.js',
                    'src/firetpl-browser/*.js'
                ],
                dest: 'firetpl.js'
            },
            'build-node': {
                src: [
                    'src/firetpl.js',
                    'src/firetpl-error.js',
                    'src/firetpl-parser.js',
                    'src/firetpl-compiler.js',
                    'syntax/syntax.js',
                    'src/firetpl-runtime.js',
                    'src/firetpl-node.js',
                    'src/functions/*.js',
                    'src/firetpl-node/*.js'
                ],
                dest: 'firetpl-node.js'
            },
            runtime: {
                src: [
                    'src/firetpl.js',
                    'src/firetpl-error.js',
                    'src/firetpl-runtime.js',
                    'src/functions/*.js'
                ],
                dest: 'firetpl-runtime.js'
            },
            compiler: {
                src: [
                    'src/firetpl.js',
                    'src/firetpl-error.js',
                    'src/firetpl-compiler.js',
                    'syntax/syntax.js'
                ],
                dest: 'firetpl-compiler.js'
            }
        },

        copy: {
            component: {
                options: {
                    processContent: function (content, srcpath) {
                        return content.replace('<%= version %>', version);
                    }
                },
                files: [
                    {
                        src: ['firetpl.js'],
                        dest: '../component-builds/firetpl/firetpl.js'
                    }, {
                        src: ['component.json'],
                        dest: '../component-builds/firetpl/',
                    }
                ]
            }
        },
        jshint: {
            files: [
                'src/**/*.js',
                'syntax/**/*.json'
            ],
            jshintrc: '.jshintrc'
        },
        json: {
            main: {
                options: {
                    namespace: 'FireTPL.Syntax'
                },
                src: ['syntax/**/*.json'],
                dest: 'syntax/syntax.js'
            }
        },
        tagrelease: {
            file: 'package.json',
            commit:  true,
            message: 'Release %version%',
            prefix:  'v',
            annotate: false,
        },
        version: {
            component: {
                src: ['../component-builds/component.json']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-bumpup');
    grunt.loadNpmTasks('grunt-json');
    grunt.loadNpmTasks('grunt-tagrelease');
    grunt.loadNpmTasks('grunt-version');

    grunt.registerTask('default', 'jshint');
    grunt.registerTask('build', [
        'jshint',
        'json',
        'concat',
        'bumpup:prerelease',
        'component-build']);

    grunt.registerTask('release', function (type) {
        type = type ? type : 'patch';     // Default release type 
        grunt.task.run('build');         // Lint stuff
        grunt.log.ok('Starting release ' + pkg.version); 
        grunt.task.run('bumpup:' + type); // Bump up the version 
        // grunt.task.run('uglify');         // Minify stuff 
        grunt.task.run('tagrelease');     // Commit & tag the release 
    });

    

    grunt.registerTask('component-build', [
        'copy:component',
        'version:component'
    ]);
};