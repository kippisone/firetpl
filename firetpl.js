/*!
 * FireTPL template engine v0.6.0-19
 * 
 * FireTPL is a pretty Javascript template engine. FireTPL uses indention for scops and blocks, supports partials, helper and inline functions.
 *
 * FireTPL is licensed under MIT License
 * http://opensource.org/licenses/MIT
 *
 * Copyright (c) 2013 - 2015 Noname Media, http://noname-media.com
 * Author Andi Heinkelein <andi.oxidant@noname-media.com>
 *
 */

var FireTPL;

/**
 * FireTPL
 *
 * @module FireTPL
 */

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
        /**
         * Contains current version
         * @property {String} version
         * @default v0.6.0
         */
        version: '0.6.0-19',

        /**
         * Defines the default language
         * @property {String} i18nDefault
         */
        i18nDefault: 'en',

        /**
         * Defines the current selected language
         * @property {String} i18nCurrent
         */
        i18nCurrent: 'en'
    };

    return FireTPL;
}));
/**
 * FireTPL error handler
 *
 * @module FireTPL Error handler
 */
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

        return new Error(msg);
    };

    FireError.prototype = Object.create(Error.prototype);
    FireError.prototype.constructor = FireError;

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

    var ParseError = function(err, data, tmpl) {
        if (typeof err === 'string') {
            err = new Error(err);
        }

        this.name = 'FireTPL parse error';
        this.message = err.message;

        console.error('FireTPL parse error', err);
        console.error(err.stack);

        if (data) {
            console.log('Data: ', data);
        }

        if (tmpl) {
            console.log('----- Template source -----');
            // console.log(prettify(tmpl));
            console.log('----- Template source -----');
        }
    };

    ParseError.prototype = Object.create(Error.prototype);
    ParseError.prototype.constructor = ParseError;

    FireTPL.Error = FireError;
    FireTPL.ParseError = ParseError;
})(FireTPL);
/**
 * FireTPL parser
 *
 * @module  FireTPL.Parser
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
     * Options:
     *
     * @arg eventTags {boolean}
     * Strip html event tags and add all into an `on` tag. The tag contains all event tags as a list seperated by a semicolon.
     * For example: `on="click:click-handler;mousedown:mouse-handler"`
     * 
     */
    var Parser = function(options) {
        options = options || {};

        this.tmplType = options.type || 'fire';
        this.voidElements = [
            'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'keygen',
            'link', 'meta', 'param', 'track', 'source', 'wbr'
        ];

        this.indention = 0;
        this.closer = [];
        this.curScope = ['root'];
        this.out = { root: '' };
        this.lastTagPos = { 'root' : 0 };
        this.lastItemType = 'code';
        this.nextScope = 0;
        this.pos = 0;
        this.addEmptyCloseTags = false;
        this.indentionPattern = /\t| {1,4}/g;
        this.isNewLine = true;
        this.parseEventTags = options.eventTags || false;
        this.pretty = options.pretty || false;

        this.syntax = this.getSyntaxConf(this.tmplType);
        this.partialsPath = options.partialsPath;

        /**
         * Stores names of required partials
         * @property {Array}
         */
        this.partials = [];
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

            reg.lastIndex = this.pos;
            match = reg.exec(this.inputStream);
            this.pos = reg.lastIndex;


            if (!match) {
                break;
            }

            // console.log(match[0]);// console.log(pat);
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
        attrs = this.matchAttributes(attrs);
        if (attrs) {
            attrs = ' ' + this.matchVariables(attrs);
        }

        this.lastTagPos[this.curScope[0]] = this.out[this.curScope[0]].length;

        if (tag === 'dtd') {
            this.append('str', '<!DOCTYPE html>');
            this.closer.push('');
        }
        else {
            this.append('str', '<' + tag + attrs + '>');
            if (this.voidElements.indexOf(tag) === -1) {
                    this.closer.push('</' + tag + '>');
            }
            else {
                if (this.addEmptyCloseTags) {
                    this.closer.push('');
                }
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
        str = this.matchVariables(str, false, true);
        
        if (this.tmplType === 'fire' && this.grepNextChar() === '"') {
            str += ' ';
        }

        this.append('str', str);
        if (this.addEmptyCloseTags && this.tmplType === 'fire' && this.isNewLine) {
            this.closer.push('');
        }
    };

    /**
     * Parse a html string
     * 
     * @private
     * @param  {string} str Tag name
     */
    Parser.prototype.parseHtmlString = function(str) {
        str = str.trim().replace(/\s+/g, ' ');
        str = this.matchVariables(str);
        
        if (this.tmplType === 'fire' && this.grepNextChar() === '\'') {
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
        var scopeId,
            tagStr = '';

        if (helper === 'else') {
            this.closer.push(['code', '']);
            this.newScope(this.lastIfScope);
            this.append('code', 'if(!r){s+=h(\'else\',c,parent,root,function(data){var s=\'\';');
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
            tagStr = ',\'' + tag + '\', \'' + tagAttrs + '\'';
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
            this.append('code', 'var c=data;var r=h(\'if\',c,parent,root,function(data){var s=\'\';');
            this.closer.push(['code', 'return s;});s+=r;']);
        }
        else {
            this.append('code', 's+=h(\'' + helper + '\',data,parent,root' + tagStr + ',function(data){var s=\'\';');
            this.closer.push(['code', 'return s;});']);
        }

        this.closer.push('scope');
        // this.appendCloser();
    };

    /**
     * Parse a sub helper
     * 
     * @private
     * @param {String} name Sub helper name
     * @param {Any} expr Expression
     * @param {String} tag Tag name
     * @param {String} attrs Attributes string
     */
    Parser.prototype.parseSubHelper = function(name, expr, tag, attrs) {
        this.append('code', 's+=this.' + name + '(' + this.matchVariables(expr, true, false) + ',\'' + tag + '\',\'' + attrs + '\',function(data){var s=\'\';');
        this.closer.push(['code', 'return s;});']);
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
        var cssClass = 'class="' + ('codeBlock ' + type).trim() + '"';
        code = this.undent(this.indention + 1, code);
        code = this.escape(code).trim();
        code = code.replace(/`(.*)`/g, function(match, p1) {
            return self.matchVariables(p1);
        });

        code = this.htmlEscape(code).replace(/\n/g, '\\n\\\n');
        
        this.append('str', '<code ' + cssClass + '>' + code + '</code>');
        this.closer.push('');
    };

    /**
     * Parse a line option
     * @param  {String} str Line option
     */
    Parser.prototype.parseLineOption = function(str) {
        if (str === '.') {
            this.append('str', ' ');
        }
    };

    /**
     * Parse a attribute
     * 
     * @private
     * @param  {string} attribute Tag name
     */
    Parser.prototype.parseAttribute = function(attrName, attrValue) {
        if (attrValue.charAt(0) !== '"' && attrValue.charAt(0) !== '\'') {
            attrValue = '"' + attrValue + '"';
        }

        var attr = attrName + '=' + this.matchVariables(attrValue);

        if (this.parseEventTags && /^on?[A-Z]/.test(attrName)) {
            var val = attrName.substr(2).toLowerCase() + ':' + attrValue.slice(1, -1);
            this.injectAtribute('on', val, ';');
        }
        else if (this.out[this.curScope[0]].slice(-1) !== '>') {
            throw new FireTPL.Error(this, 'Attribute not allowed here. Tag expected!');
        }
        else {
            this.out[this.curScope[0]] = this.out[this.curScope[0]].replace(/\>$/, ' ' + attr + '>');
        }

        if (this.tmplType === 'fire' && this.isNewLine) {
            this.closer.push('');
        }
    };

    /**
     * Inject an attribute into the current tag
     * @method injectAtribute
     * @param  {String}       attrName Attribute name
     * @param  {String}       value    Attribute value
     * @param  {Boolean|String}       merge    If this argument is given and the attribut is already existing the values will be merged together. Separated by 'merge' property
     */
    Parser.prototype.injectAtribute = function(attrName, value, merge) {
        var re = new RegExp(' ' + attrName + '="(.+?)"', 'g');
        var curAttr = this.out[this.curScope[0]].slice(this.lastTagPos[this.curScope[0]]);
        var hasMatch = false;

        if (curAttr.charAt(0) !== '<') {
            this.out[this.curScope[0]] += curAttr;
            throw new FireTPL.Error('Inject attribut failed! Last item is not a valid tag!', this.out[this.curScope[0]]);
        }

        curAttr = curAttr.replace(re, function(match) {
            if (merge === undefined) {
                throw new FireTPL.Error('Attribute ' + attrName + ' already exists!');
            }

            var str = match.slice(0, -1) + merge + value + '"';

            hasMatch = true;
            return str;
        });

        if (!hasMatch) {
            curAttr = curAttr.replace(/>$/, ' ' + attrName + '="' + value + '"' + '>');
        }

        this.out[this.curScope[0]] = this.out[this.curScope[0]].substring(0, this.lastTagPos[this.curScope[0]]);
        this.out[this.curScope[0]] += curAttr;
    };

    /**
     * Match variables within a string
     * @param  {string} str Input string
     * @return {string}     Returns a variable replaced string
     */
    Parser.prototype.matchVariables = function(str, isCode, strEscape) {
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

        var parseVar = function(m, escape) {
            if (isCode) {
                escape = false;
            }
            
            if (m === '') {
                if (self.scopeTags) {
                    return '\'+data+\'';
                }
                return escape ? opener + 'f.escape(data)' + closer : opener + 'data' + closer;
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
                return escape ? opener + 'f.escape(' + m + ')' + closer : opener + m + closer;
            }
            else if (self.scopeTags) {
                return altOpener + m + altCloser;
            }
            else {
                return escape ? opener + 'f.escape(' + m + ')' + closer : opener + m + closer;
            }
        };

        var pat = this.patternBuilder('variable');
        var reg = new RegExp(this.syntax.stringVariable, 'g');
        var split = str.split(reg);


        if (this.tmplType === 'fire') {
            split = split.map(function(item) {
                if (item.charAt(0) === '@') {
                    return opener + 'l(\'' + item.substr(1) + '\',data)' + closer;
                }
                else if(item.charAt(0) === '$') {
                    if (item.charAt(1) === '{') {
                        return parseVar(item.slice(2, -1).replace(/^this\.?/, ''), true);
                    }
                    else if(item.charAt(1) === '$') {
                        return parseVar(item.substr(2).replace(/^this\.?/, ''), false);
                    }
                    
                    return parseVar(item.substr(1).replace(/^this\.?/, ''), true);
                }
                else if (item.charAt(0) === '\\') {
                    return item.charAt(1);
                }
                else if (strEscape) {
                    return self.htmlEscape(item.replace(/\'/g, '\\\''));
                }
                else {
                    return item.replace(/\'/g, '\\\'');
                }
            });
        }
        else {
            split = split.map(function(item) {
                if (item.charAt(0) === '@') {
                    return opener + 'l(\'' + item.substr(1) + '\',data)' + closer;
                }
                else if(item.charAt(0) === '{' && item.charAt(1) === '{' && item.charAt(2) === '{') {
                    return parseVar(item.replace(/^\{{3}|\}{3}$/g, '').replace(/^this\.?/, ''), false);
                }
                else if(item.charAt(0) === '{' && item.charAt(1) === '{') {
                    return parseVar(item.replace(/^\{{2}|\}{2}$/g, '').replace(/^this\.?/, ''), true);
                }
                else if (item.charAt(0) === '\\') {
                    return item.charAt(1);
                }
                else if (strEscape) {
                    return self.htmlEscape(item.replace(/\'/g, '\\\''));
                }
                else {
                    return item.replace(/\'/g, '\\\'');
                }
            });
        }

        return split.join('');
    };

    Parser.prototype.matchAttributes = function(attrs) {
        if (!attrs) {
            return '';
        }

        var reg = new RegExp(this.syntax.tagAttributes, 'g');
        var res = [];

        while (true) {
            var match = reg.exec(attrs);
            if (match && match[1]) {
                res.push(match[1]);
                continue;
            }

            break;
        }

        return res.join(' ');
    };

    Parser.prototype.parsePartial = function(partialName) {
        partialName = partialName.replace(/\)$/, '');
        this.append('str', '\'+p(\'' + partialName + '\',data)+\'');
        if (this.partials.indexOf(partialName) === -1) {
            this.partials.push(partialName);
        }

        this.closer.push('');
    };

    Parser.prototype.parsePlain = function(code) {
        this.append('str', code);
        this.closer.push('');
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
            '"': '&quot;',
            '<': '&lt;',
            '>': '&gt;',
            '&': '&amp;'
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

    /**
     * Parse all partials. Returns an array of all partials
     * @return {Array} Returns an array with all parsed partials or null if no partials are present
     * [
     *   {
     *     partial: 'Partialname',
     *     source: Partial source
     *   }
     * ]
     */
    Parser.prototype.partialParser = function() {
        var self = this,
            partialStore = [];

        if (!this.partials.length) {
            return null;
        }

        if (!self.partialsPath) {
            throw new FireTPL.Error('Can not parse partials. Partial path option was not set!');
        }

        this.partials.forEach(function(partial) {
            var source = FireTPL.readFile(self.partialsPath.replace(/\/$/, '') + '/' + partial + '.' + self.tmplType);
            var subParser = new FireTPL.Parser();
            subParser.parse(source, {
                type: self.tmplType,
                partialsPath: self.partialsPath
            });

            partialStore.push({
                partial: partial,
                source: subParser.flush()
            });

            if (subParser.partials.length) {
                partialStore.concat(subParser.partialParser());
            }
        });

        return partialStore.length > 0 ? partialStore : null;
    };

    FireTPL.Parser = Parser;
})(FireTPL);
/**
 * FireTPL i18n parser
 *
 * @module  FireTPL.I18nParser
 */
(function(FireTPL) {
    'use strict';

    /**
     * I18nParser constructor
     *
     * @constructor
     *
     * @example {js}
     * var parser = new FireTPL.Parser();
     * parser.parse('input string');
     * var parsedStr = parser.flush();
     *
     * Options:
     *
     * @arg eventTags {boolean}
     * Strip html event tags and add all into an `on` tag. The tag contains all event tags as a list seperated by a semicolon.
     * For example: `on="click:click-handler;mousedown:mouse-handler"`
     * 
     */
    var I18nParser = function(options) {
        options = options || {};
        
        this.lang = {};
        this.varName = options.varName || 'FireTPL.locale';
    };

    /**
     * Add i18n data
     * @method add
     * @param  {String} lang Language code
     * @param  {Object} data Language data
     */
    I18nParser.prototype.add = function(lang, data) {
        this.flattn(data).forEach(function(item) {
            if (!this.lang[item[0]]) {
                this.lang[item[0]] = {};
            }

            this.lang[item[0]][lang] = item[1];
        }, this);
    };

    /**
     * Add one i18n item
     * @method addItem
     * @param  {String} lang  Language code
     * @param  {String} value Data key
     * @param  {String|Object} value Data value
     */
    I18nParser.prototype.addItem = function(lang, key, value) {
        if (!this.lang[key]) {
            this.lang[key] = {};
        }
        
        this.lang[key][lang] = value;
    };

    /**
     * Parse i18n data
     * @method parse
     * @return {String} Returns parser result
     */
    I18nParser.prototype.parse = function() {
        if (typeof this.lang !== 'object') {
            throw new FireTPL.ParseError('No i18n data found!');
        }

        var replaceVars = function(str) {
            return str.replace(/\$([a-zA-Z][a-zA-Z0-9_.-]*)/g, '\'+data.$1+\'');
        };

        var parseItem = function(val) {
            if (typeof val === 'string') {
                return '\'' + replaceVars(val) + '\'';
            }
            else if (!val) {
                throw new FireTPL.ParseError('Unsupported i18n item! (' + String(val) + ')');
            }
            else if (!val.key) {
                return '\'' + replaceVars(val.plur) || replaceVars(val.sing) + '\'';
            }

            return 'data.' + val.key.replace(/^\$/, '') + '===1?\'' + val.sing + '\':\'' + val.plur + '\'';
        };

        var fn = this.varName + '=function(key,data,lang){var curLang=lang||FireTPL.i18nCurrent;switch(key){';

        for (var el in this.lang) {
            if (this.lang.hasOwnProperty(el)) {
                var item = this.lang[el];

                fn += 'case\'' + el + '\':switch(curLang){';
                
                for (var l in item) {
                    if (l === FireTPL.i18nDefault) {
                        continue;
                    }
                    if (item.hasOwnProperty(l)) {
                        var langItem = item[l];
                        
                        fn += 'case\'' + l + '\':return ' + parseItem(langItem) + ';';
                    }
                }                
                
                if ((FireTPL.i18nDefault in item)) {
                    fn += 'default:return ' + parseItem(item[FireTPL.i18nDefault]) + ';';
                }

                fn += '}';
            }
        }

        fn += 'default:return FireTPL.i18nFallbackText;}};';
        return fn;
    };

    /**
     * Flattn a an i18n data object
     * 
     * @method flattn
     * @private
     * @param  {String} key  Key prefix
     * @param  {Object} data Data object
     * @return {Object}      Returns a flatted data object
     */
    I18nParser.prototype.flattn = function(key, data) {
        if (arguments.length === 1) {
            data = key;
            key = '';
        }

        var values = [];
        for (var el in data) {
            if (data.hasOwnProperty(el)) {
                var item = data[el];
                
                if (typeof item === 'object') {
                    if (typeof item.sing === 'string' || typeof item.plur === 'string') {
                        values.push([key + el, item.key ? item : (item.plur || item.sing)]);
                    }
                    else {
                        values = values.concat(this.flattn(key + el + '.', item));
                    }
                }
                else {
                    values.push([key + el, item]);
                }
            }
        }


        return values;
    };

    //--

    FireTPL.I18nParser = I18nParser;
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
            type: options.type || 'fire',
            pretty: options.pretty
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

        output += 'FireTPL.' + (options.partial ? 'partialCache' : 'templateCache') + '[\'' + tplName + '\']=function(data,scopes) {var t=new FireTPL.Runtime(),h=t.execHelper,l=FireTPL.locale,f=FireTPL.fn,p=t.execPartial;' + precompiled + 'return s;};';

        if (options.commonjs) {
            output += '})(require);';
        }
        else if(options.amd) {
            output += '});';
        }
        else if (options.scope) {
            output += '})(FireTPL);';
        }

        return options.pretty ? this.prettifyJs(output) : output;
    };

    /* +---------- FireTPL methods ---------- */

    FireTPL.precompile = function(tmpl, options) {
        var compiler = new Compiler(options);
        return compiler.precompile(tmpl, options);
    };

    FireTPL.fire2html = function(tmpl, data, options) {
        data = data || {};
        options = options || {};

        var template = FireTPL.compile(tmpl, options);

        if (options.pretty) {
            return FireTPL.prettify(template(data));
        }

        return template(data);
    };

    /**
     * Prettify html output
     * @method prettify
     * @param  {String} html Input html str
     * @return {String}      Prettified html str
     */
    FireTPL.prettify = function(html) {
        var inlineTags = ['a', 'b', 'big', 'dd', 'dt', 'em', 'i', 's', 'small', 'span', 'sub', 'sup',
            'td', 'th', 'track', 'tt', 'u', 'var', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'code', 'br'];
        var voidTags = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'keygen',
            'link', 'meta', 'param', 'track', 'source', 'wbr'];
        var inlineTagPattern = new RegExp('^<(' + inlineTags.join('|') + ')\\b');
        var voidTagPattern = new RegExp('^<(' + voidTags.join('|') + ')\\b');
        var indentStr = '    ';
        var indention = 0;
        var skipNewLine = 0;

        var getIndention = function() {
            var str = '';
            for (var i = 0; i < indention; i++) {
                str += indentStr;
            }

            return str;
        };

        var pat = /(<\/?[a-z][a-z0-9_]+.*?>)/g;
        var split = html.split(pat);

        split = split.map(function(item) {
            if (item === '') {
                return '';
            }

            if (item.charAt(1) === '/') {
                if (skipNewLine > 0) {
                    skipNewLine--;
                    return item + (skipNewLine === 0 ? '\n' : '');
                }

                indention--;
                return  getIndention() + item + '\n';
            }

            if (item.charAt(0) === '<') {
                if (inlineTagPattern.test(item)) {
                    item = (skipNewLine > 0 ? '' : getIndention()) + item;
                    
                    if (voidTagPattern.test(item)) {
                        return item;
                    }

                    skipNewLine++;
                    return item;
                }

                if (voidTagPattern.test(item)) {
                    return getIndention() + item + '\n';
                }
                
                item = getIndention() + item;
                indention++;
                return item + '\n';
            }

            return (skipNewLine === 0 ? getIndention() + item + '\n' : item);
        });


        return split.join('').trim();
    };

    Compiler.prototype.prettifyJs = function(str) {
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

    /**
     * Compile locales
     *
     * @method compileLocales
     * @param  {Object} locales Compiles locales and register it in FireTPL.locale
     * @return {[type]}         [description]
     */
    FireTPL.compileLocales = function(locales) {
        var parser = new FireTPL.I18nParser();
        for (var l in locales) {
            if (locales.hasOwnProperty(l)) {
                var item = locales[l];
                parser.add(l, item);
            }
        }

        //jshint evil:true
        eval(parser.parse());
    };

    FireTPL.Compiler = Compiler;
})(FireTPL);
FireTPL.Syntax = FireTPL.Syntax || {};
FireTPL.Syntax["fire"] = {
    "name": "FireTPL",
    "modifer": "gm",
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
                    "pattern": "(^[ \\t]+|\\n^(?=\\S))"
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
                    "pattern": "(?:\\(?>\\s*(\\S+)\\)?)"
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
                    "pattern": "(?:\"([^]*?)(?:\"(?=\\.?\\s*(?:\\/\\/.+)?$)))"
                }
            ]
        }, {
            "name": "htmlString",
            "func": "parseHtmlString",
            "args": ["htmlStringValue"],
            "parts": [
                {
                    "name": "htmlStringValue",
                    "pattern": "(?:'([^]*?)(?:'(?=\\.?\\s*(?:\\/\\/.+)?$)))"
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
                    "pattern": "(?:[\\t ]*([\\$](?:(?:\\{.+?\\})|(?:\\.?(?:[a-zA-Z][a-zA-Z0-9_-]*)(?:\\((?:[, ]*(?:\"[^\"]*\"|'[^']*'|\\d+))*\\))?)+)))?"
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
            "name": "subHelper",
            "func": "parseSubHelper",
            "args": ["subHelperName", "subHelperExpression", "subHelperTagName", "subHelperTagAttrs"],
            "parts": [
                {
                    "name": "subHelperName",
                    "pattern": "&([a-zA-Z][a-zA-Z0-9_-]*)"
                }, {
                    "name": "subHelperExpression",
                    "pattern": "(?:[\\t ]*([\\$](?:(?:\\{.+?\\})|(?:\\.?(?:[a-zA-Z][a-zA-Z0-9_-]*)(?:\\((?:[, ]*(?:\"[^\"]*\"|'[^']*'|\\d+))*\\))?)+)))?"
                }, {
                    "name": "subHelperTag",
                    "pattern": {
                        "start": "([\\t ]*:[\\t ]*",
                        "end": ")?",
                        "parts": [
                            {
                                "name": "subHelperTagName",
                                "pattern": "([a-zA-Z][a-zA-Z0-9_:-]*)"
                            }, {
                                "name": "subHelperTagAttrs",
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
                    "pattern": "([@\\$]{1,2}(?:(?:\\{.+?\\})|(?:\\.?(?:[a-zA-Z][a-zA-Z0-9_-]*)(?:\\((?:[, ]*(?:\"[^\"]*\"|'[^']*'|\\d+))*\\))?)+))"
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
                    "pattern": "([^]*?)```"
                }
            ]
        }, {
            "name": "lineOption",
            "func": "parseLineOption",
            "args": ["stringLineOption"],
            "parts": [
                {
                    "name": "stringLineOption",
                    "pattern": "(\\.(?=(?:\\s*\\/\\/.+)?$))"
                }
            ]
        }, {
            "name": "doctype",
            "func": "parsePlain",
            "args": ["parseDocType"],
            "parts": [
                {
                    "name": "parseDocType",
                    "pattern": "(^<!DOCTYPE.+?>)"
                }
            ]
        }
    ],
    "stringVariable": "((?:\\\\[${\"'@\\\\])|(?:[@\\$]{1,2}(?:(?:\\{.+?\\})|(?:\\.?(?:[a-zA-Z][a-zA-Z0-9_-]*)(?:\\((?:[, ]*(?:\"[^\"]*\"|'[^']*'|\\d+))*\\))?)+)))",
    "tagAttributes": "([a-zA-Z0-9_]+(?:=(?:(?:\".*?\")|(?:'.*?')|(?:\\S+)))?)"
};
FireTPL.Syntax["hbs"] = {
    "name": "Handelbars",
    "modifer": "gm",
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
            "func": "parseHtmlString",
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
        }, {
            "name": "langVariable",
            "func": "parseVariable",
            "args": ["variableString"],
            "parts": [
                {
                    "name": "variableString",
                    "pattern": "(@(?:\\.?(?:[a-zA-Z][a-zA-Z0-9_-]*))+)"
                }
            ]
        }
    ],
    "stringVariable": "((?:\\\\[${\"'@\\\\])|(?:@[a-z]+)|(?:\\{{2,3}(?:\\.?(?:[a-zA-Z][a-zA-Z0-9_-]*)(?:\\((?:[, ]*(?:\"[^\"]*\"|'[^']*'|\\d+))*\\))?)+\\}{2,3}))",
    "tagAttributes": "([a-zA-Z0-9_]+(?:=(?:(?:\".*?\")|(?:'.*?')|(?:\\S+)))?)"
};
/**
 * FireTPL runtime
 *
 * @module  FireTPL.Runtime
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
        FireTPL.helpers[helper] = fn;
    };

    FireTPL.registerFunction = function(func, fn) {
        FireTPL.fn[func] = fn;
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
        this.partialCache = FireTPL.partialCache;
    };

    Runtime.prototype.exec = function(helper, data, parent, root, fn) {
        console.warn('FireTPL.Runtime.prototype.exec is deprecated! Please use execHelper instead!');
        if (!FireTPL.helpers[helper]) {
            throw new Error('Helper ' + helper + ' not registered!');
        }

        return FireTPL.helpers[helper]({
            data: data,
            parent: parent,
            root: root
        }, fn);
    };

    Runtime.prototype.execHelper = function(helper, data, parent, root, tag, attrs, fn) {
        if (!FireTPL.helpers[helper]) {
            throw new Error('Helper ' + helper + ' not registered!');
        }

        if (typeof tag === 'function') {
            fn = tag;
            tag = null;
            attrs = null;
        }

        return FireTPL.helpers[helper]({
            data: data,
            parent: parent,
            root: root,
            tag: tag,
            attrs: attrs
        }, fn);
    };

    Runtime.prototype.execPartial = function(partialName, data) {
        var partial = this.partialCache[partialName];
        if (!partial) {
            throw new FireTPL.Error('Partial \'' + partialName + '\' was not registered!');
        }

        return partial(data);
    };

    Runtime.prototype.registerPartial = function(partial, fn) {
        this.partialCache[partial] = fn;
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

        var runTime = new FireTPL.Runtime();
                

        if (typeof options === 'string') {
            options = {
                type: options
            };
        }

        if (!/^scopes=scopes/.test(template)) {
            // var fireTpl = new FireTPL.Compiler(options);
            var parser = new FireTPL.Parser(options);
            
            parser.parse(template);
            template = parser.flush();

            var partials = parser.partialParser();
            if (partials) {
                partials.forEach(function(item) {
                    try {
                        runTime.registerPartial(item.partial, 
                            //jshint evil:true
                            eval('(function(data,scopes) {var t = new FireTPL.Runtime(),h=t.execHelper,l=FireTPL.locale,f=FireTPL.fn,p=t.execPartial;' + item.source + 'return s;})')
                        );
                    }
                    catch(err) {
                        console.error('Pregister partial error!', err, err.lineNumber);
                    }
                });
            }
        }

        return function(data, scopes) {
            var h = runTime.execHelper,
                l = FireTPL.locale,
                f = FireTPL.fn,
                p = runTime.execPartial.bind(runTime);

            var s;

            //jshint evil:true
            try {
                var tmpl = '(function(data, scopes) {\n' + template + 'return s;})(data, scopes)';
                return eval(tmpl);
            }
            catch (err) {
                throw new FireTPL.ParseError(err, data, prettify(tmpl));
            }

            return s;
        };
    };

    FireTPL.Runtime = Runtime;

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
/**
 * Comparison functions
 * @module Inline Functions (Comparison)
 */
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

    /**
     * Checks whether str is truthy or not
     *
     * Returns value if str is truthy, otherwise altValue will be returned.
     * If only one arg is passed and str becomes truthy the instr will be returned instead.
     *
     * @group InlineFunctions
     * @method ifTrue
     * @param  {number} value Comparison value
     * @return {boolean}    Returns true if input and value aren't identical
     * @example {fire}
     * $str.ifTrue('Yes', 'No')
     *
     * @example {fire}
     * //$str == 'Yes'
     * $str.ifTrue('No')
     * //returns 'Yes'
     */
    FireTPL.registerFunction('ifTrue', function(str, value, altValue) {
        if (str) {
            return arguments.length === 2 ? str : value;
        }

        return arguments.length === 2 ? value : altValue;
    });

    /**
     * Checks whether str is falsy or not
     *
     * Returns value if str is falsy, otherwise altValue will be returned,
     * if altValue is not given, instr will be returned.
     *
     * @group InlineFunctions
     * @method ifFalse
     * @param  {number} value Comparison value
     * @return {boolean}    Returns true if input and value aren't identical
     * @example {fire}
     * $str.ifFalse('Yes', 'No')
     * 
     * @example {fire}
     * //$str = 'No'
     * $str.ifFalse('Yes')
     * //returns 'No'
     */
    FireTPL.registerFunction('ifFalse', function(str, value, altValue) {
        if (!str) {
            return value;
        }

        return arguments.length === 2 ? str : altValue;
    });
})(FireTPL);
(function(FireTPL) {
    'use strict';
    
    FireTPL.registerFunction('escape', function(str) {
        if (typeof str !== 'string') {
            return str;
        }

        var chars = {
            '"': '&quot;',
            '<': '&lt;',
            '>': '&gt;',
            '&': '&amp;'
        };

        return str.replace(/["&<>]/g, function(ch) {
            return chars[ch];
        });
    });
})(FireTPL);
(function(FireTPL) {
    'use strict';
    var getValue = function(path, obj) {
        if(path) {
            path = path.split('.');
            path.forEach(function(key) {
                obj = obj[key];
            });
        }

        return obj;
    };
    
    FireTPL.registerFunction('lang', function(lng, data) {
        console.log('LNG', lng);
        if (typeof lng === 'object') {
            if (lng.key) {
                var val = getValue(lng.key, data);
                console.log('VAL', val);
                if (val && val === 1) {
                    return lng.sing;
                }
            }

            return lng.plur || lng.sing;
        }

        return lng;
    });
})(FireTPL);
/**
 * Tree helper
 *
 * @module  Tree helper
 * @submodule  Helper
 */

