/*!
 * FireTPL template engine v0.5.0
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
		version: '0.5.0'
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

    FireTPL.Error = FireError;
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

        var template = FireTPL.compile(tmpl, options);
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
			"match": "(\\n?^[ \\t]*)"
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