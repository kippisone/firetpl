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
		this.pattern = /^([ \t]*)?(\/\/.*)?(if|end|else|each|unless)?([a-zA-Z0-9]+=(?:(?:\"[^\"]+\")|(?:\'[^\']+\')|(?:\S+)))?([a-z0-9]+)?(.*)?$/gm;

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
		this.out = '';
		this.lastItemType = 'code';
		var d = 10000;

		prevItem = curItem;
		curItem = null;

		var eventMaper = function(item) {
			return item[0] + '="p.fire(\'' + item[1] + '\')"';
		};

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
				matchStatement = match[3],
				matchAttribute = match[4],
				matchTag = match[5],
				matchContent = match[6];

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

			if (matchStatement) {
				//It's a statement
				if (matchStatement === 'each') {
					this.injectClass('xq-scope xq-scope' + this.getNextScope());
				}

				statement = this.parseStatement(matchStatement, matchContent);
				this.append('code', statement[0]);
				this.closer.push(['code', statement[1]]);
			}
			else if (matchTag) {
				if (matchContent) {
					res = this.stripAttributes(matchContent);
					if (res) {
						attrs = ' ' + res.attrs.join(' ');

						if (res.events.length !== 0) {
							//this.registerEvent(res.events);
							//TODO better event register method
							var events = res.events.map(eventMaper);
							attrs = ' ' + events.join(' ');
						}
					}
				}

				this.append('str', '<' + matchTag + attrs + '>');
				this.closer.push('</' + matchTag + '>');
			}
			else if (matchContent) {
				//It's a string
				this.append('str', matchContent.replace(/\'/g, '\\\'').replace(/\$([a-zA-Z0-9$_]+)/g, '\'+data.$1+\''));
				this.closer.push('');
			}
			else if (matchAttribute) {
				res = this.stripAttributes(matchAttribute);
				if (res) {
					attrs = ' ' + res.attrs.join(' ');

					if (res.events.length !== 0) {
						this.registerEvent(res.events);
					}

					this.out = this.out.replace(/\>$/, attrs + '>');
				}
				else {
					throw 'Parse error (3)';
				}

				this.closer.push('');
			}
			else {
				throw 'Parse error (1)';
			}


		} while (match[0]);

		// console.log('Closer', this.closer.length, this.closer);
		while (this.closer.length > 0) {
			this.appendCloser();
		}

		if (this.lastItemType === 'str') {
			this.out += '\';';
		}

		return this.out;
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
			this.out += str;
		}
		else if(type === 'str') {
			this.out += 's+=\'' + str;
		}
		else if(type === 'code') {
			this.out += '\';' + str;
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
		var pattern = /(?:(on[A-Z][a-zA-Z0-9-]+)|([a-zA-Z0-9-]+))=((?:\"[^\"]+\")|(?:\'[^\']+\')|(?:\S+))/g;
		var attrs = [],
			events = [],
			d = 1000,
			match;
		
		match = pattern.exec(str);
		while (match) {
			// console.log('Submatch',match);
			if (!match[0]) {
				break;
			}

			if (--d < 0) {
				throw 'Never ending loop!';
			}

			if (match[1]) {
				events.push([match[1], match[3]]);
			}
			else if (match[2]) {
				attrs.push(match[2] + '="' + match[3] + '"');
			}

			match = pattern.exec(str);
		}

		return attrs.length || events.length ? {
			attrs: attrs,
			events: events
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
			str = str.replace(/\$([a-zA-Z0-9$_]+)/g, 'data.$1');
		}

		/*if (statement === 'if') {
			return 'if(' + str + ')';
		}
		else if (statement === 'else') {
			str = str.replace(/\$([a-zA-Z0-9$_]+)/g, 'data.$1');
			return 'else';
		}
		else if (statement === 'unless') {
			str = str.replace(/\$([a-zA-Z0-9$_]+)/g, 'data.$1');
			return 'if(!(' + str + '))';
		}*/
		//else if (statement === 'each') {
		//	var m = /\$([a-zA-Z0-9$_]+)\s+in\s+\$([a-zA-Z0-9$_])$/.exec(str);
		//	if (m[1] && m[2]) {
		//		return 'for(var ' + m[1] + ' in data.' + m[2] + ')';
		//	}
		//	else {
		//		str = str.replace(/\$([a-zA-Z0-9$_]+)/g, 'data.$1');
		//		return 'for(var i=0,l=' + str + '.length;i<len;i++)';
		//	}
		//	
		//}
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
		var startPos = this.out.lastIndexOf('<');
		var tag = this.out.slice(startPos);
		// console.log('Out before inject: ', this.out, tag);
		
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

		this.out = this.out.slice(0, startPos) + tag;
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