(function() {
    'use strict';

    var helper = function(ctx, fn) {
        // console.log('Call helper', ctx, fn);
        var s = '';

        var ctxFuncs = {
            next: function(item, tag, attrs, itemFn) {
                var s = '';

                // console.log('Call next', item, itemFn);

                if (Array.isArray(item) && item.length) {
                    s = '';

                    if (tag) {
                        s += '<' + tag + (attrs ? ' ' + attrs : '') + '>';
                    }

                    s += helper({
                        data: item,
                        parent: ctx.parent,
                        root: ctx.root,
                        tag: ctx.tag,
                        attrs: ctx.attrs
                    }, fn);

                    if (tag) {
                        s += '</' + tag + '>';
                    }
                }

                return s;
            }
        };

        if (ctx.data) {
            if (Array.isArray(ctx.data)) {
                ctx.data.forEach(function(d) {
                    s += fn.bind(ctxFuncs)(d,ctx.parent, ctx.root);
                });
            }
            else {
                s += fn.bind(ctxFuncs)(ctx.data,ctx.parent, ctx.root);
            }
        }

        return s;
    };

    FireTPL.registerHelper('tree', helper);
})();
/**
 * FireTPL browser extension
 *
 * @module FireTPL Browser extensions
 */
(function(FireTPL) {
    'use strict';

    FireTPL.readFile = function(src) {
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

    /**
     * Synchronous read file function to read a file from file system.
     * @param  {string} file File path
     * @return {String}      Returns file content
     */
    FireTPL.loadFile = function(file) {
        console.warn('FireTPL.loadFile is deprecated! Please use FireTPL.readFile instead!');
        return FireTPL.readFile(file);
    };
})(FireTPL);