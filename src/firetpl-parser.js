(function(FireTPL, undefined) {
	'use strict';

	var Parser = function() {

	};

	Parser.prototype.parse = function() {
		
	};

	Parser.prototype.getSyntaxConf = function(type) {
		var syntaxConf = FireTPL.loadFile('syntax/' + type + '/' + type + '.json');
		if (syntaxConf) {
			syntaxConf = JSON.parse(syntaxConf);
		}

		var pat = [];
		syntaxConf.patterns.forEach(function(p) {
			pat.push(p.match);
		});

		pat = '(' + pat.join(')|(') + ')';
		return pat;
	};

	FireTPL.Parser = Parser;

})(FireTPL);