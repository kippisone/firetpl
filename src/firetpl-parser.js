/**
 * FireTPL parser
 *
 * @module  Parser
 */
module.exports = function(FireTPL) {
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

        this.syntax = this.getSyntaxConf(this.tmplType);
    };

    /**
     * Parses an input string
     * 
     * @param  {string} input Input string
     */
    Parser.prototype.parse = function(input) {
        var pat = this.patternBuilder();

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
            match = reg.exec(input);
            this.pos = pat.lastIndex;

            if (!match) {
                break;
            }

            // console.log(match);
            // console.log(pat);
            for (var i = 0, len = pat.funcs.length; i < len; i++) {
                if (match[pat.funcs[i].index]) {
                    //Map args
                    var args = pat.funcs[i].args.map(mapArgs);

                    //Call parser func
                    // console.log('Call:', pat.funcs[i].func);
                    this[pat.funcs[i].func].apply(this, args);
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

        // var outStream = 'scopes=scopes||{};var root=data,parent=data;';
        var outStream = '';
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

        // outStream += 'var s=\'\';';
        outStream += this.out.root;

        if (this.lastItemType === 'str') {
            outStream += '\';';
        }

        return outStream;
    };

    /**
     * Parse a tag
     * 
     * @private
     * @param  {string} tag Tag name
     */
    Parser.prototype.parseTag = function(tag) {
        this.append('str', '<' + tag + '>');
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
                
        this.indention = indention;
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
     * Parse a string
     * 
     * @private
     * @param  {string} str Tag name
     */
    Parser.prototype.parseString = function(str) {
        str = str.trim().replace(/\s+/g, ' ');
        str = this.matchVariables(str);
        this.append('str', str);
        if (this.addEmptyCloseTags && this.tmplType === 'fire') {
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
        
    };

    /**
     * Parse a helper
     * 
     * @private
     * @param  {string} helper Tag name
     */
    Parser.prototype.parseHelper = function(helper) {
        
    };

    /**
     * Parse a code block
     * 
     * @private
     * @param  {string} code block Tag name
     */
    Parser.prototype.parseCodeBlock = function(code) {
        
    };

    /**
     * Parse a attribute
     * 
     * @private
     * @param  {string} attribute Tag name
     */
    Parser.prototype.parseAttribute = function(attribute) {
        
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
            return arg.replace(/^["']|["']$/g, '');
        };

        var parseVar = function(m) {
            console.log('Parse var', m);
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
                        args = args.match(/\"[^\"]*\"|\'[^\']*\'/g).map(mapArgs);
                    }

                    funcs.push([func, args]);
                    continue;
                }

                vars.push(chunks[i]);
            }
            
            // console.log(' ... vars', vars);
            // console.log(' ... funcs', funcs);
            //console.log(' ... scopeTags', self.scopeTags);
            //console.log(' ... curScope', self.curScope);
            //console.log(' ... isCode', isCode);

            m = vars.join('.');
            for (i = 0, len = funcs.length; i < len; i++) {
                m = 'f.' + funcs[i][0] + '(' + m + (funcs[i][1] ? ',\'' + funcs[i][1].join('\',\'') + '\'' : '') + ')';
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
        var reg = new RegExp(pat.pattern, 'g');
        str = str.replace(/\'/g, '\\\'').replace(reg, function(match) {
            console.log('Match', match);
            if (match.charAt(0) === '@') {
                return opener + 'l.' + match.substr(1) + closer;
            }

            return parseVar(match.substr(1).replace(/^this\.?/, ''));

            if (self.tmplType === 'hbs') {
                return match
                    .replace(/\'/g, '\\\'')
                    .replace(/\{\{([a-zA-Z0-9._-]+)\}\}/g, opener + 'data.$1' + closer)
                    .replace(/\{\{\{([a-zA-Z0-9._-]+)\}\}\}/g, opener + 'data.$1' + closer)
                    .replace(/\{\{@([a-zA-Z0-9._-]+)\}\}/g, '\'+l.$1+\'');
            }
            else {

                str = str
                    .replace(/\'/g, '\\\'')
                    // .replace(/\$/g, function(match, p1, p2, p3, p4) {
                    //.replace(/\$(?:(?:\{((?:[a-zA-Z0-9_-]*)(?:\.[a-zA-Z0-9_-]+(?:\((?:\"[^\"]*\"|\'[^\']*\')*\))?)*)\})|((?:[a-zA-Z0-9_-]*)(?:\.[a-zA-Z0-9_-]+(?:\((?:\"[^\"]*\"|\'[^\']*\')*\))?)*))/g, function(match, p1, p2) {
                    .replace(/^\$\{?(.*)\}?$/g, function(match, p1, p2) {
                        console.log('Match', match, p1);
                        var m = p1 || p2;
                        if (/^this\b/.test(m)) {
                            return parseVar(m.replace(/^this\.?/, ''));
                        }
                        
                        return parseVar(m);
                        
                    })
                    .replace(/@([a-zA-Z0-9._-]+)/g, '\'+l.$1+\'');
            }
        });


        return str;
    };

    /**
     * Creates a human readable error output
     *
     * Generates an error message and shows the area of code where the error has been occurred.
     * Uses the this.pos property to determine the error position
     *
     * @private
     * @param {string} msg Error message
     */
    Parser.prototype.createError = function(msg) {
        
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
        return require('../syntax/' + type + '/' + type + '.json');
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

    return Parser;
};