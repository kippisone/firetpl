/*!
 * FireTPL template engine v0.1.0-27
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
		version: '0.1.0-27'
	};

	return FireTPL;
}));
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

	var Compiler = function(options) {
		options = options || {};

		this.scopeTags = !!options.scopeTags;

		this.indentionPattern = /\t| {4}/g;
		this.pattern = /^([ \t| {4}]*)?(\/\/.*)?(?:\:([a-zA-Z0-9]+))?([a-zA-Z0-9]+=(?:(?:\"[^\"]+\")|(?:\'[^\']+\')|(?:\S+)))?([a-z0-9]+)?([\"].*[\"]?)?([\'].*[\']?)?(.*)?$/gm;
		this.voidElements = ['area', 'base', 'br', 'col', 'embed', 'img', 'input', 'link', 'meta', 'param', 'source', 'wbr'];

		this.reset();
		
		/**
		 * Set the log level.
		 * 
		 * Levels are:
		 *
		 * 4 DEBUG
		 * 3 INFO
		 * 2 WARN
		 * 1 ERROR
		 * @type {Number}
		 */
		this.logLevel = 1;
	};

	Compiler.prototype.reset = function() {
		this.pattern.lastIndex = 0;
		this.indention = 0;
		this.closer = [];
		this.curScope = ['root'];
		this.out = { root: '' };
		this.lastItemType = 'code';
		this.nextScope = 0;
		this.pos = 0;
		this.addEmptyCloseTags = false;

	};

	Compiler.prototype.getPattern = function(type) {
		var pattern = this.syntax[type].patterns.map(function(pat) {
			return pat.match;
		});

		pattern = pattern.join('|');

		var modifer = this.syntax[type].modifer;

		var scopes = this.syntax[type].scopes;

		return {
			pattern: new RegExp(pattern, modifer),
			scopes: scopes
		};
	};

	Compiler.prototype.parse = function(tmpl, type) {
		type = type || 'fire';

		if (this.logLevel & 4) {
			console.log('Parse a .' + type + ' Template');
		}

		this.reset();
		this.addEmptyCloseTags = this.syntax[type].addEmptyCloseTags || false;
		var syntaxConf = this.getPattern(type);

		var match,
			attrs = '',
			res,
			statement,
			curItem = null,
			prevItem = null,
			cmd,
			data;

		if (!tmpl && this.tmpl) {
			tmpl = this.tmpl;
		}

		var d = 10000;

		prevItem = curItem;
		curItem = null;

		do {
			syntaxConf.pattern.lastIndex = this.pos;
			match = syntaxConf.pattern.exec(tmpl);
			this.pos = syntaxConf.pattern.lastIndex;

			// console.log('Pat:', syntaxConf.pattern.lastIndex, syntaxConf.pattern.source, tmpl);
			if (this.logLevel & 4) {
				console.log('Match:', match);
			}
			// console.log('Pos start:', this.pos, tmpl.substr(this.pos, 20));

			if (!match) {
				break;
			}

			cmd = null;
			data = {};
			for (var i = 1, len = match.length; i < len; i++) {
				if (match[i] !== undefined) {
					if (cmd === null) {
						cmd = syntaxConf.scopes[i];
					}

					data[syntaxConf.scopes[i]] = match[i];
				}
			}

			if (this.logLevel & 4) {
				console.log('  cmd:', cmd, 'data:', data);
			}

			switch(cmd) {
				case 'indention':
					this.handleIndention(data.indention);
					break;
				case 'tag':
					this.parseTag(data.tag, data.tagAttributes);
					break;
				case 'endtag':
					this.parseEndTag(data.endtag);
					break;
				case 'helper':
					this.parseHelper(data.helper, (type === 'hbs' ? '$' : '') + data.expression);
					break;
				case 'helperEnd':
					this.parseHelperEnd(data.helperEnd);
					break;
				case 'attribute':
					this.parseAttribute(data.attribute);
					break;
				case 'string':
					this.parseString(tmpl, data.string);
					break;
				case 'variable':
					this.parseVariable(data.variable);
					break;
				case 'newline':
					this.handleIndention(data.newline);
					break;
				case 'unused':
					break;
				default:
					throw new Error('Parse error!');
			}


		} while (true);

		while (this.closer.length > 0) {
			this.appendCloser();
		}

		return this.getOutStream();
	};

	/**
	 * Precompiles a .tmpl file
	 * 
	 * @method precompile
	 * @param {String} tmpl Tmpl source
	 * @return {Function} Returns a parsed tmpl source as a function.
	 */
	Compiler.prototype.precompile = function(tmpl, type) {
		return this.parse(tmpl, type);
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

		if (this.lastItemType === 'str') {
			outStream += '\';';
		}

		return outStream;
	};

	Compiler.prototype.parseHelper = function(helper, content) {
		// console.log('Parse helper', helper, content);
		var scopeId,
			tag = null,
			tagAttrs = '';

		if (helper === 'else') {
			this.closer.push(['code', '']);
			this.newScope(this.lastIfScope);
			this.append('code', 'if(!r){s+=h.exec(\'else\',c,parent,root,function(data){var s=\'\';');
			this.closer.push(['code', 'return s;});}']);
			this.closer.push('scope');
			return;
		}

		// this.lastIfScope = null;
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
			this.parseTag(tag, tagAttrs);
		}
		else {
			this.closer.push('');
		}

		if (content) {
			content = content.trim();
			content = this.parseVariables(content, true);
		}

		if (this.scopeTags) {
			this.append('str', '<scope id="scope' + scopeId + '" path="' + content + '"></scope>');
		}
		else {
			this.append('code', 's+=scopes.scope' + scopeId + '(' + content + ',data);');
		}
		
		this.newScope('scope' + scopeId);

		if (helper === 'if') {
			// this.lastIfScope = scopeId;
			this.append('code', 'var c=data;var r=h.exec(\'if\',c,parent,root,function(data){var s=\'\';');
			this.closer.push(['code', 'return s;});s+=r;']);
		}
		else {
			this.append('code', 's+=h.exec(\'' + helper + '\',data,parent,root,function(data){var s=\'\';');
			this.closer.push(['code', 'return s;});']);
		}

		this.closer.push('scope');
		// this.appendCloser();
	};

	Compiler.prototype.parseTag = function(tag, content) {
		var tagContent = '',
			res,
			attrs = [];

		if (content) {
			res = this.stripAttributes(content);
			if (res) {
				if (res.attrs) {
					attrs = attrs.concat(res.attrs);
				}

				if (res.events.length !== 0) {
					//this.registerEvent(res.events);
					//TODO better event register method
					var events = res.events;
					attrs.push('on="' + events.join(';') + '"');
				}

				if (res.content) {
					tagContent = res.content.join(' ');
				}
			}
		}

		attrs = attrs.join(' ');
		if (attrs) {
			attrs = ' ' + attrs;
		}

		this.append('str', '<' + tag + this.parseVariables(attrs) + '>');
		this.append('str', tagContent);
		if (this.voidElements.indexOf(tag) === -1) {
				this.closer.push('</' + tag + '>');
		}
		else {
			if (this.addEmptyCloseTags) {
				this.closer.push('');
			}
		}
	};

	Compiler.prototype.parseAttribute = function(attribute) {
		var res = this.stripAttributes(attribute);
		if (res) {
			var attrs = ' ' + res.attrs.join(' ');

			if (res.events.length !== 0) {
				this.registerEvent(res.events);
			}

			this.out[this.curScope[0]] = this.out[this.curScope[0]].replace(/\>$/, this.parseVariables(attrs) + '>');
		}
		else {
			throw 'FireTPL parse error (3)';
		}

		this.closer.push('');
	};

	Compiler.prototype.parseString = function(tmpl, matchString) {
		var strPattern,
			strMatch;

		//Remove multiplr whitespaces
		matchString = matchString.replace(/\s+/g, ' ');

		if (matchString.charAt(0) === '"') {
			if (matchString.substr(-1) === '"') {
				matchString = matchString.substr(1, matchString.length - 2);
			}
			else {
				strPattern = /([^\"]*)\"/g;
				strPattern.lastIndex = this.pos;
				strMatch = strPattern.exec(tmpl);
				matchString = matchString.substr(1) + ' ' + strMatch[1].trim();
				this.pos = strPattern.lastIndex;
			}

			//Check for multi text blocks
			while (true) {
				strPattern = /^(\n[\t| {4}]*)?(\n[\t| {4}]*)*\"([^\"]*)\"/g;
				strMatch = strPattern.exec(tmpl.substr(this.pos));
				if (strMatch) {
					this.pos += strPattern.lastIndex;
					if (strMatch[2]) {
						matchString += '<br>';
					}

					matchString += '<br>' + strMatch[3].replace(/\s+/g, ' ');
				}
				else {
					break;
				}
			}
		}

		this.append('str', this.parseVariables(matchString));
		if (this.addEmptyCloseTags) {
			this.closer.push('');
		}
	};

	Compiler.prototype.parseEndTag = function(tag) {
		// console.log('Parse end tag', tag, this.closer);
		this.appendCloser();
	};

	Compiler.prototype.parseHelperEnd = function() {
		this.appendCloser();
	};

	Compiler.prototype.parseVariables = function(str, isCode) {
		var opener = '',
			closer = '',
			altOpener = '',
			altCloser = '',
			prefix = 'data.',
			self = this;

		if (this.scopeTags && !isCode) {
			opener = '<scope path="';
			closer = '"></scope>';
			altOpener = '\'+';
			altCloser = '+\'';
			prefix = '';
		}
		else if (!this.scopeTags && !isCode) {
			opener = '\'+';
			closer = '+\'';
		}

		var parseVar = function(m) {
			if (m === '') {
				if (self.scopeTags) {
					return '\'+data+\'';
				}
				return opener + 'data' + closer;
			}

			if (/^(parent\b)/.test(m) && (self.curScope[1] === 'root' || !self.scopeTags)) {
				if (self.scopeTags) {
					m = m.replace(/^parent\.?/, '');
				}

				if (m) {
					return opener + m + closer;
				}
				else if (self.scopeTags) {
					return altOpener + 'parent' + altCloser;
				}
				else {
					return opener + 'parent' + closer;
				}
			}
			else if (/^(root\b)/.test(m)) {
				if (self.scopeTags) {
					m = m.replace(/^root\.?/, '');
				}
				
				if (m) {
					return opener + m + closer;
				}
				else if (self.scopeTags) {
					return altOpener + 'root' + altCloser;
				}
				else {
					return opener + 'root' + closer;
				}
			}
			else if (self.curScope[0] === 'root' && !isCode) {
				return opener + prefix + m + closer;
			}
			else if (self.scopeTags) {
				prefix = isCode ? '' : 'data.';
				return altOpener + prefix + m + altCloser;
			}
			else {
				return opener + 'data.' + m + closer;
			}
		};

		str = str
			.replace(/\'/g, '\\\'')
			// .replace(/\$([a-zA-Z0-9._-]+)/g, function(match, p1) {
			.replace(/\$((\{([a-zA-Z0-9._-]+)\})|([a-zA-Z0-9._-]+))/g, function(match, p1, p2, p3, p4) {
				var m = p3 || p4;
				if (/^this\b/.test(m)) {
					return parseVar(m.replace(/^this\.?/, ''));
				}
				
				return parseVar(m);
				
			})
			.replace(/@([a-zA-Z0-9._-]+)/g, '\'+l.$1+\'');

		return str;
	};

	Compiler.prototype.parseVariable = function(matchVariable) {
		this.append('str', this.parseVariables(matchVariable));
		this.closer.push('');
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

		return str;
	};

	/**
	 * Append closer tag to outstr	
	 *
	 * @method appendCloser
	 * @private
	 */
	Compiler.prototype.appendCloser = function() {
		var el = this.closer.pop() || '';
		if (!el) {
			return;
		}

		if (el === 'scope') {
			//Scope change
			this.appendCloser();
			this.append('code', '');
			var scope = this.curScope.shift();
			this.lastIfScope = scope;
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
		var pattern = /(?:@([a-zA-Z0-9._-]+))|(?:(\$[a-zA-Z0-9._-]+))|(?:(?:(on[A-Z][a-zA-Z0-9-]+)|([a-zA-Z0-9-]+))=((?:\"[^\"]*\")|(?:\'[^\']+\')|(?:\S+))|(\"[^\"]*\"))/g;
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
				content.push('\'+l.' + match[1] + '+\'');
			}
			if (match[2]) {
				content.push(this.parseVariables(match[2]));
			}
			if (match[3]) {
				events.push(match[3].substr(2).toLowerCase() + ':' + match[5].replace(/^\"|\'/, '').replace(/\"|\'$/, ''));
			}
			else if (match[4]) {
				attrs.push(match[4] + '="' + match[5].replace(/^\"|\'/, '').replace(/\"|\'$/, '') + '"');
			}
			else if (match[6]) {
				content.push(match[6].replace(/^\"|\'/, '').replace(/\"|\'$/, ''));
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

		if (this.logLevel & 4) {
			console.log('  Parse indention:', indention, this.indention, newIndent);
		}

		if (newIndent === 0) {
			this.appendCloser();
		}
		else {
			while (newIndent < 1) {
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
		this.append('code', '');
		this.curScope.unshift(scope);
		this.out[scope] = this.out[scope] || '';
	};

	Compiler.prototype.getPatternByName = function(type, name) {
		var pattern = this.syntax[type].patterns;
		for (var i = 0, len = pattern.length; i < len; i++) {
			if (pattern[i].name === name) {
				return pattern[i].match;
			} 
		}
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

	FireTPL.precompile = function(tmpl, options) {
		options = options || {};

		if (!options.name) {
			console.error('Precompilation not possible! The options.name flag must be set!');
			return;
		}

		options.firetplModule = options.firetplModule || 'firetpl';

		var compiler = new FireTPL.Compiler(options),
			tplName = options.name;

		compiler.precompile(tmpl);
		var precompiled = compiler.getOutStream();

		if (options.verbose) {
			console.log('\n---------- begin of precompiled file ----------\n');
			console.log(precompiled);
			console.log('\n----------- end of precompiled file -----------\n');
			console.log('size: ', precompiled.length, 'chars\n');
		}

		var output = '';
		if (options.commonjs) {
			output += ';(function(require) {var FireTPL = require(\'' + options.firetplModule + '\');';
		}
		else if (options.amd) {
			output += 'define(' + (options.moduleName ? '\'' + options.moduleName + '\',' : '') + '[\'' + options.firetplModule + '\'],function(FireTPL) {';
		}
		else if (options.scope) {
			output = ';(function(FireTPL) {';
		}

		output += 'FireTPL.templateCache[\'' + tplName + '\']=function(data,scopes) {var h=new FireTPL.Runtime(),l=FireTPL.locale;' + precompiled + 'return s;};';

		if (options.commonjs) {
			output += '})(require);';
		}
		else if(options.amd) {
			output += '});';
		}
		else if (options.scope) {
			output += '})(FireTPL);';
		}

		return output;
	};

	FireTPL.fire2html = function(tmpl, data) {
		data = data || {};

		template = FireTPL.Compile(tmpl);
		return template(data);
	};

})(FireTPL);
FireTPL.Compiler.prototype.syntax = FireTPL.Compiler.prototype.syntax || {};
FireTPL.Compiler.prototype.syntax["fire"] = {
	"name": "FireTPL",
	"patterns": [
		{
			"name": "empty-line",
			"match": "(\\n?^\\s+$)"
		}, {
			"name": "indention",
			"match": "(^[ \\t]+)"
		}, {
			"name": "helper",
			"match": "(?::([a-zA-Z][a-zA-Z0-9_-]*)\\s*((?:\\$[a-zA-Z][a-zA-Z0-9._-]*)(?:\\s*:.*)?)?)"
		}, {
			"name": "string",
			"match": "(\\\"[^\\\"]*\\\")"
		}, {
			"name": "attribute",
			"match": "(\\b[a-zA-Z0-9_]+=(?:(?:\\\"[^\\\"]*\\\")|(?:\\S+)))"
		}, {
			"name": "tag",
			"match": "(?:([a-zA-Z][a-zA-Z0-9:_-]*)+(?:(.*))?)"
		}, {
			"name": "variable",
			"match": "([@\\$][a-zA-Z][a-zA-Z0-9._-]*)"
		}, {
			"name": "new-line",
			"match": "(?:\n([ \\t]*))"
		}
	],
	"modifer": "gm",
	"scopes": {
		"1": "unused",
		"2": "indention",
		"3": "helper",
		"4": "expression",
		"5": "string",
		"6": "attribute",
		"7": "tag",
		"8": "tagAttributes",
		"9": "variable",
		"10": "newline"
	},
	"addEmptyCloseTags": true
};
FireTPL.Compiler.prototype.syntax["hbs"] = {
	"name": "Handelbars",
	"patterns": [
		{
			"name": "unused",
			"match": "^([ \\t]+)"
		}, {
			"name": "tag",
			"match": "(?:<([a-zA-Z][a-zA-Z0-9:_-]*)\\b([^>]*)>)"
		}, {
			"name": "endtag",
			"match": "(?:<\\/([a-zA-Z][a-zA-Z0-9:_-]+)>)"
		}, {
			"name": "helper",
			"match": "(?:\\{\\{#([a-zA-Z][a-zA-Z0-9_-]*)(?:\\s+([^\\}]*)\\}\\})?)"
		}, {
			"name": "helperEnd",
			"match": "(?:\\{\\{\\/([a-zA-Z][a-zA-Z0-9_-]*)\\}\\})"
		}, {
			"name": "attribute",
			"match": "([a-zA-Z0-9_]+=(?:(?:\\\"[^\\\"]*\\\")|(?:\\'[^\\']*\\')|(?:\\S)))"
		}, {
			"name": "string",
			"match": "((?:.(?!<))+.)"
		}
	],
	"modifer": "gm",
	"scopes": {
		"1": "unused",
		"2": "tag",
		"3": "tagAttributes",
		"4": "endtag",
		"5": "helper",
		"6": "expression",
		"7": "helperEnd",
		"8": "attributes",
		"9": "string"
	}
};