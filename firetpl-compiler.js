/*!
 * FireTPL template engine v0.5.4-19
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
        version: '0.5.4-19',

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

        console.error('FireTPL parse error', err);
        console.error(err.stack);

        if (data) {
            console.log('Data: ', data);
        }

        if (tmpl) {
            console.log('----- Template source -----');
            console.log(prettify(tmpl));
            console.log('----- Template source -----');
        }
    };

    FireTPL.Error = FireError;
    FireTPL.ParseError = ParseError;
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

        return output;
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

                item = getIndention() + item;
                indention++;
                return item + '\n';
            }

            return (skipNewLine === 0 ? getIndention() + item + '\n' : item);
        });


        return split.join('').trim();
    };

    FireTPL.compileLang = function(lang) {
        
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
                    "pattern": "(\\.(?=(\\s*\\/\\/.+)?$))"
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
    ]
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