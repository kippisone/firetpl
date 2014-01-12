/*!
 * FireTPL template engine v0.0.1
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
		version: '0.0.1'
	};

	return FireTPL;
}));
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

			if (context) {
				s += fn(context);
			}

			return s;
		});
		
		this.registerHelper('else', function(context, fn) {
			return fn(context);
		});

		this.registerHelper('unless', function(context, fn) {
			var s = '';

			if (!(context)) {
				s += fn(context);
			}

			return s;
		});

		this.registerHelper('each', function(context, fn) {
			var s = '';

			if (context) {
				context.forEach(function(item) {
					s += fn(item);
				});
			}

			return s;
		});
	};

	/**
	 * Executes a precompiled
	 * @method compile
	 * 
	 * @param {String} template Template string or precompiled tempalte
	 * 
	 * @returns {String} Returns executed template
	 */
	FireTPL.compile = function(template) {
		if (!/^s\+=\'/.test(template)) {
			var fireTpl = new FireTPL.Compiler();
			template = fireTpl.precompile(template);
		}

		return function(data) {
			var s = '';
			var h = FireTPL.helpers;
			//jshint evil:true
			try {
				eval(template);
			}
			catch (err) {
				console.error('FireTPL parse error', err);
			}

			return s;
		};
	};

	FireTPL.registerCoreHelper();

})(FireTPL);