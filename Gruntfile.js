module.exports = function(grunt) {
	'use strict';

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
					'src/firetpl-compiler.js',
					'syntax/syntax.js',
					'src/firetpl-runtime.js'
				],
				dest: 'firetpl.js'
			},
			runtime: {
				src: [
					'src/firetpl.js',
					'src/firetpl-runtime.js'
				],
				dest: 'firetpl-runtime.js'
			},
			compiler: {
				src: [
					'src/firetpl.js',
					'src/firetpl-compiler.js',
					'syntax/syntax.js'
				],
				dest: 'firetpl-compiler.js'
			}
		},

		// Lists of files to be linted with JSHint.
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
					namespace: 'FireTPL.Compiler.prototype.syntax'
				},
				src: ['syntax/**/*.json'],
				dest: 'syntax/syntax.js'
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-bumpup');
	grunt.loadNpmTasks('grunt-json');

	grunt.registerTask('default', 'jshint');
	grunt.registerTask('build', ['jshint', 'json', 'concat']);
};