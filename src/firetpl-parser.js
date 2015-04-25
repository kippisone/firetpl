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
            'area', 'base', 'br', 'col', 'embed', 'img', 'input',
            'link', 'meta', 'param', 'source', 'wbr'
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
        this.lastTagPos[this.curScope[0]] = this.out[this.curScope[0]].length;

        if (tag === 'dtd') {
            this.append('str', '<!DOCTYPE html>');
            this.closer.push('');
        }
        else {
            this.append('str', '<' + tag + this.matchVariables(attrs) + '>');
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
            this.append('code', 's+=h(\'' + helper + '\',data,parent,root,function(data){var s=\'\';');
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
        var cssClass = 'class="' + ('codeBlock ' + type).trim() + '"';
        code = this.undent(this.indention + 1, code);
        code = this.escape(code).trim();
        code = code.replace(/`(.*)`/g, function(match, p1) {
            return self.matchVariables(p1);
        });

        code = code.replace(/\n/g, '\\n\\\n');
        
        this.append('str', '<code ' + cssClass + '>' + code + '</code>');
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
        var attr = attrName + '="' + this.matchVariables(attrValue.replace(/^["\']|["\']$/g, '')) + '"';

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

    Parser.prototype.parsePartial = function(partialName) {
        this.append('str', '\'+p(\'' + partialName + '\',data)+\'');
        if (this.partials.indexOf(partialName) === -1) {
            this.partials.push(partialName);
        }
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
        });

        return partialStore.length > 0 ? partialStore : null;
    };

    FireTPL.Parser = Parser;
})(FireTPL);