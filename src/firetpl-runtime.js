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
	FireTPL.compile = function(template) {
		if (!/^scopes=scopes/.test(template)) {
			var fireTpl = new FireTPL.Compiler();
			template = fireTpl.precompile(template);
		}

		return function(data, scopes) {
			var h = new FireTPL.Runtime();
			var s;

			//jshint evil:true
			try {
				return eval('(function(data, scopes) {\n' + template + 'return s;})(data, scopes)');
			}
			catch (err) {
				console.error('FireTPL parse error', err);
			}

			return s;
		};
	};

	FireTPL.registerCoreHelper();

})(FireTPL);