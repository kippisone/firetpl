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
(function(FireTPL, undefined) {
	'use strict';

	var Parser = function() {

	};

	Parser.prototype.parse = function() {
		
	};

	Parser.prototype.getSyntaxConf = function(type) {
		var syntaxConf = FireTPL.loadFile('syntax/' + type + '/' + type + '.json');
		if (syntaxConf) {
			syntaxConf = JSON.parse(syntaxConf);
		}

		var pat = [];
		syntaxConf.patterns.forEach(function(p) {
			pat.push(p.match);
		});

		pat = '(' + pat.join(')|(') + ')';
		return pat;
	};

	FireTPL.Parser = Parser;

})(FireTPL);
/**
 * FireTPL compiler module
 *
 * Usage:
 * var fireTPLCompiler = new FireTPL.Compiler();
 * var precompiled = fireTPLCompiler.precompile('./views/template.ftl');
 *
 * @module FireTPL.Compiler
 */
(function(FireTPL, undefined) {
	/*global define:false */
	'use strict';

	var Compiler = function() {
		this.indentionPattern = /\t/g;
		this.pattern = /^([ \t]*)?(\/\/.*)?(?:\:([a-zA-Z0-9]+))?([a-zA-Z0-9]+=(?:(?:\"[^\"]+\")|(?:\'[^\']+\')|(?:\S+)))?([a-z0-9]+)?([\"].*[\"]?)?([\'].*[\']?)?(.*)?$/gm;
		this.voidElements = ['area', 'base', 'br', 'col', 'embed', 'img', 'input', 'link', 'meta', 'param', 'source', 'wbr'];

		this.reset();
	};

	Compiler.prototype.reset = function() {
		this.pattern.lastIndex = 0;
		this.indention = -1;
		this.closer = [];
		this.curScope = ['root'];
		this.out = { root: '' };
		this.lastItemType = 'code';
		this.nextScope = 0;
	};

	/**
	 * Precompiles a .tmpl file
	 * 
	 * @method precompile
	 * @param {String} tmpl Tmpl source
	 * @return {Function} Returns a parsed tmpl source as a function.
	 */
	Compiler.prototype.precompile = function(tmpl) {
		this.reset();
		var match,
			attrs = '',
			res,
			statement,
			curItem = null,
			prevItem = null;

		if (!tmpl && this.tmpl) {
			tmpl = this.tmpl;
		}

		var d = 10000;

		prevItem = curItem;
		curItem = null;

		do {
			// console.log('Pat:', this.pattern, tmpl);
			match = this.pattern.exec(tmpl);

			if (!match) {
				break;
			}

			// console.log('Match', match);
			var isEmptyLine = /^\s*$/.test(match[0]),
				matchIndention = match[1],
				matchComment = match[2],
				matchHelper = match[3],
				matchAttribute = match[4],
				matchTag = match[5],
				matchString = match[6],
				matchHTML = match[7],
				matchContent = match[8];

			//Reset attributes
			attrs = '';

			if (--d < 0) {
				throw 'Never ending loop!';
			}

			//It's an empty line or a comment
			if (!match[0] || isEmptyLine || matchComment) {
				continue;
			}

			//Handle indention
			this.handleIndention(matchIndention);

			if (matchHelper) {
				var helper = this.parseHelper(matchHelper, matchContent);

			}
			else if (matchTag) {
				this.parseTag(matchTag, matchContent);
			}
			else if (matchContent) {
				//It's a string
				this.append('str', this.parseVariables(matchContent));
				this.closer.push('');
			}
			else if (matchString) {
				//It's a string
				
				var strPattern,
					strMatch;

				if (matchString.substr(-1) === '"') {
					matchString = matchString.substr(1, matchString.length - 2);
				}
				else {
					strPattern = /([^\"]*)\"/g;
					strPattern.lastIndex = this.pattern.lastIndex;
					strMatch = strPattern.exec(tmpl);
					matchString = matchString.substr(1) + ' ' + strMatch[1].trim();
					this.pattern.lastIndex = strPattern.lastIndex;
				}

				//Check for multi text blocks
				while (true) {
					strPattern = /^(\n[\t]*)(\n[\t]*)?\"([^\"]*)\"/g;
					strMatch = strPattern.exec(tmpl.substr(this.pattern.lastIndex));
					if (strMatch) {
						this.pattern.lastIndex += strPattern.lastIndex;
						if (strMatch[2]) {
							matchString += '<br>';
						}

						matchString += '<br>' + strMatch[3].replace(/\s+/g, ' ');
					}
					else {
						break;
					}
				}

				this.append('str', this.parseVariables(matchString));
				this.closer.push('');
			}
			else if (matchAttribute) {
				res = this.stripAttributes(matchAttribute);
				if (res) {
					attrs = ' ' + res.attrs.join(' ');

					if (res.events.length !== 0) {
						this.registerEvent(res.events);
					}

					this.out[this.curScope[0]] = this.out[this.curScope[0]].replace(/\>$/, this.parseVariables(attrs) + '>');
				}
				else {
					throw 'FireTPL parse error (3)';
				}

				this.closer.push('');
			}
			else {
				throw 'FireTPL parse error (1)';
			}


		} while (match[0]);

		// console.log('Closer', this.closer.length, this.closer);
		while (this.closer.length > 0) {
			this.appendCloser();
		}

		if (this.lastItemType === 'str') {
			this.out[this.curScope[0]] += '\';';
		}

		// return this.out[this.curScope[0]];
		return this.getOutStream();
	};

	Compiler.prototype.getOutStream = function() {
		var outStream = 'scopes=scopes||{};var root=data,parent=data;';
		var keys = Object.keys(this.out);

		keys = keys.sort(function(a, b) {
			return b.localeCompare(a);
		});

		keys.forEach(function(key) {
			if (key === 'root') {
				return;
			}

			outStream += 'scopes.' + key + '=function(data,parent){var s=\'\';' + this.out[key] + 'return s;};';
		}.bind(this));

		outStream += 'var s=\'\';';
		outStream += this.out.root;

		return outStream;
	};

	Compiler.prototype.parseHelper = function(helper, content) {
		// console.log('Parse helper', helper, content);
		var scopeId,
			tag = 'div',
			tagAttrs = '';

		if (helper === 'else') {
			this.newScope('scope' + this.lastIfScope);
			this.append('code', 'if(!r){s+=h.else(c,function(data){var s=\'\';');
			this.closer.push(['code', 'return s;});}']);
			return;
		}
		this.lastIfScope= null;
		scopeId = this.getNextScope();

		if (content) {
			var pattern = /(".*")?(?:\s*:\s*)([a-zA-Z0-9]+)(.*)/;
			var match = content.split(pattern);
			// console.log('Split', match);
			if (match && match[2]) {
				tag = match[2];
				tagAttrs = match[3];
				content = match[0] + (match[1] ? match[1] : '');
			}
		}

		if (tag) {
			this.parseTag(tag, tagAttrs + ' xq-scope=scope' + scopeId + ' xq-path=' + content.trim().replace(/^\$/, ''));
			this.injectClass('xq-scope xq-scope' + scopeId);
		}

		if (content) {
			content = content.trim();
			content = this.parseVariables(content, true);
		}

		this.append('code', 's+=scopes.scope' + scopeId + '(' + content + ',data);');
		this.newScope('scope' + scopeId);

		if (helper === 'if') {
			this.lastIfScope = scopeId;
			this.append('code', 'var c=data;var r=h.if(c,function(data){var s=\'\';');
			this.closer.push(['code', 'return s;});s+=r;']);
		}
		else {
			this.append('code', 's+=h.' + helper + '(data,function(data){var s=\'\';');
			this.closer.push(['code', 'return s;});']);
		}

		// this.appendCloser();
	};

	Compiler.prototype.parseTag = function(tag, content) {
		// console.log('Parse tag', tag, content);

		var tagContent = '',
			res,
			attrs = '';

		if (content) {
			res = this.stripAttributes(content);
			if (res) {
				if (res.attrs) {
					attrs += ' ' + res.attrs.join(' ');
				}

				if (res.events.length !== 0) {
					//this.registerEvent(res.events);
					//TODO better event register method
					var events = res.events;
					attrs += ' on="' + events.join(';') + '"';
				}

				if (attrs === ' ') {
					attrs = '';
				}

				if (res.content) {
					tagContent = res.content.join(' ');
				}
			}
		}

		this.append('str', '<' + tag + this.parseVariables(attrs) + '>');
		this.append('str', tagContent);
		this.closer.push(this.voidElements.indexOf(tag) === -1 ? '</' + tag + '>' : '');
	};

	Compiler.prototype.parseVariables = function(str, isCode) {
		var opener = '',
			closer = '';

		if (!isCode) {
			opener = '\'+';
			closer = '+\'';
		}

		str = str
			.replace(/\'/g, '\\\'')
			.replace(/\$([a-zA-Z0-9._-]+)/g, function(match, p1) {

					console.log('P!',p1);
				if (/^this\b/.test(p1)) {
					return opener + p1.replace(/^this/, 'data') + closer;
				}
				else if (/^(parent\b|root\b)/.test(p1)) {
					return opener + p1 + closer;
				}
				
				return opener + 'data.' + p1 + closer;
				
			})
			.replace(/@([a-zA-Z0-9._-]+)/g, '\'+lang.$1+\'');

		return str;
	};

	/**
	 * Append something to the out String
	 *
	 * @method append
	 * @private
	 * @param String type Content type (str|code)
	 * @param String str Output str
	 */
	Compiler.prototype.append = function(type, str) {
		if (type === this.lastItemType) {
			this.out[this.curScope[0]] += str;
		}
		else if(type === 'str') {
			this.out[this.curScope[0]] += 's+=\'' + str;
		}
		else if(type === 'code') {
			this.out[this.curScope[0]] += '\';' + str;
		}
		else {
			throw 'Wrong data type in .appand()';
		}

		this.lastItemType = type;
	};

	/**
	 * Append closer tag to outstr	
	 *
	 * @method appendCloser
	 * @private
	 */
	Compiler.prototype.appendCloser = function() {
		var el = this.closer.pop() || '';
		if (el === 'scope') {
			//Scope change
			this.append('code', '');
			var scope = this.curScope.shift();
			this.appendCloser();
		}
		else if (Array.isArray(el)) {
			this.append(el[0], el[1]);
		}
		else {
			this.append('str', el);
		}
	};

	/**
	 * Get indention of current line
	 * 
	 * @method getIndention
	 * @private
	 * @param {String} str Line string
	 * @returns {Number} Returns num of indention
	 */
	Compiler.prototype.getIndention = function(str) {
		var i = 0;

		this.indentionPattern.lastIndex = 0;
		while(this.indentionPattern.test(str)) {
			i++;
		}

		return i;
	};

	/**
	 * Strip all attributes and events from a string
	 *
	 * returns: {
	 *   attrs: ['foo=bar', 'bal=blubb']
	 *   events: [['eventName', 'eventTrigger'], n...]
	 * }
	 *
	 * @method getIndention
	 * @private
	 * @param  {String} str Strong to parse
	 * @return {Object}     Returns an object with all atttibutes and events or null
	 */
	Compiler.prototype.stripAttributes = function(str) {
		var pattern = /(?:@([a-zA-Z0-9._-]+))|(?:(\$[a-zA-Z0-9._-]+))|(?:(?:(on[A-Z][a-zA-Z0-9-]+)|([a-zA-Z0-9-]+))=((?:\"[^\"]+\")|(?:\'[^\']+\')|(?:\S+)))/g;
		var attrs = [],
			events = [],
			content = [],
			d = 1000,
			match;

		match = pattern.exec(str);
		while (match) {
			if (!match[0]) {
				break;
			}

			if (--d < 0) {
				throw 'Never ending loop!';
			}

			if (match[1]) {
				content.push('\'+lang.' + match[1] + '+\'');
			}
			if (match[2]) {
				content.push(this.parseVariables(match[2]));
			}
			if (match[3]) {
				events.push(match[3].substr(2).toLowerCase() + ':' + match[5]);
			}
			else if (match[4]) {
				attrs.push(match[4] + '="' + match[5].replace(/^\"|\'/, '').replace(/\"|\'$/, '') + '"');
			}

			match = pattern.exec(str);
		}

		return attrs.length || events.length || content.length ? {
			attrs: attrs,
			events: events,
			content: content
		} : null;
	};

	/**
	 * Parse a statement string
	 *
	 * @method parseStatement
	 * @private
	 * @param String statement Statemant
	 * @param String str Input string
	 */
	Compiler.prototype.parseStatement = function(statement, str) {
		if (str) {
			str = str.trim();
			str = this.parseVariables(str);
		}

		if (statement === 'if') {
			return ['var c=' + str + ';var r=h.if(c,function(data){var s=\'\';', 'return s;});s+=r;'];
		}
		else if (statement === 'else') {
			return ['if(!r){s+=h.else(c,function(data){var s=\'\';', 'return s;});}'];
		}
		else {
			return ['s+=h.' + statement + '(' + str + ',function(data){var s=\'\';', 'return s;});'];
		}
	};

	/**
	 * Handle indention
	 *
	 * @param {String} str Indention string
	 * @method handleIndention
	 */
	Compiler.prototype.handleIndention = function(str) {
		var indention = this.getIndention(str),
			newIndent = indention - this.indention,
			el;

		// console.log('Outdent', this.indention, indention, newIndent);
		if (newIndent === 0) {
			this.appendCloser();
		}
		else {
			while (newIndent < 1) {
				// console.log('Outdent', this.closer);
				el = this.appendCloser();
				newIndent++;
			}
		}
				
		this.indention = indention;
	};

	/**
	 * Get next scope id
	 *
	 * @method getNextScope
	 */
	Compiler.prototype.getNextScope = function() {
		return this.nextScope < 1000 ? '00' + String(++this.nextScope).substr(-3) : '' + (++this.nextScope);
	};

	/**
	 * Inject a previous tag with a class
	 *
	 * @method injectClass
	 * @param {String} className Class names to be injected
	 */
	Compiler.prototype.injectClass = function(className) {
		var startPos = this.out[this.curScope[0]].lastIndexOf('<');
		var tag = this.out[this.curScope[0]].slice(startPos);
		// console.log('Out before inject: ', this.out[this.curScope[0]], tag);
		
		if (!/^<[a-z0-9]+/.test(tag)) {
			throw 'An each statement must be within a block element!';
		}

		tag = tag.replace(/(?:class="([^"]*)")|(>)$/, function(match, p1, p2) {
			// console.log('Inject args:', match, p1, p2);
			if (p1) {
				return 'class="' + p1 + ' ' + className + '"';
			}

			return ' class="' + className + '">';
		});

		this.out[this.curScope[0]] = this.out[this.curScope[0]].slice(0, startPos) + tag;
	};

	/**
	 * Add and change scope
	 * @method newScope
	 * @param {String} scope New scope
	 */
	Compiler.prototype.newScope = function(scope) {
		this.curScope.unshift(scope);
		this.out[scope] = this.out[scope] || '';
		this.closer.push('scope');
		//this.append('code', '');
		this.lastItemType = 'code';
	};

	FireTPL.Compiler = Compiler;

	/* +---------- FireTPL methods ---------- */

	FireTPL.loadFile = function(src) {
		var content = '';

		if (typeof XMLHttpRequest === 'undefined') {
			console.warn('Don\'t use FireTPL.loadFile() on node.js');
			return;
		}

		var xhr = new XMLHttpRequest();
		xhr.open('GET', src, false);
		xhr.send();


		if (xhr.readyState === 4) {
			if (xhr.status === 200) {
				content = xhr.responseText;
			}
			else if (xhr.status === 404) {
				console.error('Loading a FireTPL template failed! Template wasn\'t found!');
			}
			else {
				console.error('Loading a FireTPL template failed! Server response was: ' + xhr.status + ' ' + xhr.statusText);
			}
		}

		return content;
	};

	FireTPL.precompile = function(tmpl) {
		var compiler = new FireTPL.Compiler();
		compiler.precompile(tmpl);
		return compiler.getOutStream();
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
		if (!/^scopes=scopes/.test(template)) {
			var fireTpl = new FireTPL.Compiler();
			template = fireTpl.precompile(template);
		}

		return function(data, scopes) {
			var h = FireTPL.helpers;
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