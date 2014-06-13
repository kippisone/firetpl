var fs = require('fs');

var LocalePrecompiler = require('../localePrecompiler'),
	glob = require('glob');

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
		var compiler,
			fsExistsStub,
			globStub,
			__glob;

		beforeEach(function() {
			fsExistsStub = sinon.stub(fs, 'exists');
			globStub = sinon.stub();
			__glob = glob;
				
			compiler = new LocalePrecompiler();
		});

		afterEach(function() {
			glob = __glob;
			fsExistsStub.restore();
		});
		
		it('Should compile a locale folder', function() {
			fsExistsStub.yields(true);
			globStub.yields(null, ['/home/test/project/locale/de-DE.json', '/home/test/project/locale/en-EN.json']);


			compiler.parseFolder();
		});
	});
});