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
 * Creation Date: 2014-01-05
 */

var FireTPL;

(function (root, factory) {
	/*global define:false */
	'use strict';

	if (typeof define === 'function' && define.amd) {
		define('xqcore', ['jquery'], factory);
	} else if (typeof module !== 'undefined' && module.exports) {
		module.exports = factory(require('jquery'));
	} else {
		root.FireTPL = factory(root.jQuery);
	}
}(this, function (jQuery) {
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

	

})(FireTPL);