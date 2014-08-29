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
			"match": "([@\\$][a-zA-Z][a-zA-Z0-9._()-]*)"
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
	"addEmptyCloseTags": true
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
			"name": "helperEnd",
			"match": "(?:\\{\\{\\/([a-zA-Z][a-zA-Z0-9_-]*)\\}\\})"
		}, {
			"name": "variable",
			"match": "(\\{\\{\\{?[a-zA-Z][a-zA-Z0-9._-]+\\}\\}\\}?)"
		}, {
			"name": "string",
			"xmatch": "((?:.(?!<))+.)",
			"match": "([^(<|\\{\\{)]+)"
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
		"8": "helperEnd",
		"9": "variable",
		"10": "string"
	}
};