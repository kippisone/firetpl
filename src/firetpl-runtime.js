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
		var s, h;
		
		if (!/^s\+=\'/.test(template)) {
			var fireTpl = new FireTPL.Compiler();
			template = fireTpl.precompile(template);
		}

		s = '';
		h = this.helpers;
			
		return function(data) {
			// console.log('Out:', template);
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