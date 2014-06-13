var fs = require('fs');

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
		var compiler,
			fsExistsStub,
			globStub,
			readFileStub;

		beforeEach(function() {
			compiler = new LocalePrecompiler();
			fsExistsStub = sinon.stub(fs, 'exists');
			globStub = sinon.stub(compiler,'glob');
			readFileStub = sinon.stub(compiler, 'readFile');
			
		});

		afterEach(function() {
			fsExistsStub.restore();
			globStub.restore();
			readFileStub.restore();
		});
		
		it('Should compile a locale folder', function(done) {
			fsExistsStub.yields(true);
			globStub.yields(null, ['./locale/de-DE.json', './locale/en-EN.json']);
			readFileStub.onFirstCall().returns({'greeding':'Hello World', 'char': 'a'});
			readFileStub.onSecondCall().returns({'greeding':'Hallo Welt', 'letter': 'b'});

			compiler.defaultLocale = 'en-EN';
			compiler.parseFolder('test', function(err, locales) {
				console.log(locales);

				expect(readFileStub).was.calledTwice();
				expect(readFileStub).was.calledWith('./locale/en-EN.json');
				expect(readFileStub).was.calledWith('./locale/de-DE.json');
				
				expect(locales).to.eql({
					'en-EN': {'greeding': 'Hello World', 'char': 'a'},
					'de-DE': {'greeding': 'Hallo Welt', 'char': 'a', 'letter': 'b'}
				});

				done();
			});

		});
	});
});