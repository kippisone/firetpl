var LocalePrecompiler = require('../localePrecompiler');

describe('LocalePrecompiler', function() {
	'use strict';
	
	describe('instance', function() {
		var compiler;

		beforeEach(function() {
			compiler = new LocalePrecompiler();
		});

		afterEach(function() {

		});

		it('Shoud be an instance of LocalePrecompiler', function() {
			expect(LocalePrecompiler).to.be.a('function');

			expect(compiler).to.be.an('object');
			expect(compiler).to.be.a(LocalePrecompiler);
		});
	});

	describe('compile', function() {
		it('Should compile a locale folder', function() {
			
		});
	});
});