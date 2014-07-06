(function(FireTPL, undefined) {

	FireTPL.Error = function(instance, msg) {
		if (typeof instance === 'object') {
			if (instance instanceof FireTPL.Compiler) {
				var pos = instance.pos;
				msg = msg + '\n\n' + this.stripSource(pos, instance.tmpl);
			}
		}
		else if (arguments.length) {
			msg = instance;
		}

		return new Error(msg);
	};

	FireTPL.Error.prototype.stripSource = function(pos, tmpl) {
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

	FireTPL.Error.prototype.strRepeat = function(num, str) {
		var out = '';

		while(--num) {
			out += str;

			if (num === -10) {
				throw 'Loop error';
			}
		}

		return out;
	};

})(FireTPL);