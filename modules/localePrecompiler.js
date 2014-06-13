var fs = require('fs'),
	path = require('path');

var extend = require('node.extend'),
	FireTPL = require('../firetpl'),
	glob = require('glob');

module.exports = function() {
	'use strict';

	var LocalePrecompiler = function() {

	};

	LocalePrecompiler.prototype.compile = function(options) {
		options = extend({
			baseDir: path.join(process.cwd(), 'locale'),
			verbose: false
		}, options);

		this.verbose = options.verbose;

		if (this.verbose) {
			console.log('Scan folder %s', options.baseDir);
		}

		var locales = this.parseFolder(options.baseDir);
	};

	LocalePrecompiler.prototype.parseFolder = function(dir) {
		fs.exists(dir, function(state) {
			var opts = {
				cwd: dir,
				stat: true
			};

			glob('**/*.*', opts, function(err, files) {
				if (err) {
					throw err;
				}

				files.forEach(function(file) {
					if (this.verbose) {
						console.log(' >> parse locale %s', file);
					}

					
				}.bind(this));
			}.bind(this));
		}.bind(this));
	};

	return LocalePrecompiler;
	
}();