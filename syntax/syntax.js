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
FireTPL.Compiler.prototype.syntax["hbs"] = {
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
		}
	]
};