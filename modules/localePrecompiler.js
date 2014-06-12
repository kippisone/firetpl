var extend = require('node.extend'),
	FireTPL = require('../firetpl'),
	glob = require('glob');

module.exports = function() {
	'use strict';

	var LocalePrecompiler = function() {

	};

	LocalePrecompiler.prototype.compile = function(options) {
		options = extend({
			baseDir: path.join(process.cwd(), 'locale')
		}, options);

		var locales = this.parseFolder(options.baseDir);
	};

	LocalePrecompiler.prototype.parseFolder = function(dir) {
		fs.fileExists(dir, function(err, state) {
			if (err) {
				throw new Error('No locales found on ' + dir);
			}

			glob(dir, function(file) {

			});
		});
	};

	return LocalePrecompiler;
	
}();