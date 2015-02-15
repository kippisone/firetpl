/*!
 * FireTPL template engine v0.4.0-12
 * 
 * FireTPL is a pretty Javascript template engine
 *
 * FireTPL is licensed under MIT License
 * http://opensource.org/licenses/MIT
 *
 * Copyright (c) 2013 - 2015 Noname Media, http://noname-media.com
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
		version: '0.4.0-12'
	};

	return FireTPL;
}));
(function(FireTPL) {

    var FireError = function(instance, msg) {
        if (typeof instance === 'object') {
            // if (instance instanceof FireTPL.Parser) {
            //  var pos = instance.pos;
            //  msg = msg + '\n\n' + this.stripSource(pos, instance.tmpl);
            // }
        }
        else if (arguments.length) {
            msg = instance;
        }

        // var err = new Error(msg);
        return new Error(msg);
    };

    FireError.prototype.stripSource = function(pos, tmpl) {
        var sourceStr,
            counter = 0;

        var source = tmpl.split('\n');
        for (var i = 0, len = source.length; i < len; i++) {
            counter += source[i].length + 1; //Add +1 because line breaks
            if (counter > pos) {
                sourceStr = (source[i - 1] || '') + '\n' + (source[i]);
                sourceStr += '\n' + this.strRepeat(pos - (counter - source[i].length), ' ') + '^';
                break;
            }
        }

        return sourceStr;
    };

    FireError.prototype.strRepeat = function(num, str) {
        var out = '';

        while(--num) {
            out += str;

            if (num === -10) {
                throw 'Loop error';
            }
        }

        return out;
    };

    FireTPL.Error = FireError;
})(FireTPL);
/**
 * FireTPL parser
 *
 * @module  Parser
 */
