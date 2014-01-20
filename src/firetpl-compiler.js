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

		this.nextScope = 0;
		this.curScope = ['root'];
		this.out = { root: '' };
	};

	/**
	 * Precompiles a .tmpl file
	 * 
	 * @method precompile
	 * @param {String} tmpl Tmpl source
	 * @return {Function} Returns a parsed tmpl source as a function.
	 */
	Compiler.prototype.precompile = function(tmpl) {
		var match,
			attrs = '',
			res,
			statement,
			curItem = null,
			prevItem = null;

		if (!tmpl && this.tmpl) {
			tmpl = this.tmpl;
		}

		this.pattern.lastIndex = 0;
		this.indention = -1;
		this.closer = [];
		this.curScope = ['root'];
		this.out = { root: '' };
		this.lastItemType = 'code';
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
				this.append('str', matchContent.replace(/\'/g, '\\\'').replace(/\$([a-zA-Z0-9._-]+)/g, '\'+data.$1+\'').replace(/@([a-zA-Z0-9._-]+)/g, '\'+lang.$1+\''));
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

				this.append('str', matchString.replace(/\'/g, '\\\'').replace(/\$([a-zA-Z0-9._-]+)/g, '\'+data.$1+\'').replace(/@([a-zA-Z0-9._-]+)/g, '\'+lang.$1+\''));
				this.closer.push('');
			}
			else if (matchAttribute) {
				res = this.stripAttributes(matchAttribute);
				if (res) {
					attrs = ' ' + res.attrs.join(' ');

					if (res.events.length !== 0) {
						this.registerEvent(res.events);
					}

					this.out[this.curScope[0]] = this.out[this.curScope[0]].replace(/\>$/, attrs.replace(/\$([a-zA-Z0-9._-]+)/g, '\'+data.$1+\'').replace(/@([a-zA-Z0-9._-]+)/g, '\'+lang.$1+\'') + '>');
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

		return this.out[this.curScope[0]];
	};

	Compiler.prototype.parseHelper = function(helper, content) {
		console.log('Parse helper', helper, content);
		var scopeId,
			tag = 'div',
			tagAttrs = '';

		if (helper === 'else') {
			tag = null;
			tagAttrs = '';
			scopeId = this.scopeId;
		}
		else {
			scopeId = this.getNextScope();
		}

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
			this.parseTag(tag, tagAttrs);
			this.injectClass('xq-scope xq-scope' + scopeId);
		}

		if (content) {
			content = content.trim();
			content = content.replace(/\$([a-zA-Z0-9._-]+)/g, 'data.$1');
		}


		this.newScope(scopeId);

		if (helper === 'if') {
			this.append('code', 'var c=' + content + ';var r=h.if(c,function(data){var s=\'\';');
			this.closer.push(['code', 'return s;});s+=r;']);
		}
		else if (helper === 'else') {
			this.append('code', 'if(!r){s+=h.else(c,function(data){var s=\'\';');
			this.closer.push(['code', 'return s;});}']);
		}
		else {
			this.append('code', 's+=h.' + helper + '(' + content + ',function(data){var s=\'\';');
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

		this.append('str', '<' + tag + attrs.replace(/\$([a-zA-Z0-9._-]+)/g, '\'+data.$1+\'').replace(/@([a-zA-Z0-9._-]+)/g, '\'+lang.$1+\'') + '>');
		this.append('str', tagContent);
		this.closer.push(this.voidElements.indexOf(tag) === -1 ? '</' + tag + '>' : '');
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
		if (Array.isArray(el)) {
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
		var pattern = /(?:@([a-zA-Z0-9._-]+))|(?:\$([a-zA-Z0-9._-]+))|(?:(?:(on[A-Z][a-zA-Z0-9-]+)|([a-zA-Z0-9-]+))=((?:\"[^\"]+\")|(?:\'[^\']+\')|(?:\S+)))/g;
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
				content.push('\'+data.' + match[2] + '+\'');
			}
			if (match[3]) {
				events.push(match[3].substr(2).toLowerCase() + ':' + match[5]);
			}
			else if (match[4]) {
				attrs.push(match[4] + '="' + match[5] + '"');
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
			str = str.replace(/\$([a-zA-Z0-9._-]+)/g, 'data.$1');
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
		this.out[scope] = '';
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
		return compiler.precompile(tmpl);
	};

})(FireTPL);