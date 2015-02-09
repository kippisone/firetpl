/*!
 * FireTPL template engine v<%= pkg.version %>
 * 
 * <%= pkg.description %>
 *
 * FireTPL is licensed under MIT License
 * http://opensource.org/licenses/MIT
 *
 * Copyright (c) 2013 - <%= grunt.template.today("yyyy") %> Noname Media, http://noname-media.com
 * Author Andi Heinkelein <andi.oxidant@noname-media.com>
 *
 */

var FireTPL;

(function (root, factory) {
	/*global define:false */
	'use strict';

	if (typeof define === 'function' && define.amd) {
		define('firetpl', [], factory);
	} else if (typeof module !== 'undefined' && module.exports) {
		module.exports = factory();
	} else {
		root.FireTPL = factory();
	}
}(this, function () {
	'use strict';

	/**
	 * FireTPL template engine
	 *
	 * @module  FireTPL
	 *
	 * @example {js}
	 * var fireTPL = new FireTPL();
	 * var tmpl = fireTpl.compile('div $name');
	 * var html = tmpl({
	 *   name: 'Andi'
	 * });
	 *
	 * // html = <div>Andi</div>
	 */
	FireTPL = {
		version: '<%= pkg.version %>'
	};

	return FireTPL;
}));