(function(FireTPL) {
    'use strict';

    /**
     * Parser constructor
     *
     * @constructor
     *
     * @example {js}
     * var parser = new FireTPL.Parser();
     * parser.parse('input string');
     * var parsedStr = parser.flush();
     * 
     */
    var Parser = function(options) {
        options = options || {};

        this.tmplType = options.type || 'fire';
        this.voidElements = [
            'area', 'base', 'br', 'col', 'embed', 'img', 'input',
            'link', 'meta', 'param', 'source', 'wbr'
        ];

        this.indention = 0;
        this.closer = [];
        this.curScope = ['root'];
        this.out = { root: '' };
        this.lastItemType = 'code';
        this.nextScope = 0;
        this.pos = 0;
        this.addEmptyCloseTags = false;
        this.indentionPattern = /\t| {1,4}/g;
        this.isNewLine = true;

        this.syntax = this.getSyntaxConf(this.tmplType);
    };

    /**
     * Parses an input string
     * 
     * @param  {string} input Input string
     */
    Parser.prototype.parse = function(input) {
        var pat = this.patternBuilder();
        this.inputStream = input;

        if (this.logLevel & 4) {
            console.log('Parse a .' + type + ' Template');
        }

        var mapArgs = function(index) {
            return match[index];
        };

        this.addEmptyCloseTags = this.syntax.addEmptyCloseTags || false;

        // console.log('Funcs', pat.funcs);

        var reg = new RegExp(pat.pattern, pat.modifer);
        var d = 1000;

        var match;

        while (true) {
            if (--d === 0) {
                throw 'Infinite loop!';
            }

            pat.lastIndex = this.pos;
            match = reg.exec(this.inputStream);
            this.pos = pat.lastIndex;

            if (!match) {
                break;
            }

            // console.log(match);// console.log(pat);
            for (var i = 0, len = pat.funcs.length; i < len; i++) {
                if (match[pat.funcs[i].index]) {
                    //Map args
                    var args = pat.funcs[i].args.map(mapArgs),
                        func = pat.funcs[i].func;

                    //Call parser func
                    // console.log('Call:', pat.funcs[i].func);
                    this[func].apply(this, args);
                    if (func !== 'parseIndention') {
                        this.isNewLine = false;
                    }
                    this.lastParserAction = func;
                    break;
                }
            }
        }
    };

    /**
     * Returns parsed data
     * 
     * @return {string} Returns parser result
     */
    Parser.prototype.flush = function() {
        while (this.closer.length > 0) {
            this.appendCloser();
        }

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

        //Clear data streams
        delete this.inputStream;
        delete this.out;

        return outStream;
    };

    Parser.prototype.parseEmptyLine = function(line) {
        // console.log('Empty line "%s"', line);
    };

    Parser.prototype.parseComment = function(comment) {
        // console.log('Empty comment "%s"', comment);
    };

    /**
     * Parse a tag
     * 
     * @private
     * @param  {string} tag Tag name
     * @param {string} tag attrs Tag attribute string
     */
    Parser.prototype.parseTag = function(tag, attrs) {
        attrs = attrs ? ' ' + attrs.trim() : '';
        this.append('str', '<' + tag + this.matchVariables(attrs) + '>');
        if (this.voidElements.indexOf(tag) === -1) {
                this.closer.push('</' + tag + '>');
        }
        else {
            if (this.addEmptyCloseTags) {
                this.closer.push('');
            }
        }
    };

    Parser.prototype.parseIndention = function(indentionStr) {
        var indention = this.getIndention(indentionStr),
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
                
        this.lastIndention = this.indention;
        this.indention = indention;
        this.isNewLine = true;
    };

    /**
     * Parse a closing tag
     * 
     * @private
     * @param  {string} tag Tag name
     */
    Parser.prototype.parseCloseTag = function(tag) {
         var lastTag = this.closer.slice(-1)[0];
        if ('</' + tag + '>' !== lastTag) {
            throw new Error('Invalid closing tag! Expected </' + tag + '> but got a ' + lastTag);
        }

        this.appendCloser();
    };

    /**
     * Parse a closing helper tag
     * 
     * @private
     * @param  {string} tag Helper name
     */
    Parser.prototype.parseCloseHelper = function(helper) {
        var lastTag = this.closer.slice(-1)[0];
        if ('scope' !== lastTag) {
            throw new Error('Invalid closing helper! Expected </' + helper + '> but got a ' + lastTag);
        }

        this.appendCloser();
    };

    Parser.prototype.parseElseHelper = function() {
        this.parseCloseHelper('if');
        this.parseHelper('else');
    };

    /**
     * Parse a string
     * 
     * @private
     * @param  {string} str Tag name
     */
    Parser.prototype.parseString = function(str) {
        str = str.trim().replace(/\s+/g, ' ');
        str = this.matchVariables(str);
        
        if (this.tmplType === 'fire' && this.grepNextChar() === '"') {
            str += ' ';
        }

        this.append('str', str);
        if (this.addEmptyCloseTags && this.tmplType === 'fire' && this.isNewLine) {
            this.closer.push('');
        }
    };

    /**
     * Parse a variable
     * 
     * @private
     * @param  {string} variable Tag name
     */
    Parser.prototype.parseVariable = function(variable) {
        this.append('str', this.matchVariables(variable));
        if (this.tmplType === 'fire' && this.isNewLine) {
            this.closer.push('');
        }
    };

    /**
     * Parse a helper
     * 
     * @private
     * @param  {string} helper Tag name
     */
    Parser.prototype.parseHelper = function(helper, expr, tag, tagAttrs) {
        var scopeId;

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

        if (tag) {
            tag = tag.trim();
            tagAttrs = tagAttrs || '';
            if (this.scopeTags) {
                tagAttrs += ' fire-scope="scope' + scopeId + '" fire-path="' + expr.replace(/^\$([a-zA-Z0-9_.-]+)/, '$1') + '"';
            }
            this.parseTag(tag, tagAttrs);
        }
        else {
            this.closer.push('');
        }

        if (expr) {
            expr = expr.trim();
            if (this.tmplType === 'hbs') {
                expr = '{{' + expr + '}}';
            }
            expr = this.matchVariables(expr, true);
        }

        if (this.scopeTags) {
            this.append('str', '<scope id="scope' + scopeId + '" path="' + expr + '"></scope>');
        }
        else {
            this.append('code', 's+=scopes.scope' + scopeId + '(' + expr + ',data);');
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

    /**
     * Parse a code block
     *
     * @private
     * @param  {string} type Source codetype
     * @param  {string} code Source code content
     */
    Parser.prototype.parseCodeBlock = function(type, code) {
        var self = this;
        var cssClass = 'class="' + type + '"';
        code = this.undent(this.indention + 1, code);
        code = this.escape(code).trim();
        code = code.replace(/`(.*)`/g, function(match, p1) {
            return self.matchVariables(p1);
        });
        
        this.append('str', '<code ' + cssClass + '>' + code + '</code>');
    };

    /**
     * Parse a attribute
     * 
     * @private
     * @param  {string} attribute Tag name
     */
    Parser.prototype.parseAttribute = function(attrName, attrValue) {
        var attr = attrName + '="' + this.matchVariables(attrValue.replace(/^["\']|["\']$/g, '')) + '"';

        if (this.out[this.curScope[0]].slice(-1) !== '>') {
            throw new FireTPL.Error(this, 'Attribute not allowed here. Tag expected!');
        }

        this.out[this.curScope[0]] = this.out[this.curScope[0]].replace(/\>$/, ' ' + attr + '>');

        if (this.tmplType === 'fire' && this.isNewLine) {
            this.closer.push('');
        }
    };

    Parser.prototype.parsePartial = function(partialName) {
        this.append('str', '\'+p(\'' + partialName + '\',data)+\'');
    };

    /**
     * Match variables within a string
     * @param  {string} str Input string
     * @return {string}     Returns a variable replaced string
     */
    Parser.prototype.matchVariables = function(str, isCode) {
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

        var mapArgs = function(arg) {
            arg = arg.replace(/^["']|["']$/g, '');
            if (!/^\d+/.test(arg)) {
                arg = '\'' + arg.replace(/\'/g, '\\\'') +'\'';
            }

            return arg;
        };

        var parseVar = function(m) {
            if (m === '') {
                if (self.scopeTags) {
                    return '\'+data+\'';
                }
                return opener + 'data' + closer;
            }
            
            var chunks = m.split('.'),
                vars = [],
                funcs = [];
            
            for (var i = 0, len = chunks.length; i < len; i++) {
                if (i === 0) {
                    if (chunks[i] === 'parent' || chunks[i] === 'root') {
                        if (self.scopeTags) {
                            continue;
                        }
                    }
                    else if (!self.scopeTags) {
                        vars.push('data');
                    }
                }
                else if (/\)$/.test(chunks[i])) {
                    var split = chunks[i].split(/\(/, 2);
                    var func = split[0],
                        args = (split[1] || '').slice(0, -1);

                    if (args) {
                        args = args.match(/"[^"]*"|'[^']*'|\d+/g).map(mapArgs);
                    }

                    funcs.push([func, args]);
                    continue;
                }

                vars.push(chunks[i]);
            }
            
            m = vars.join('.');
            for (i = 0, len = funcs.length; i < len; i++) {
                m = 'f.' + funcs[i][0] + '(' + m + (funcs[i][1] ? ',' + funcs[i][1].join(',') : '') + ')';
            }

            if (self.curScope[0] === 'root' && !isCode) {
                return opener + m + closer;
            }
            else if (self.scopeTags) {
                return altOpener + m + altCloser;
            }
            else {
                return opener + m + closer;
            }
        };

        var pat = this.patternBuilder('variable');
        var reg = new RegExp(pat.pattern.slice(1, -1), 'g');
        var split = str.split(reg);

        if (this.tmplType === 'fire') {
            split = split.map(function(item) {
                if (item.charAt(0) === '@') {
                    return opener + 'l.' + item.substr(1) + closer;
                }
                else if(item.charAt(0) === '$') {
                    return parseVar(item.substr(1).replace(/^this\.?/, ''));
                }
                else {
                    return item.replace(/\'/g, '\\\'');
                }
            });
        }
        else {
            split = split.map(function(item) {
                if (item.charAt(0) === '@') {
                    return opener + 'l.' + item.substr(1) + closer;
                }
                else if(item.charAt(0) === '{' && item.charAt(1) === '{') {
                    return parseVar(item.replace(/^\{{2,3}|\}{2,3}$/g, '').replace(/^this\.?/, ''));
                }
                else {
                    return item.replace(/\'/g, '\\\'');
                }
            });
        }

        return split.join('');
    };

    /**
     * Creates all patterns from pattern conf
     *
     * @private
     */
    Parser.prototype.patternBuilder = function(subPatternName) {
        var pattern = [];
        var names = [];
        var funcs = [];

        var syntaxConf = this.syntax;

        var createSubPattern = function(parts) {
            var subpat = parts.map(function(part) {
                if (part.func) {
                    funcs.push({
                        func: part.func,
                        args: part.args || [],
                        index: index
                    });
                }

                var subpattern = '';
                names.push({
                    name: part.name,
                    index: index++
                });

                if (part.pattern.parts) {
                    subpattern = part.pattern.start;
                    subpattern += createSubPattern(part.pattern.parts);
                    subpattern += part.pattern.end;
                    return subpattern;
                }

                return part.pattern;
            });

            subpat = subpat.join('');
            return subpat;
        };

        var index = 1;
        syntaxConf.pattern.forEach(function(pat) {
            //Skip unmatched pattern if a sub pattern is required
            if (subPatternName && subPatternName !== pat.name) {
                return;
            }

            if (pat.func) {
                funcs.push({
                    func: pat.func,
                    args: pat.args || [],
                    index: index
                });
            }

            names.push({
                name: pat.name,
                index: index++
            });

            pattern.push(createSubPattern(pat.parts));
        });

        funcs.forEach(function(item) {
            item.args = item.args.map(function(argName) {
                for (var i = 0, len = names.length; i < len; i++) {
                    if (names[i].name === argName) {
                        return names[i].index;
                    }
                }
            });
        });

        return {
            pattern: '(' + pattern.join(')|(') + ')',
            names: names,
            funcs: funcs,
            modifer: syntaxConf.modifer
        };
    };

    /**
     * Gets required syntax conf
     *
     * @private
     * @param  {string} type Syntax type
     * @return {object}      Returns syntax conf object
     */
    Parser.prototype.getSyntaxConf = function(type) {
        return FireTPL.Syntax[type];
    };

    /**
     * Append something to the out String
     *
     * @method append
     * @private
     * @param String type Content type (str|code)
     * @param String str Output str
     */
    Parser.prototype.append = function(type, str) {
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
    Parser.prototype.appendCloser = function() {
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
    Parser.prototype.getIndention = function(str) {
        var i = 0;

        this.indentionPattern.lastIndex = 0;
        // console.log('Get indention of str:', str, ': length:', str.length);
        while(true) {
            var match = this.indentionPattern.exec(str);
            if (!match) {
                break;
            }

            if (match[0] !== '\t' && match[0] !== '    ') {
                throw new FireTPL.Error(this, 'Invalid indention!');
            }
            
            i++;
        }

        if (this.indentionPattern.lastIndex) {
        }

        return i;
    };

    /**
     * Get next scope id
     *
     * @method getNextScope
     */
    Parser.prototype.getNextScope = function() {
        return this.nextScope < 1000 ? '00' + String(++this.nextScope).substr(-3) : '' + (++this.nextScope);
    };

    /**
     * Add and change scope
     * @method newScope
     * @param {String} scope New scope
     */
    Parser.prototype.newScope = function(scope) {
        this.append('code', '');
        this.curScope.unshift(scope);
        this.out[scope] = this.out[scope] || '';
    };

    Parser.prototype.undent = function(dept, code) {
        var pattern = '^(\t| {4}){' + dept + '}';
        var reg = new RegExp(pattern);
        return code.replace(/^\n|\n$/g, '').split('\n').map(function(line) {
            return line.replace(reg, '');
        }).join('\n');
    };

    Parser.prototype.escape = function(str) {
        return str.replace(/\'/g, '\\\'');
    };

    Parser.prototype.htmlEscape = function(str) {
        var chars = {
            '"': '&quot;'
        };

        return str.replace(/["&<>]/g, function(ch) {
            return chars[ch];
        });
    };

    Parser.prototype.grepNextChar = function() {
        var reg = /\S/g;
        reg.lastIndex = this.pos;
        var match = reg.exec(this.inputStream);
        if (match) {
            return match[0];
        }

        return null;
    };

    FireTPL.Parser = Parser;
})(FireTPL);
/**
 * FireTPL compiler node module
 *
 * Usage:
 * var fireTPLCompiler = new FireTPL.Compiler();
 * var precompiled = fireTPLCompiler.precompile('./views/template.ftl');
 *
 * @module FireTPL.Compiler
 */
(function(FireTPL) {
    'use strict';

    var Compiler = function(options) {
        options = options || {};
        
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

    /**
     * Precompiles a template string
     *
     * @method precompile
     * @param {String} tmpl Tmpl source
     * @param {Object} options Precompile options
     * 
     *
     * @return {Function} Returns a parsed tmpl source as a function.
     */
    Compiler.prototype.precompile = function(tmpl, options) {
        options = options || {};

        if (!options.name) {
            throw new FireTPL.Error('Precompilation not possible! The options.name flag must be set!');
        }

        options.firetplModule = options.firetplModule || 'firetpl';

        var tplName = options.name;

        var parser = new FireTPL.Parser({
            type: options.type || 'fire'
        });
        
        parser.parse(tmpl);
        var precompiled = parser.flush();

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

        output += 'FireTPL.' + (options.partial ? 'partialCache' : 'templateCache') + '[\'' + tplName + '\']=function(data,scopes) {var h=new FireTPL.Runtime(),l=FireTPL.locale,f=FireTPL.fn,p=FireTPL.execPartial;' + precompiled + 'return s;};';

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

    /* +---------- FireTPL methods ---------- */

    FireTPL.precompile = function(tmpl, options) {
        var compiler = new Compiler(tmpl, options);
        return compiler.precompile(tmpl, options);
    };

    FireTPL.fire2html = function(tmpl, data) {
        data = data || {};

        var template = FireTPL.compile(tmpl);
        return template(data);
    };

    FireTPL.Compiler = Compiler;
})(FireTPL);
FireTPL.Syntax = FireTPL.Syntax || {};
FireTPL.Syntax["fire"] = {
	"name": "FireTPL",
	"patterns": [
		{
			"name": "empty-line",
			"match": "(\\n?^\\s+$)"
		}, {
			"name": "indention",
			"match": "(^[ \\t]+)"
		}, {
			"name": "comment",
			"match": "(//.*)"
		}, {
			"name": "helper",
			"match": "(?::([a-zA-Z][a-zA-Z0-9_-]*)[\\t ]*((?:\\$[a-zA-Z][a-zA-Z0-9._-]*)(?:[\\t ]*:.*)?)?)"
		}, {
			"name": "string",
			"match": "(\\\"[^\\\"]*\\\")"
		}, {
			"name": "htmlstring",
			"match": "(\\'[^\\']*\\')"
		}, {
			"name": "attribute",
			"match": "(\\b[a-zA-Z0-9_]+=(?:(?:\\\"[^\\\"]*\\\")|(?:\\'[^\\']*\\')|(?:\\S+)))"
		}, {
			"name": "tag",
			"match": "(?:([a-zA-Z][a-zA-Z0-9:_-]*)+(?:(.*))?)"
		}, {
			"name": "variable",
			"xmatch": "([@\\$][a-zA-Z][a-zA-Z0-9._()-]*)",
			"match": "((?:[@\\$][a-zA-Z][a-zA-Z0-9_-]*)(?:.[a-zA-Z][a-zA-Z0-9_-]*(?:\\((?:\"[^\"]*\"|'[^']*')*\\))?)*)"
		}, {
			"name": "new-line",
			"match": "(?:\\n([ \\t]*))"
		}
	],
	"modifer": "gm",
	"scopes": {
		"1": "unused",
		"2": "indention",
		"3": "comment",
		"4": "helper",
		"5": "expression",
		"6": "string",
		"7": "htmlstring",
		"8": "attribute",
		"9": "tag",
		"10": "tagAttributes",
		"11": "variable",
		"12": "newline"
	},
	"addEmptyCloseTags": true,
	"pattern": [
		{
			"name": "emptyLine",
			"func": "parseEmptyLine",
			"args": ["emptyLineString"],
			"parts": [
				{
					"name": "emptyLineString",
					"pattern": "^(\\s+)$"
				}
			]
		}, {
			"name": "comment",
			"func": "parseComment",
			"args": ["commentLine"],
			"parts": [
				{
					"name": "commentLine",
					"pattern": "\\s*(\/\/.*)$"
				}
			]
		}, {
			"name": "blockComment",
			"func": "parseComment",
			"args": ["commentBlock"],
			"parts": [
				{
					"name": "commentBlock",
					"pattern": "\\s*(/\\*[^]*?\\*/)$"
				}
			]
		}, {
			"name": "indention",
			"func": "parseIndention",
			"args": ["indentionString"],
			"parts": [
				{
					"name": "indentionString",
					"pattern": "(^[ \\t]+)"
				}
			]
		}, {
			"name": "attribute",
			"func": "parseAttribute",
			"args": ["attributeName", "attributeValue"],
			"parts": [
				{
					"name": "attributeName",
					"pattern": "([a-zA-Z0-9_]+)="
				}, {
					"name": "attributeValue",
					"pattern": "((?:\\\"[^\\\"]*\\\")|(?:\\'[^\\']*\\')|(?:\\S+))"
				}
			]
		}, {
			"name": "partial",
			"func": "parsePartial",
			"args": ["partialName"],
			"parts": [
				{
					"name": "partialName",
					"pattern": "(?:\\(>\\s*(\\S+)\\))"
				}
			]
		}, {
			"name": "tag",
			"func": "parseTag",
			"args": ["tag"],
			"parts": [
				{
					"name": "tagName",
					"pattern": "([a-zA-Z][a-zA-Z0-9:_-]*)"
				}
			]
		}, {
			"name": "string",
			"func": "parseString",
			"args": ["stringValue"],
			"parts": [
				{
					"name": "stringValue",
					"pattern": "\\\"([^\\\"]*)\\\""
				}
			]
		}, {
			"name": "helper",
			"func": "parseHelper",
			"args": ["helperName", "helperExpression", "helperTagName", "helperTagAttrs"],
			"parts": [
				{
					"name": "helperName",
					"pattern": ":([a-zA-Z][a-zA-Z0-9_-]*)"
				}, {
					"name": "helperExpression",
					"pattern": "(?:[\\t ]*(\\$[a-zA-Z][a-zA-Z0-9._-]*))?"
				}, {
					"name": "helperTag",
					"pattern": {
						"start": "([\\t ]*:[\\t ]*",
						"end": ")?",
						"parts": [
							{
								"name": "helperTagName",
								"pattern": "([a-zA-Z][a-zA-Z0-9_:-]*)"
							}, {
								"name": "helperTagAttrs",
								"pattern": "(?:[\\t ]+([a-zA-Z0-9_-]+=(?:\\\"[^\\\"]*\\\")|(?:\\'[^\\']*\\')|(?:\\S+)))*"
							}
						]
					}
				}
			]
		}, {
			"name": "variable",
			"func": "parseVariable",
			"args": ["variableString"],
			"parts": [
				{
					"name": "variableString",
					"pattern": "([@\\$](?:\\.?(?:[a-zA-Z][a-zA-Z0-9_-]*)(?:\\((?:[, ]*(?:\"[^\"]*\"|'[^']*'|\\d+))*\\))?)+)"
				}
			]
		}, {
			"name": "code",
			"func": "parseCodeBlock",
			"args": ["codeType", "codeValue"],
			"parts": [
				{
					"name": "codeType",
					"pattern": "```(\\w+)?"
				}, {
					"name": "codeValue",
					"pattern": "([^]*)```"
				}
			]
		}
	]
};
FireTPL.Syntax["hbs"] = {
	"name": "Handelbars",
	"patterns": [
		{
			"name": "unused",
			"match": "(\\s+)"
		}, {
			"name": "comment",
			"match": "({{!(?:--)?.+}})"
		}, {
			"name": "tag",
			"match": "(?:<([a-zA-Z][a-zA-Z0-9:_-]*)\\b([^>]+)?>)"
		}, {
			"name": "endtag",
			"match": "(?:<\\/([a-zA-Z][a-zA-Z0-9:_-]*)>)"
		}, {
			"name": "helper",
			"match": "(?:\\{\\{#([a-zA-Z][a-zA-Z0-9_-]*)(?:\\s+([^\\}]*)\\}\\})?)"
		}, {
			"name": "elseHelper",
			"match": "(?:\\{\\{(else)\\}\\})"
		}, {
			"name": "helperEnd",
			"match": "(?:\\{\\{\\/([a-zA-Z][a-zA-Z0-9_-]*)\\}\\})"
		}, {
			"name": "string",
			"match": "((?:[^](?!(?:<|\\{\\{(?:#|\\/))))+[^])"
		}
	],
	"modifer": "gm",
	"scopes": {
		"1": "unused",
		"2": "comment",
		"3": "tag",
		"4": "tagAttributes",
		"5": "endtag",
		"6": "helper",
		"7": "expression",
		"8": "elseHelper",
		"9": "helperEnd",
		"10": "string"
	},
	"pattern": [
		{
			"name": "comment",
			"func": "parseComment",
			"args": ["commentLine"],
			"parts": [
				{
					"name": "commentLine",
					"pattern": "(\\{\\{!(?:--)?[^]*?\\}\\})"
				}
			]
		}, {
			"name": "htmlComment",
			"func": "parseComment",
			"args": ["htmlCommentLine"],
			"parts": [
				{
					"name": "htmlCommentLine",
					"pattern": "(<!--[^]*?-->)"
				}
			]
		}, {
			"name": "helper",
			"func": "parseHelper",
			"args": ["helperName", "helperExpression"],
			"parts": [
				{
					"name": "helperString",
					"pattern": {
						"start": "(\\{\\{#",
						"end": "\\}\\})",
						"parts": [
							{
								"name": "helperName",
								"pattern": "([a-zA-Z][a-zA-Z0-9_-]*)"
							}, {
								"name": "helperExpression",
								"pattern": "(?:[\\t| ]+([^\\}]*))?"
							}
						]
					}
				}
			]
		}, {
			"name": "closeHelper",
			"func": "parseCloseHelper",
			"args": ["closeHelperName"],
			"parts": [
				{
					"name": "closeHelperName",
					"pattern": "(?:\\{\\{\\/([a-zA-Z][a-zA-Z0-9_-]*)\\}\\})"
				}
			]
		}, {
			"name": "elseHelper",
			"func": "parseElseHelper",
			"args": ["elseHelperName"],
			"parts": [
				{
					"name": "elseHelperName",
					"pattern": "(?:\\{\\{(else)\\}\\})"
				}
			]
		}, {
			"name": "closeTag",
			"func": "parseCloseTag",
			"args": ["closeTagString"],
			"parts": [
				{
					"name": "closeTagString",
					"pattern": "(?:<\\/([a-zA-Z][a-zA-Z0-9:_-]*)>)"
				}
			]
		}, {
			"name": "partial",
			"func": "parsePartial",
			"args": ["partialName"],
			"parts": [
				{
					"name": "partialName",
					"pattern": "(?:\\{\\{>\\s*(\\S+)\\s*\\}\\})"
				}
			]
		}, {
			"name": "tag",
			"func": "parseTag",
			"args": ["tagName", "tagAttributes"],
			"parts": [
				{
					"name": "tagString",
					"pattern": {
						"start": "(<",
						"end": ">)",
						"parts": [
							{
								"name": "tagName",
								"pattern": "([a-zA-Z][a-zA-Z0-9:_-]*)"
							}, {
								"name": "tagAttributes",
								"pattern": "(?:\\b\\s*([^>]+))?"
							}
						]
					}
				}
			]
		}, {
			"name": "string",
			"func": "parseString",
			"args": ["stringValue"],
			"parts": [
				{
					"name": "stringValue",
					"pattern": "(\\S(?:[^](?!(?:<|\\{\\{(?:#|\\/|!))))+[^])"
				}
			]
		}, {
			"name": "variable",
			"func": "parseVariable",
			"args": ["variableString"],
			"parts": [
				{
					"name": "variableString",
					"pattern": "(\\{{2,3}(?:\\.?(?:[a-zA-Z][a-zA-Z0-9_-]*)(?:\\((?:[, ]*(?:\"[^\"]*\"|'[^']*'|\\d+))*\\))?)+\\}{2,3})"
				}
			]
		}
	]
};
/**
 * FireTPL runtime module
 */
(function(FireTPL) {
    'use strict';

    FireTPL.helpers = {};
    FireTPL.fn = {};
    FireTPL.templateCache = {};
    FireTPL.partialCache = {};

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

    FireTPL.registerFunction = function(func, fn) {
        this.fn[func] = fn;
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

    var Runtime = function() {

    };

    Runtime.prototype.exec = function(helper, data, parent, root, fn) {
        if (!FireTPL.helpers[helper]) {
            throw new Error('Helper ' + helper + ' not registered!');
        }

        return FireTPL.helpers[helper]({
            data: data,
            parent: parent,
            root: root
        }, fn);
    };

    Runtime.prototype.execPartial = function(partialName, data) {
        var partial = FireTPL.partialCache[partialName];
        if (!partial) {
            throw new FireTPL.Error('Partial \'' + partialName + '\' was not registered!');
        }

        return partial(data);
    };

    /**
     * Compiles and executes a template string
     *
     * Uses fire syntax as default. If you pass a hbs template please set the type option to *hbs*
     * 
     * @param {String} template Template string or precompiled tempalte
     * @param {Object} options (Optional) Compiler options
     *
     * @example {fire}
     * var tmpl = 'div "Hello $name"';
     * var template = FireTPL.compile(tmpl);
     * var html = template({
     *   name: 'Andi'
     * });
     *
     * // html == <div>Hello Andi</div>
     * 
     * @example {hbs}
     * var tmpl = '<div>Hello {{name}}</div>';
     * var template = FireTPL.compile(tmpl, 'hbs');
     * var html = template({
     *   name: 'Andi'
     * });
     *
     * // html == <div>Hello Andi</div>
     * @returns {String} Returns executed template
     */
    FireTPL.compile = function(template, options) {
        options = options || {};

        if (typeof options === 'string') {
            options = {
                type: options
            };
        }

        if (!/^scopes=scopes/.test(template)) {
            // var fireTpl = new FireTPL.Compiler(options);
            var parser = new FireTPL.Parser({
                type: options.type || 'fire'
            });
            
            parser.parse(template);
            template = parser.flush();
        }

        return function(data, scopes) {
            var h = new FireTPL.Runtime(),
                l = FireTPL.locale,
                f = FireTPL.fn,
                p = FireTPL.execPartial;
            var s;

            //jshint evil:true
            try {
                var tmpl = '(function(data, scopes) {\n' + template + 'return s;})(data, scopes)';
                return eval(tmpl);
            }
            catch (err) {
                console.error('FireTPL parse error', err);
                console.log('Data: ', data);
                console.log('----- Template source -----');
                console.log(prettify(tmpl));
                console.log('----- Template source -----');
            }

            return s;
        };
    };

    FireTPL.Runtime = Runtime;

    /**
     * Compile a file
     * @method compileFile
     * 
     * @param {String} template Template string or precompiled tempalte
     * @param {Object} options (Optional) Compiler options
     * 
     * @returns {String} Returns executed template
     */
    FireTPL.compileFile = function(file, options) {
        if (typeof global === 'object' && typeof window === 'undefined') {
            var fs = require('fs');
            return FireTPL.compile(fs.readFileSync(file, { encoding: 'utf8' }), options);
        }

        return FireTPL.compile(FireTPL.readFile(file), options);
    };

    var prettify = function(str) {
        var indention = 0,
            out = '';

        var repeat = function(str, i) {
            var out = '';
            while (i > 0) {
                out += str;
                i--;
            }
            return out;
        };

        for (var i = 0; i < str.length; i++) {
            var c = str.charAt(i);
            
            if(c === '}' && str.charAt(i - 1) !== '{') {
                indention--;
                out += '\n' + repeat('\t', indention);
            }

            out += c;

            if (c === '{' && str.charAt(i + 1) !== '}') {
                indention++;
                out += '\n' + repeat('\t', indention);
            }
            else if(c === ';') {
                out += '\n' + repeat('\t', indention);
            }
        }

        return out;
    };

    FireTPL.registerCoreHelper();

})(FireTPL);
(function(FireTPL) {
    'use strict';

    var fs = require('fs');

    FireTPL.__express = function(file, options, callback) {
        if (typeof options === 'function') {
            callback = options;
            options = {};
        }

        fs.readFile(file, { encoding: 'utf8' }, function(err, source) {
            if (err) {
                return callback(err);
            }

            var compiled = FireTPL.compile(source, options);
            return callback(null, compiled(options));
        });
    };
    
})(FireTPL);
(function(FireTPL) {
    'use strict';
    
    FireTPL.registerFunction('byte', function(str, round) {
        var units = ['Byte', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'],
            size = parseFloat(str, 10),
            p = 0;

        round = round ? Math.pow(10, round) : 10;

        for (var i = 0, len = units.length; i < len; i++) {
            if (Math.pow(1024, i + 1) >= size) {
                break;
            }
        }

        return Math.round((size / Math.pow(1024, i) * round)) / round + ' ' + units[i];
    });
})(FireTPL);
(function(FireTPL) {
    'use strict';
    
        /**
     * Greater than comparison
     *
     * The property becomes true if property is greater than value.
     *
     * @group InlineFunctions
     * @method gt
     * @param  {number} value Comparison value
     * @return {boolean}    Returns true if input is greater then value
     */
    FireTPL.registerFunction('gt', function(str, cmp) {
        return Number(str) > Number(cmp);
    });

    /**
     * Greater than comparison or equal
     *
     * The property becomes true if property is greater or equal than value.
     *
     * @group InlineFunctions
     * @method gte
     * @param  {number} value Comparison value
     * @return {boolean}    Returns true if input is greater or equal then value
     */
    FireTPL.registerFunction('gte', function(str, cmp) {
        return Number(str) >= Number(cmp);
    });

    /**
     * Lesser than comparison
     *
     * The property becomes true if property is lesser than value.
     *
     * @group InlineFunctions
     * @method lt
     * @param  {number} value Comparison value
     * @return {boolean}    Returns true if input is lesser then value
     */
    FireTPL.registerFunction('lt', function(str, cmp) {
        return Number(str) < Number(cmp);
    });

    /**
     * Lesser than comparison or equal
     *
     * The property becomes true if property is lesser or equal than value.
     *
     * @group InlineFunctions
     * @method gte
     * @param  {number} value Comparison value
     * @return {boolean}    Returns true if input is lesser or equal then value
     */
    FireTPL.registerFunction('lte', function(str, cmp) {
        return Number(str) <= Number(cmp);
    });

    /**
     * Equal comparison
     *
     * The property becomes true if input and value are both identical
     *
     * @group InlineFunctions
     * @method eq
     * @param  {number} value Comparison value
     * @return {boolean}    Returns true if input and value are identical
     */
    FireTPL.registerFunction('eq', function(str, cmp) {
        return Number(str) === Number(cmp);
    });

    /**
     * Not equal comparison
     *
     * The property becomes true if input and value aren't identical
     *
     * @group InlineFunctions
     * @method not
     * @param  {number} value Comparison value
     * @return {boolean}    Returns true if input and value aren't identical
     */
    FireTPL.registerFunction('not', function(str, cmp) {
        return Number(str) !== Number(cmp);
    });

    /**
     * Expression matching
     *
     * Returns value if expression is matching, otherwise altValue will be returned
     *
     * @group InlineFunctions
     * @method if
     * @param {string} expression Expression
     * @param  {number} value Comparison value
     * @return {boolean}    Returns true if input and value aren't identical
     */
    FireTPL.registerFunction('if', function(str, expression, value, altValue) {
        if (String(str) === String(expression)) {
            return value;
        }

        return altValue;
    });
})(FireTPL);