var fs = require('fs'),
	path = require('path');

var extend = require('node.extend'),
	FireTPL = require('../firetpl'),
	glob = require('glob');

console.log(typeof glob);

module.exports = function() {
	'use strict';

	var LocalePrecompiler = function() {

	};

	//Makes glob better testable
	LocalePrecompiler.prototype.glob = glob;

	LocalePrecompiler.prototype.compile = function(options) {
		options = extend({
			baseDir: path.join(process.cwd(), 'locale'),
			verbose: false
		}, options);

		this.verbose = options.verbose;
		this.defaultLocale = options.defaultLocale || 'en-US';

		if (this.verbose) {
			console.log('Scan folder %s', options.baseDir);
		}

		this.parseFolder(options.baseDir, function(err, locales) {

		});
	};

	LocalePrecompiler.prototype.parseFolder = function(dir, callback) {
		fs.exists(dir, function(state) {
			var opts = {
				cwd: dir,
				stat: true
			};

			this.glob('**/*.*', opts, function(err, files) {
				if (err) {
					throw err;
				}

				files.forEach(function(file) {
					if (this.verbose) {
						console.log(' >> parse locale %s', file);
					}
				}.bind(this));

				//Strip default locale
				var defaultLocale,
					locales = {};

				for (var i = 0, len = files.length; i < len; i++) {
					if (path.basename(files[i],'.json') === this.defaultLocale) {
						defaultLocale = files.splice(i, 1);
						defaultLocale = this.readFile(defaultLocale[0]);
					}
				}

				locales[this.defaultLocale] = defaultLocale;
				
				//Strip other locales
				for (i = 0, len = files.length; i < len; i++) {
					var curLocale = path.basename(files[i],'.json');
					if (/^[a-z]{2}-[A-Z]{2}$/.test(curLocale)) {
						var source = files.splice(i, 1);
						source = this.readFile(source[0]);
						locales[curLocale] = extend({}, defaultLocale, source);
					}
				}


				callback(null, locales);
			}.bind(this));
		}.bind(this));
	};

	LocalePrecompiler.prototype.readFile = function(file) {
		var source = fs.readFileSync(path.join(this.baseDir, file, {encoding:'utf8'}));
		if (path.extname(file) === '.json') {
			source = JSON.parse(source);
		}

		return source;
	};


	return LocalePrecompiler;
	
}();