module.exports = function(grunt) {
	'use strict';

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

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
					'src/firetpl-compiler.js'
				],
				dest: 'firetpl-compiler.js'
			}
		},

		// Lists of files to be linted with JSHint.
		jshint: {
			files: [
				'src/**/*.js'
			],
			jshintrc: '.jshintrc'
		}
	});

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-bumpup');

	grunt.registerTask('default', 'jshint');
	grunt.registerTask('build', 'jshint', 'concat');
};