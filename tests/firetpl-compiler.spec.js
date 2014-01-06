describe('FireTPL', function() {
	'use strict';

	describe('constructor', function() {
		it('Should create a FireTPL.Compiler instance', function() {
			var fireTpl = new FireTPL.Compiler();
			expect(fireTpl).to.be.a(FireTPL.Compiler);
		});
	});

	describe('getIndention', function() {
		it('Should get the number of indention', function() {
			var fireTpl = new FireTPL.Compiler();
			var indention = fireTpl.getIndention('\t\tBla');
			expect(indention).to.eql(2);
		});

		it('Should get indention from an empty string', function() {
			var fireTpl = new FireTPL.Compiler();
			var indention = fireTpl.getIndention('');
			expect(indention).to.eql(0);
		});

		it('Should get indention from a null object', function() {
			var fireTpl = new FireTPL.Compiler();
			var indention = fireTpl.getIndention(null);
			expect(indention).to.eql(0);
		});
	});

	describe('handleIndention', function() {
		it('Should handle indention on indent', function() {
			var fireTpl = new FireTPL.Compiler();
			fireTpl.indention = 2;
			fireTpl.closer = ['a', 'b', 'c'];
			fireTpl.handleIndention('\t\t\t');

			expect(fireTpl.indention).to.be(3);
			expect(fireTpl.closer).to.length(3);
			expect(fireTpl.closer).to.eql(['a', 'b', 'c']);
		});

		it('Should handle indention on outdent', function() {
			var fireTpl = new FireTPL.Compiler();
			fireTpl.indention = 2;
			fireTpl.closer = ['a', 'b', 'c'];
			fireTpl.handleIndention('\t');

			expect(fireTpl.indention).to.be(1);
			expect(fireTpl.closer).to.length(1);
			expect(fireTpl.closer).to.eql(['a']);
		});

		it('Should handle indention on same indention', function() {
			var fireTpl = new FireTPL.Compiler();
			fireTpl.indention = 2;
			fireTpl.closer = ['a', 'b', 'c'];
			fireTpl.handleIndention('\t\t');

			expect(fireTpl.indention).to.be(2);
			expect(fireTpl.closer).to.length(2);
			expect(fireTpl.closer).to.eql(['a', 'b']);
		});

		it('Should handle 5 step outdention', function() {
			var fireTpl = new FireTPL.Compiler();
			fireTpl.indention = 8;
			fireTpl.closer = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'];
			fireTpl.handleIndention('\t\t\t');

			expect(fireTpl.indention).to.be(3);
			expect(fireTpl.closer).to.length(3);
			expect(fireTpl.closer).to.eql(['a', 'b', 'c']);
		});
	});

	describe('append', function() {
		it('Should append to out str', function() {
			var fireTpl = new FireTPL.Compiler();
			fireTpl.out = '';
			fireTpl.append('str', '<div>');
			fireTpl.append('code', 'if(data.bla){');
			fireTpl.append('str', 'Hello');
			fireTpl.append('code', '}');
			fireTpl.append('code', 'else{');
			fireTpl.append('str', 'Good bye');
			fireTpl.append('code', '}');
			fireTpl.append('str', '</div>');
			expect(fireTpl.out).to.equal('s+=\'<div>\';if(data.bla){s+=\'Hello\';}else{s+=\'Good bye\';}s+=\'</div>');
		});
	});

	describe('check pattern', function() {
		it('Should match an empty line', function() {
			var fireTpl = new FireTPL.Compiler();
			var match = fireTpl.pattern.exec('\t\t\t');
			expect(/^\s*$/.test(match[0])).to.be(true);
		});

		it('Should match a line comment', function() {
			var fireTpl = new FireTPL.Compiler();
			var match = fireTpl.pattern.exec('\t\t\t//I\'m a comment');
			expect(match.slice(1)).to.eql([
				'\t\t\t',
				'//I\'m a comment',
				undefined,
				undefined,
				undefined,
				undefined
			]);
		});

		it('Should match a statement', function() {
			var fireTpl = new FireTPL.Compiler();
			var match = fireTpl.pattern.exec('\t\t\tif $bla');
			expect(match.slice(1)).to.eql([
				'\t\t\t',
				undefined,
				'if',
				undefined,
				undefined,
				' $bla'
			]);
		});

		it('Should match a line attribute', function() {
			var fireTpl = new FireTPL.Compiler();
			var match = fireTpl.pattern.exec('\t\t\tfoo=bar');
			expect(match.slice(1)).to.eql([
				'\t\t\t',
				undefined,
				undefined,
				'foo=bar',
				undefined,
				undefined
			]);
		});

		it('Should match a line attribute, value is enclosed with doublequotes', function() {
			var fireTpl = new FireTPL.Compiler();
			var match = fireTpl.pattern.exec('\t\t\tbla="Super bla"');
			expect(match.slice(1)).to.eql([
				'\t\t\t',
				undefined,
				undefined,
				'bla="Super bla"',
				undefined,
				undefined
			]);
		});

		it('Should match a line attribute, value is enclosed with singlequotes', function() {
			var fireTpl = new FireTPL.Compiler();
			var match = fireTpl.pattern.exec('\t\t\tbla=\'Super bla\'');
			expect(match.slice(1)).to.eql([
				'\t\t\t',
				undefined,
				undefined,
				'bla=\'Super bla\'',
				undefined,
				undefined
			]);
		});

		it('Should match a tag', function() {
			var fireTpl = new FireTPL.Compiler();
			var match = fireTpl.pattern.exec('\t\t\tdiv');
			expect(match.slice(1)).to.eql([
				'\t\t\t',
				undefined,
				undefined,
				undefined,
				'div',
				undefined
			]);
		});

		it('Should match a tag with attributes', function() {
			var fireTpl = new FireTPL.Compiler();
			var match = fireTpl.pattern.exec('\t\t\tdiv id="myDiv class="bla blubb"');
			expect(match.slice(1)).to.eql([
				'\t\t\t',
				undefined,
				undefined,
				undefined,
				'div',
				' id="myDiv class="bla blubb"'
			]);
		});
	});

	describe('stripAttributes', function() {
		it('Should strib all attributes from a string', function() {
			var fireTpl = new FireTPL.Compiler();
			var attrs = fireTpl.stripAttributes(' foo=bar bla=blubb');
			expect(attrs).to.eql({
				attrs: ['foo="bar"', 'bla="blubb"'],
				events: []
			});
		});

		it('Should strib all attributes from a empty string', function() {
			var fireTpl = new FireTPL.Compiler();
			var attrs = fireTpl.stripAttributes('');
			expect(attrs).to.eql(null);
		});

		it('Should strib all attributes from a null object', function() {
			var fireTpl = new FireTPL.Compiler();
			var attrs = fireTpl.stripAttributes(null);
			expect(attrs).to.eql(null);
		});

		it('Should strib all attributes and events from a string', function() {
			var fireTpl = new FireTPL.Compiler();
			var attrs = fireTpl.stripAttributes(' foo=bar bla=blubb onShow=myEvent');
			expect(attrs).to.eql({
				attrs: ['foo="bar"', 'bla="blubb"'],
				events: [['onShow', 'myEvent']]
			});
		});

		it('Should strib all events from a string', function() {
			var fireTpl = new FireTPL.Compiler();
			var attrs = fireTpl.stripAttributes(' onFoo=bar onBla=blubb onShow=myEvent');
			expect(attrs).to.eql({
				attrs: [],
				events: [['onFoo', 'bar'], ['onBla', 'blubb'], ['onShow', 'myEvent']]
			});
		});
	});

	describe('injectClass', function() {
		it('Should inject a class into the last tag', function() {
			var fireTpl = new FireTPL.Compiler();
			fireTpl.out = '<div><span>';
			fireTpl.injectClass('injected');
			expect(fireTpl.out).to.equal('<div><span class="injected">');
		});
	});

	describe('precompile', function() {
		it('Should precompile a tmpl string', function() {
			var template = 'html\n';
			template += '	head\n';
			template += '	body\n';
			template += '		div id=myDiv\n';
			template += '		div id=mySecondDiv class=myClass\n';

			var fireTpl = new FireTPL.Compiler();
			template = fireTpl.precompile(template);
			expect(template).to.equal(
				's+=\'<html><head></head><body><div id="myDiv"></div>' +
				'<div id="mySecondDiv" class="myClass"></div>' +
				'</body></html>\';'
			);
		});

		it('Should precompile a tmpl string with inline text', function() {
			var template = 'html\n';
			template += '	head\n';
			template += '	body\n';
			template += '		div id=myDiv\n';
			template += '		div id=mySecondDiv class=myClass\n';
			template += '			Hello World\n';

			var fireTpl = new FireTPL.Compiler();
			template = fireTpl.precompile(template);
			expect(template).to.equal(
				's+=\'<html><head></head><body><div id="myDiv"></div>' +
				'<div id="mySecondDiv" class="myClass">Hello World</div>' +
				'</body></html>\';'
			);
		});

		it('Should precompile a tmpl string with line attribute', function() {
			var template = 'html\n';
			template += '	head\n';
			template += '	body\n';
			template += '		div id=myDiv\n';
			template += '		div\n';
			template += '			id=mySecondDiv\n';
			template += '			class=myClass\n';
			template += '			\n';
			template += '			Hello World\n';

			var fireTpl = new FireTPL.Compiler();
			template = fireTpl.precompile(template);
			expect(template).to.equal(
				's+=\'<html><head></head><body><div id="myDiv"></div>' +
				'<div id="mySecondDiv" class="myClass">Hello World</div>' +
				'</body></html>\';'
			);
		});

		it('Should precompile a tmpl string with an if statement', function() {
			var template = 'html\n';
			template += '	head\n';
			template += '	body\n';
			template += '		if $sayit\n';
			template += '			div\n';
			template += '				Hello World\n';

			var fireTpl = new FireTPL.Compiler();
			template = fireTpl.precompile(template);
			expect(template).to.equal(
				's+=\'<html><head></head><body>\';' + 
				'var c=data.sayit;var r=h.if(c,function(data){var s=\'\';s+=\'' + 
				'<div>Hello World</div>\';' +
				'return s;});s+=r;' +
				's+=\'</body></html>\';'
			);
		});

		it('Should precompile a tmpl string with a if..else statement', function() {
			var template = 'html\n';
			template += '	head\n';
			template += '	body\n';
			template += '		if $sayit\n';
			template += '			div\n';
			template += '				Hello World\n';
			template += '		else\n';
			template += '			div\n';
			template += '				Good bye\n';

			var fireTpl = new FireTPL.Compiler();
			template = fireTpl.precompile(template);
			expect(template).to.equal(
				's+=\'<html><head></head><body>\';' +
				'var c=data.sayit;var r=h.if(c,function(data){var s=\'\';' +
				's+=\'<div>Hello World</div>\';' +
				'return s;});s+=r;' +
				'if(!r){s+=h.else(c,function(data){var s=\'\';' +
				's+=\'<div>Good bye</div>\';' +
				'return s;});}' +
				's+=\'</body></html>\';'
			);
		});

		it('Should precompile a tmpl string with an unless statement', function() {
			var template = 'html\n';
			template += '	head\n';
			template += '	body\n';
			template += '		unless $sayit\n';
			template += '			div\n';
			template += '				Hello World\n';

			var fireTpl = new FireTPL.Compiler();
			template = fireTpl.precompile(template);
			expect(template).to.equal(
				's+=\'<html><head></head><body>\';' +
				's+=h.unless(data.sayit,function(data){var s=\'\';' +
				's+=\'<div>Hello World</div>\';' +
				'return s;});' +
				's+=\'</body></html>\';'
			);
		});

		it('Should precompile a tmpl string with an each statement', function() {
			var template = 'html\n';
			template += '	head\n';
			template += '	body\n';
			template += '		each $listing\n';
			template += '			div\n';
			template += '				Hello World\n';

			var fireTpl = new FireTPL.Compiler();
			template = fireTpl.precompile(template);
			expect(template).to.equal(
				's+=\'<html><head></head><body class="xq-scope xq-scope001">\';' +
				's+=h.each(data.listing,function(data){var s=\'\';' +
				's+=\'<div>Hello World</div>\';' +
				'return s;});' +
				's+=\'</body></html>\';'
			);
		});
	});

	describe('loadFile', function() {
		var server;

		beforeEach(function() {
			server = sinon.fakeServer.create();
			server.autoRespond = true;
		});

		afterEach(function() {
			server.restore();
		});

		it('Should load a template file', function() {
			var content = 'div class=test' + 
				'	h1' + 
				'		$title' + 
				'	div class=description' + 
				'		$description';

			server.respondWith('GET', 'templates/test.fire',
				[200, { 'Content-Type': 'text/plain' },
				content
			]);


			var file = 'templates/test.fire';
			var source = FireTPL.loadFile(file);

			expect(source).to.eql(content);
		});

		it('Should fail loading a template file and should log an error to the console', function() {
			var errorStub = sinon.stub(console, 'error');
			
			server.respondWith('GET', 'templates/test.fire',
				[404, { 'Content-Type': 'text/plain' },
				'Page not found'
			]);


			var file = 'templates/test.fire';
			var source = FireTPL.loadFile(file);

			expect(source).to.eql('');
			expect(errorStub).was.called();
			expect(errorStub).was.calledWith('Loading a FireTPL template failed! Template wasn\'t found!');
			errorStub.restore();
		});

		it('Should fail loading a template file and should log an error to the console', function() {
			var errorStub = sinon.stub(console, 'error');
			
			server.respondWith('GET', 'templates/test.fire',
				[500, { 'Content-Type': 'text/plain' },
				'Something went wrong!'
			]);


			var file = 'templates/test.fire';
			var source = FireTPL.loadFile(file);
			expect(source).to.eql('');
			expect(errorStub).was.called();
			expect(errorStub).was.calledWith('Loading a FireTPL template failed! Server response was: 500 Internal Server Error');
			errorStub.restore();
		});
	});
});