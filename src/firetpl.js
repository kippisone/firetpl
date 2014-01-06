/*!
 * FireTPL template engine v<%= pkg.version %>
 * 
 * <%= pkg.description %>
 *
 * FireTPL is licenced under MIT Licence
 * http://opensource.org/licenses/MIT
 *
 * Copyright (c) 2013 - <%= grunt.template.today("yyyy") %> Noname Media, http://noname-media.com
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
		version: '<%= pkg.version %>'
	};

	return FireTPL;
}));