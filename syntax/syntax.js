FireTPL.Compiler.prototype.syntax = FireTPL.Compiler.prototype.syntax || {};
FireTPL.Compiler.prototype.syntax["fire"] = {
	"name": "FireTPL",
	"patterns": [
		{
			"name": "indention",
			"match": "^([ \\t]+)"
		}, {
			"name": "helper",
			"match": "(?::([a-zA-Z][a-zA-Z0-9_-]*)\\s*(\\$[a-zA-Z][a-zA-Z0-9._-]*)?)"
		}, {
			"name": "string",
			"match": "(\\\"[^\\\"]*\\\")"
		}, {
			"name": "attribute",
			"match": "(\\b[a-zA-Z0-9_]+=(?:(?:\\\"[^\\\"]*\\\")|(?:\\S+)))"
		}, {
			"name": "tag",
			"match": "(?:([a-zA-Z][a-zA-Z0-9:_-]*)+(?:(.*)\\n|$)?)"
		}
	],
	"modifer": "gm",
	"scopes": {
		"1": "indention",
		"2": "helper",
		"3": "expression",
		"4": "string",
		"5": "attribute",
		"6": "tag",
		"7": "tagAttributes"
	}
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
			"match": "(?:(.(?!<\\/?[a-zA-Z0-9_-]+>)*))"
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