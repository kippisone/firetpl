describe('Shorthand Functions', function() {
	'use strict';

	describe('precompile', function() {
		it('Should fail precompile a template', function() {
			var consoleWarnStub = sinon.stub(console, 'error');
			
			var precompiled = FireTPL.precompile();
			expect(consoleWarnStub).was.calledOnce();
			expect(consoleWarnStub).was.calledWith('Precompilation not possible! The options.name flag must be set!');
			consoleWarnStub.restore();
		});

		it('Should precompile a template', function() {
			var tpl = 'div class=test\n\tspan "Hello World"';
			var precompiled = FireTPL.precompile(tpl, {
				name: 'test'
			});

			expect(precompiled).to.be.a('string');
			expect(precompiled).to.eql('FireTPL.templateCache[\'test\']=function(data,scopes) {var h=new FireTPL.Runtime(),lang=FireTPL.languageCache;scopes=scopes||{};var root=data,parent=data;var s=\'\';s+=\'<div class=\"test\"><span>Hello World</span></div>\';return s;};');
		});

		it('Should precompile a template in CommonJS style', function() {
			var tpl = 'div class=test\n\tspan "Hello World"';
			var precompiled = FireTPL.precompile(tpl, {
				name: 'test',
				commonjs: true
			});

			expect(precompiled).to.be.a('string');
			expect(precompiled).to.eql(';(function(require) {var FireTPL = require(\'firetpl\');FireTPL.templateCache[\'test\']=function(data,scopes) {var h=new FireTPL.Runtime(),lang=FireTPL.languageCache;scopes=scopes||{};var root=data,parent=data;var s=\'\';s+=\'<div class=\"test\"><span>Hello World</span></div>\';return s;};})(require);');
		});

		it('Should precompile a template in AMD style', function() {
			var tpl = 'div class=test\n\tspan "Hello World"';
			var precompiled = FireTPL.precompile(tpl, {
				name: 'test',
				amd: true
			});

			expect(precompiled).to.be.a('string');
			expect(precompiled).to.eql('define([\'firetpl\'],function(FireTPL) {FireTPL.templateCache[\'test\']=function(data,scopes) {var h=new FireTPL.Runtime(),lang=FireTPL.languageCache;scopes=scopes||{};var root=data,parent=data;var s=\'\';s+=\'<div class=\"test\"><span>Hello World</span></div>\';return s;};});');
		});
	});
});