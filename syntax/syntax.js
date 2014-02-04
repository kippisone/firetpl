FireTPL.Compiler.prototype.syntax = FireTPL.Compiler.prototype.syntax || {};
FireTPL.Compiler.prototype.syntax["fire"] = {
	"name": "FireTPL",
	"patterns": [
		{
			"name": "indention",
			"match": "^([ \\t]+)"
		}, {
			"name": "helper",
			"match": "(?:\\b:([a-zA-Z][a-zA-Z0-9_-]*)\\s(\\$[a-zA-Z][a-zA-Z0-9._-]*))"
		}, {
			"name": "attribute",
			"match": "(\\b[a-zA-Z0-9_]+=(?:(?:\\\"[^\\\"]*\\\")|(?:\\S+)))"
		}, {
			"name": "tag",
			"match": "(?:(?:^|\\s+)([a-zA-Z][a-zA-Z0-9:_-]*)+(?=\\b)(?:(.*)\\n|$)?)"
		}, {
			"name": "string",
			"match": "(\\\"[^\\\"]*\\\"])"
		}
	],
	"modifer": "gm",
	"scopes": {
		"1": "indention",
		"2": "helper",
		"3": "attribute",
		"4": "tag",
		"5": "tagAttributes",
		"6": "expression",
		"7": "string"
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
			"match": "(?:\\{\\{#([a-zA-Z][a-zA-Z0-9_-]*)(?:\\s*([^\\}]*)\\}\\})?)"
		}, {
			"name": "attribute",
			"match": "([a-zA-Z0-9_]+=(?:(?:\\\"[^\\\"]*\\\")|(?:\\'[^\\']*\\')|(?:\\S)))"
		}, {
			"name": "string",
			"match": "(.*(?=<\/?[a-zA-Z]))"
		}
	],
	"modifer": "gm",
	"scopes": {
		"1": "unused",
		"2": "tag",
		"3":"tagAttributes",
		"4": "endtag",
		"5": "helper",
		"6": "expression",
		"7": "string"
	}
};