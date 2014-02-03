FireTPL.Compiler.prototype.syntax = FireTPL.Compiler.prototype.syntax || {};
FireTPL.Compiler.prototype.syntax["fire"] = {
	"name": "FireTPL",
	"patterns": [
		{
			"name": "indention",
			"match": "([ \\t]+)"
		}, {
			"name": "tag",
			"match": "([a-zA-Z][a-zA-Z0-9:_-]*)"
		}, {
			"name": "helper",
			"match": "(?::([a-zA-Z][a-zA-Z0-9_-]*)\\s(\\$[a-zA-Z][a-zA-Z0-9._-]*))"
		}, {
			"name": "string",
			"match": "(\")"
		}
	],
	"modifer": "gm",
	"scopes": {
		"1": "indention",
		"2": "tag",
		"3": "helper",
		"4": "expression"
	}
};
FireTPL.Compiler.prototype.syntax["hbs"] = {
	"name": "Handelbars",
	"patterns": [
		{
			"name": "tag",
			"match": "(?:<([a-zA-Z][a-zA-Z0-9:_-]*[^>])*>)"
		}, {
			"name": "endtag",
			"match": "(?:<\\/([a-zA-Z][a-zA-Z0-9:_-]+)>)"
		}, {
			"name": "helper",
			"match": "(?:\\{\\{#([a-zA-Z][a-zA-Z0-9_-]*)(?:\\s*([^\\}]*)\\}\\})?)"
		}, {
			"name": "string",
			"match": "(\")"
		}
	],
	"modifer": "gm",
	"scopes": {
		"1": "tag",
		"2": "endtag",
		"3": "helper",
		"4": "expression"
	}
};