describe.skip('Parser', function() {
	'use strict';

	describe('constructor', function() {
		it('Should initialize a new instance', function() {
			console.log(FireTPL);
			var fireTpl = new FireTPL.Parser();
			expect(fireTpl).to.be.a(FireTPL.Parser);
		});
	});

	describe('getSyntaxConf', function() {
		var fireTpl;

		beforeEach(function() {
			fireTpl = new FireTPL.Parser();
		});

		it('Should load a syntax configuration file', function() {
			var conf = fireTpl.getSyntaxConf('fire');
			expect(conf).to.eql({
				
			});
		});
	});
});