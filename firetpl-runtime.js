/*!
 * FireTPL template engine v0.1.0-36
 * 
 * FireTPL is a pretty Javascript template engine
 *
 * FireTPL is licenced under MIT Licence
 * http://opensource.org/licenses/MIT
 *
 * Copyright (c) 2013 - 2014 Noname Media, http://noname-media.com
 * Author Andi Heinkelein
 *
 */

var FireTPL;

(function (root, factory) {
	/*global define:false */
	'use strict';

	if (typeof define === 'function' && define.amd) {
		define('xqcore', [], factory);
	} else if (typeof module !== 'undefined' && module.exports) {
		module.exports = factory();
	} else {
		root.FireTPL = factory();
	}
}(this, function () {
	'use strict';

	FireTPL = {
		version: '0.1.0-36'
	};

	return FireTPL;
}));
(function(FireTPL, undefined) {

	FireTPL.Error = function(instance, msg) {
		if (typeof instance === 'object') {
			if (instance instanceof FireTPL.Compiler) {
				var pos = instance.pos;
				msg = msg + '\n\n' + this.stripSource(pos, instance.tmpl);
			}
		}
		else if (arguments.length) {
			msg = instance;
		}

		return new Error(msg);
	};

	FireTPL.Error.prototype.stripSource = function(pos, tmpl) {
		var sourceStr,
			counter = 0;

		var source = tmpl.split('\n');
		for (var i = 0, len = source.length; i < len; i++) {
			counter += source[i].length + 1; //Add +1 because line breaks
			if (counter > pos) {
				sourceStr = (source[i - 1] || '') + '\n' + (source[i]);
				sourceStr += '\n' + this.strRepeat(pos - (counter - source[i].length), ' ') + '^';
				break;
			} 
		}

		return sourceStr;
	};

	FireTPL.Error.prototype.strRepeat = function(num, str) {
		var out = '';

		while(--num) {
			out += str;

			if (num === -10) {
				throw 'Loop error';
			}
		}

		return out;
	};

})(FireTPL);
/**
 * FireTPL runtime module
 */
(function(FireTPL, undefined) {
	/*global define:false */
	'use strict';

	FireTPL.helpers = {};
	FireTPL.templateCache = {};

	/**
	 * Register a block helper
	 *
	 * @method registerHelper
	 * @param {String} helper Helper name
	 * @param {Function} fn Helper function
	 */
	FireTPL.registerHelper = function(helper, fn) {
		this.helpers[helper] = fn;
	};

	/**
	 * Register core helper
	 *
	 * @private
	 * @method registerCoreHelper
	 */
	FireTPL.registerCoreHelper = function() {
		this.registerHelper('if', function(context, fn) {
			var s = '';

			if (context.data) {
				s += fn(context.parent, context.root);
			}

			return s;
		});
		
		this.registerHelper('else', function(context, fn) {
			return fn(context.parent);
		});

		this.registerHelper('unless', function(context, fn) {
			var s = '';

			if (!(context.data)) {
				s += fn(context.parent);
			}

			return s;
		});

		this.registerHelper('each', function(context, fn) {
			var s = '';

			if (context.data) {
				context.data.forEach(function(item) {
					s += fn(item);
				});
			}

			return s;
		});
	};

	FireTPL.Runtime = function() {

	};

	FireTPL.Runtime.prototype.exec = function(helper, data, parent, root, fn) {
		if (!FireTPL.helpers[helper]) {
			throw new Error('Helper ' + helper + ' not registered!');
		}

		return FireTPL.helpers[helper]({
			data: data,
			parent: parent,
			root: root
		}, fn);
	};

	/**
	 * Executes a precompiled
	 * @method compile
	 * 
	 * @param {String} template Template string or precompiled tempalte
	 * 
	 * @returns {String} Returns executed template
	 */
	FireTPL.compile = function(template, options) {
		if (!/^scopes=scopes/.test(template)) {
			var fireTpl = new FireTPL.Compiler(options);
			var type = options && options.type ? options.type : null;
			template = fireTpl.precompile(template, type);
		}

		return function(data, scopes) {
			var h = new FireTPL.Runtime();
			var l = FireTPL.locale;
			var s;

			//jshint evil:true
			try {
				var tmpl = '(function(data, scopes) {\n' + template + 'return s;})(data, scopes)';
				return eval(tmpl);
			}
			catch (err) {
				console.error('FireTPL parse error', err);
				console.log('----- Template source -----');
				console.log(prettify(tmpl));
				console.log('----- Template source -----');
			}

			return s;
		};
	};

	var prettify = function(str) {
		var indention = 0,
			out = '';

		var repeat = function(str, i) {
			var out = '';
			while (i > 0) {
				out += str;
				i--;
			}
			return out;
		};

		for (var i = 0; i < str.length; i++) {
			var c = str.charAt(i);
			
			if(c === '}' && str.charAt(i - 1) !== '{') {
				indention--;
				out += '\n' + repeat('\t', indention);
			}

			out += c;

			if (c === '{' && str.charAt(i + 1) !== '}') {
				indention++;
				out += '\n' + repeat('\t', indention);
			}
			else if(c === ';') {
				out += '\n' + repeat('\t', indention);
			}
		}

		return out;
	};

	FireTPL.registerCoreHelper();

})(FireTPL);