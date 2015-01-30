describe('FireTPL', function() {
	'use strict';

	var tmplScope = {
		out: 'scopes=scopes||{};var root=data,parent=data;',
		if: function(str) {
			this.out += 'scopes.scope001=function(data,parent){var s=\'\';var c=data;var r=h.exec(\'if\',c,parent,root,function(data){var s=\'';
			this.out += str;
			this.out += '\';return s;});s+=r;return s;};';
			return this;
		},
		each: function(str) {
			return this;
		},
		root: function(str) {
			this.out += 'var s=\'\';s+=\'' + str + '\';';
			var out = this.out;
			this.out = 'scopes=scopes||{};var root=data,parent=data;';
			return out;
		}
	};

	describe('constructor', function() {
		it('Should create a FireTPL.Compiler instance', function() {
			var fireTpl = new FireTPL.Compiler();
			expect(fireTpl).to.be.a(FireTPL.Compiler);
		});

		it('Should set a syntax config', function() {
			var fireTpl = new FireTPL.Compiler();
			expect(fireTpl.syntax).to.be.an('object');
		});

		it('Should set a .fire syntax config', function() {
			var fireTpl = new FireTPL.Compiler();
			expect(fireTpl.syntax).to.be.an('object');
			expect(fireTpl.syntax.fire).to.be.an('object');
		});

		it('Should set a .hbs syntax config', function() {
			var fireTpl = new FireTPL.Compiler();
			expect(fireTpl.syntax).to.be.an('object');
			expect(fireTpl.syntax.hbs).to.be.an('object');
		});

		it('Should enable scope tags', function() {
			var fireTpl = new FireTPL.Compiler({
				scopeTags: true
			});

			expect(fireTpl.scopeTags).to.be(true);
		});
	});

	describe('shorthand functions', function() {
		it('Should enable scope tags', function() {
			var constructorSpy = sinon.spy(FireTPL, 'Compiler');
			
			FireTPL.precompile('', {
				scopeTags: true,
				name: 'test'
			});

			expect(constructorSpy.thisValues[0].scopeTags).to.be(true);
			constructorSpy.restore();
		});
	});

	describe('getPattern', function() {
		var fireTpl;

		beforeEach(function() {
			fireTpl = new FireTPL.Compiler();
			fireTpl._syntax = fireTpl.syntax;

			fireTpl.syntax = {};
			fireTpl.syntax.fire = {
				"patterns": [
					{
						"name": "indention",
						"match": "([ \\t]*)"
					}, {
						"name": "tag",
						"match": "([a-zA-Z][a-zA-Z0-9:_-]*)"
					}, {
						"name": "helper",
						"match": "(:[a-zA-Z][a-zA-Z0-9_-]*)"
					}, {
						"name": "string",
						"match": "(\\\"[^\\\"]*\\\")"
					}
				],
				"modifer": "gm",
				"scopes": {
					"1": "indention",
					"2": "tag",
					"3": "helper",
					"4": "string"
				}
			};

			fireTpl.syntax.hbs = {
				"patterns": [
					{
						"name": "tag",
						"match": "(<[a-zA-Z][a-zA-Z0-9:_-]*[^>]*>)"
					}, {
						"name": "helper",
						"match": "(:[a-zA-Z][a-zA-Z0-9_-]*)"
					}, {
						"name": "string",
						"match": "(\"[^\"]*\")"
					}
				],
				"modifer": "g",
				"scopes": {
					"2": "tag",
					"3": "helper",
					"4": "string"
				}
			};	
		});

		afterEach(function() {
			fireTpl.syntax = fireTpl._syntax;
		});

		it('Should get a pattern of the current template type', function() {
			var syntaxConf = fireTpl.getPattern('fire');
			expect(syntaxConf.pattern.source).to.eql(/([ \t]*)|([a-zA-Z][a-zA-Z0-9:_-]*)|(:[a-zA-Z][a-zA-Z0-9_-]*)|(\"[^\"]*\")/gm.source);
			expect(syntaxConf.scopes).to.eql({
				"1": "indention",
				"2": "tag",
				"3": "helper",
				"4": "string"
			});
		});
	});

	describe('getPattern syntax check', function() {
		var fireTpl;

		beforeEach(function() {
			fireTpl = new FireTPL.Compiler();
		});

		it('Should get a html tag (.hbs)', function() {
			var pattern = fireTpl.getPattern('hbs');

			var match = pattern.pattern.exec('<div class="bla"><h1>');
			expect(match[0]).to.eql('<div class="bla">');
		});
	});

	describe('stripAttributes', function() {
		it('Should strib all attributes from a string', function() {
			var fireTpl = new FireTPL.Compiler();
			var attrs = fireTpl.stripAttributes(' foo=bar bla=blubb');
			expect(attrs).to.eql({
				attrs: ['foo="bar"', 'bla="blubb"'],
				events: [],
				content: []
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
				events: ['show:myEvent'],
				content: []
			});
		});

		it('Should strib all events from a string', function() {
			var fireTpl = new FireTPL.Compiler();
			var attrs = fireTpl.stripAttributes(' onFoo=bar onBla=blubb onShow=myEvent');
			expect(attrs).to.eql({
				attrs: [],
				events: ['foo:bar', 'bla:blubb', 'show:myEvent'],
				content: []
			});
		});

		it('Should strib all strings from a string', function() {
			var fireTpl = new FireTPL.Compiler();
			var attrs = fireTpl.stripAttributes('"Hello Andi"');
			expect(attrs).to.eql({
				attrs: [],
				events: [],
				content: ['Hello Andi']
			});
		});

		it('Should strib all strings from a string', function() {
			var fireTpl = new FireTPL.Compiler();
			var attrs = fireTpl.stripAttributes('"Hello Andi, my name is:" $name');
			expect(attrs).to.eql({
				attrs: [],
				events: [],
				content: ['Hello Andi, my name is:', '\'+data.name+\'']
			});
		});
	});

	describe('parseTag', function() {
		var fireTpl;

		beforeEach(function() {
			fireTpl = new FireTPL.Compiler();
		});

		it('Should parse a tag', function() {
			fireTpl.parseTag('section');

			expect(fireTpl.out.root).to.eql('s+=\'<section>');
			expect(fireTpl.closer).to.eql(['</section>']);
		});

		it('Should parse a tag with attributes', function() {
			fireTpl.parseTag('section', 'class=listing');

			expect(fireTpl.out.root).to.eql('s+=\'<section class="listing">');
			expect(fireTpl.closer).to.eql(['</section>']);
		});

		it('Should parse a tag with multiple attributes', function() {
			fireTpl.parseTag('section', 'class=listing title="My Section"');

			expect(fireTpl.out.root).to.eql('s+=\'<section class="listing" title="My Section">');
			expect(fireTpl.closer).to.eql(['</section>']);
		});

		it('Should parse a tag with events', function() {
			fireTpl.parseTag('section', 'onClick=item-click');

			expect(fireTpl.out.root).to.eql('s+=\'<section on="click:item-click">');
			expect(fireTpl.closer).to.eql(['</section>']);
		});

		it('Should parse a tag with multiple events', function() {
			fireTpl.parseTag('section', 'onClick=item-click onDrag="item-drag" onDrop="item-drop"');

			expect(fireTpl.out.root).to.eql('s+=\'<section on="click:item-click;drag:item-drag;drop:item-drop">');
			expect(fireTpl.closer).to.eql(['</section>']);
		});

		it('Should parse a tag with multiple events and attributes', function() {
			fireTpl.parseTag('section', 'class=listing onClick=item-click onDrag="item-drag" onDrop="item-drop" title="My Section"');

			expect(fireTpl.out.root).to.eql('s+=\'<section class="listing" title="My Section" on="click:item-click;drag:item-drag;drop:item-drop">');
			expect(fireTpl.closer).to.eql(['</section>']);
		});

		it('Should parse a tag with a inline variable', function() {
			fireTpl.parseTag('section', '$title');

			expect(fireTpl.out.root).to.eql('s+=\'<section>\'+data.title+\'');
			expect(fireTpl.closer).to.eql(['</section>']);
		});

		it('Should parse a tag with a inline function', function() {
			fireTpl.parseTag('section', '$title.foo()');

			expect(fireTpl.out.root).to.eql('s+=\'<section>\'+f.foo(data.title)+\'');
			expect(fireTpl.closer).to.eql(['</section>']);
		});

		it('Should parse a tag with a inline function with args', function() {
			fireTpl.parseTag('section', '$title.foo("bla")');

			expect(fireTpl.out.root).to.eql('s+=\'<section>\'+f.foo(data.title, \'bla\')+\'');
			expect(fireTpl.closer).to.eql(['</section>']);
		});

		it('Should parse a tag with attributes and a inline variable', function() {
			fireTpl.parseTag('section', 'class=listing $title');

			expect(fireTpl.out.root).to.eql('s+=\'<section class="listing">\'+data.title+\'');
			expect(fireTpl.closer).to.eql(['</section>']);
		});

		it('Should parse a tag with a inline lang-variable', function() {
			fireTpl.parseTag('section', '@title');

			expect(fireTpl.out.root).to.eql('s+=\'<section>\'+l.title+\'');
			expect(fireTpl.closer).to.eql(['</section>']);
		});

		it('Should parse a tag with attributes and a inline lang-variable', function() {
			fireTpl.parseTag('section', 'class=listing @title');

			expect(fireTpl.out.root).to.eql('s+=\'<section class="listing">\'+l.title+\'');
			expect(fireTpl.closer).to.eql(['</section>']);
		});

		it('Should parse a tag with a inline text', function() {
			fireTpl.parseTag('section', '"Hello World"');

			expect(fireTpl.out.root).to.eql('s+=\'<section>Hello World');
			expect(fireTpl.closer).to.eql(['</section>']);
		});

		it('Should parse a tag with attributes and a inline text', function() {
			fireTpl.parseTag('section', 'class=listing "Hello World"');

			expect(fireTpl.out.root).to.eql('s+=\'<section class="listing">Hello World');
			expect(fireTpl.closer).to.eql(['</section>']);
		});
	});

	describe('parseFuncs', function() {
		var fireTpl;

		before(function() {
			fireTpl = new FireTPL.Compiler();
			fireTpl.addEmptyCloseTags = true;
		});

		it('Should append a header tag', function() {
			fireTpl.parseTag('header');

			expect(fireTpl.out.root).to.eql('s+=\'<header>');
			expect(fireTpl.closer).to.eql(['</header>']);
		});

		it(' ... append an indention (+1)', function() {
			fireTpl.handleIndention('\t');

			expect(fireTpl.out.root).to.eql('s+=\'<header>');
			expect(fireTpl.closer).to.eql(['</header>']);
		});

		it(' ... append a h1 tag', function() {
			fireTpl.parseTag('h1', '"Hello World"');

			expect(fireTpl.out.root).to.eql('s+=\'<header><h1>Hello World');
			expect(fireTpl.closer).to.eql(['</header>', '</h1>']);
		});

		it(' ... append an indention (-1)', function() {
			fireTpl.handleIndention('');

			expect(fireTpl.out.root).to.eql('s+=\'<header><h1>Hello World</h1></header>');
			expect(fireTpl.closer).to.eql([]);
		});

		it(' ... append a section tag', function() {
			fireTpl.parseTag('section', 'class=main');

			expect(fireTpl.out.root).to.eql('s+=\'<header><h1>Hello World</h1></header><section class="main">');
			expect(fireTpl.closer).to.eql(['</section>']);
		});

		it(' ... append an indention (+1)', function() {
			fireTpl.handleIndention('\t');

			expect(fireTpl.out.root).to.eql('s+=\'<header><h1>Hello World</h1></header><section class="main">');
			expect(fireTpl.closer).to.eql(['</section>']);
		});

		it(' ... append a ul tag', function() {
			fireTpl.parseTag('ul', 'class="listing"');

			expect(fireTpl.out.root).to.eql(
				's+=\'<header><h1>Hello World</h1></header><section class="main">' +
				'<ul class="listing">'
			);
			expect(fireTpl.closer).to.eql(['</section>', '</ul>']);
		});

		it(' ... append an indention (+1)', function() {
			fireTpl.handleIndention('\t\t');

			expect(fireTpl.out.root).to.eql(
				's+=\'<header><h1>Hello World</h1></header><section class="main">' +
				'<ul class="listing">'
			);
			expect(fireTpl.closer).to.eql(['</section>', '</ul>']);
		});

		it(' ... append an each helper', function() {
			fireTpl.parseHelper('each', '$listing');

			expect(fireTpl.out.root).to.eql(
				's+=\'<header><h1>Hello World</h1></header><section class="main">' +
				'<ul class="listing">\';s+=scopes.scope001(data.listing,data);'
			);

			expect(fireTpl.out.scope001).to.eql(
				's+=h.exec(\'each\',data,parent,root,function(data){var s=\'\';'
			);

			expect(fireTpl.closer).to.eql(['</section>', '</ul>', '', ['code', 'return s;});'], 'scope']);
		});

		it(' ... append an indention (+1)', function() {
			fireTpl.handleIndention('\t\t\t');

			expect(fireTpl.out.root).to.eql(
				's+=\'<header><h1>Hello World</h1></header><section class="main">' +
				'<ul class="listing">\';s+=scopes.scope001(data.listing,data);'
			);

			expect(fireTpl.out.scope001).to.eql(
				's+=h.exec(\'each\',data,parent,root,function(data){var s=\'\';'
			);

			expect(fireTpl.closer).to.eql(['</section>', '</ul>', '', ['code', 'return s;});'], 'scope']);
		});

		it(' ... append a li tag', function() {
			fireTpl.parseTag('li', 'class="item"');

			expect(fireTpl.out.root).to.eql(
				's+=\'<header><h1>Hello World</h1></header><section class="main">' +
				'<ul class="listing">\';s+=scopes.scope001(data.listing,data);'
			);

			expect(fireTpl.out.scope001).to.eql(
				's+=h.exec(\'each\',data,parent,root,function(data){var s=\'\';' +
				's+=\'<li class="item">'
			);

			expect(fireTpl.closer).to.eql(['</section>', '</ul>', '', ['code', 'return s;});'], 'scope', '</li>']);
		});

		it(' ... append an indention (+1)', function() {
			fireTpl.handleIndention('\t\t\t\t');

			expect(fireTpl.out.root).to.eql(
				's+=\'<header><h1>Hello World</h1></header><section class="main">' +
				'<ul class="listing">\';s+=scopes.scope001(data.listing,data);'
			);

			expect(fireTpl.out.scope001).to.eql(
				's+=h.exec(\'each\',data,parent,root,function(data){var s=\'\';' +
				's+=\'<li class="item">'
			);

			expect(fireTpl.closer).to.eql(['</section>', '</ul>', '', ['code', 'return s;});'], 'scope', '</li>']);
		});

		it(' ... append a img tag', function() {
			fireTpl.parseTag('img', 'src="$url"');

			expect(fireTpl.out.root).to.eql(
				's+=\'<header><h1>Hello World</h1></header><section class="main">' +
				'<ul class="listing">\';s+=scopes.scope001(data.listing,data);'
			);

			expect(fireTpl.out.scope001).to.eql(
				's+=h.exec(\'each\',data,parent,root,function(data){var s=\'\';' +
				's+=\'<li class="item"><img src="\'+data.url+\'">'
			);

			expect(fireTpl.closer).to.eql(['</section>', '</ul>', '', ['code', 'return s;});'], 'scope', '</li>', '']);
		});

		it(' ... append an indention (0)', function() {
			fireTpl.handleIndention('\t\t\t\t');

			expect(fireTpl.out.root).to.eql(
				's+=\'<header><h1>Hello World</h1></header><section class="main">' +
				'<ul class="listing">\';s+=scopes.scope001(data.listing,data);'
			);

			expect(fireTpl.out.scope001).to.eql(
				's+=h.exec(\'each\',data,parent,root,function(data){var s=\'\';' +
				's+=\'<li class="item"><img src="\'+data.url+\'">'
			);

			expect(fireTpl.closer).to.eql(['</section>', '</ul>', '', ['code', 'return s;});'], 'scope', '</li>']);
		});

		it(' ... append a span tag', function() {
			fireTpl.parseTag('span', '$name');

			expect(fireTpl.out.root).to.eql(
				's+=\'<header><h1>Hello World</h1></header><section class="main">' +
				'<ul class="listing">\';s+=scopes.scope001(data.listing,data);'
			);

			expect(fireTpl.out.scope001).to.eql(
				's+=h.exec(\'each\',data,parent,root,function(data){var s=\'\';' +
				's+=\'<li class="item"><img src="\'+data.url+\'"><span>\'+data.name+\''
			);

			expect(fireTpl.closer).to.eql(['</section>', '</ul>', '', ['code', 'return s;});'], 'scope', '</li>', '</span>']);
		});

		it(' ... close all tags, indention === 0', function() {
			fireTpl.handleIndention('');

			expect(fireTpl.out.root).to.eql(
				's+=\'<header><h1>Hello World</h1></header><section class="main">' +
				'<ul class="listing">\';s+=scopes.scope001(data.listing,data);' +
				's+=\'</ul></section>'
			);

			expect(fireTpl.out.scope001).to.eql(
				's+=h.exec(\'each\',data,parent,root,function(data){var s=\'\';' +
				's+=\'<li class="item"><img src="\'+data.url+\'"><span>\'+data.name+\'</span></li>\';return s;});'
			);

			expect(fireTpl.closer).to.eql([]);
		});

		it(' ... append a footer tag', function() {
			fireTpl.parseTag('footer');

			expect(fireTpl.out.root).to.eql(
				's+=\'<header><h1>Hello World</h1></header><section class="main">' +
				'<ul class="listing">\';s+=scopes.scope001(data.listing,data);' +
				's+=\'</ul></section><footer>'
			);

			expect(fireTpl.out.scope001).to.eql(
				's+=h.exec(\'each\',data,parent,root,function(data){var s=\'\';' +
				's+=\'<li class="item"><img src="\'+data.url+\'"><span>\'+data.name+\'</span></li>\';return s;});'
			);

			expect(fireTpl.closer).to.eql(['</footer>']);
		});

		it(' ... append an indention (+1)', function() {
			fireTpl.handleIndention('\t');

			expect(fireTpl.out.root).to.eql(
				's+=\'<header><h1>Hello World</h1></header><section class="main">' +
				'<ul class="listing">\';s+=scopes.scope001(data.listing,data);' +
				's+=\'</ul></section><footer>'
			);

			expect(fireTpl.out.scope001).to.eql(
				's+=h.exec(\'each\',data,parent,root,function(data){var s=\'\';' +
				's+=\'<li class="item"><img src="\'+data.url+\'"><span>\'+data.name+\'</span></li>\';return s;});'
			);

			expect(fireTpl.closer).to.eql(['</footer>']);
		});

		it(' ... append a span tag', function() {
			fireTpl.parseTag('span');

			expect(fireTpl.out.root).to.eql(
				's+=\'<header><h1>Hello World</h1></header><section class="main">' +
				'<ul class="listing">\';s+=scopes.scope001(data.listing,data);' +
				's+=\'</ul></section><footer><span>'
			);

			expect(fireTpl.out.scope001).to.eql(
				's+=h.exec(\'each\',data,parent,root,function(data){var s=\'\';' +
				's+=\'<li class="item"><img src="\'+data.url+\'"><span>\'+data.name+\'</span></li>\';return s;});'
			);

			expect(fireTpl.closer).to.eql(['</footer>', '</span>']);
		});

		it(' ... append an indention (0)', function() {
			fireTpl.handleIndention('\t');

			expect(fireTpl.out.root).to.eql(
				's+=\'<header><h1>Hello World</h1></header><section class="main">' +
				'<ul class="listing">\';s+=scopes.scope001(data.listing,data);' +
				's+=\'</ul></section><footer><span></span>'
			);

			expect(fireTpl.out.scope001).to.eql(
				's+=h.exec(\'each\',data,parent,root,function(data){var s=\'\';' +
				's+=\'<li class="item"><img src="\'+data.url+\'"><span>\'+data.name+\'</span></li>\';return s;});'
			);

			expect(fireTpl.closer).to.eql(['</footer>']);
		});

		it(' ... append a if helper (same indention)', function() {
			fireTpl.parseHelper('if', '$isAdmin');

			expect(fireTpl.out.root).to.eql(
				's+=\'<header><h1>Hello World</h1></header><section class="main">' +
				'<ul class="listing">\';s+=scopes.scope001(data.listing,data);' +
				's+=\'</ul></section><footer><span></span>\';s+=scopes.scope002(data.isAdmin,data);' +
				''
			);

			expect(fireTpl.out.scope002).to.eql(
				'var c=data;var r=h.exec(\'if\',c,parent,root,function(data){var s=\'\';'
			);

			expect(fireTpl.closer).to.eql(['</footer>', '', ['code', 'return s;});s+=r;'], 'scope']);
		});

		it(' ... append an indention (+1)', function() {
			fireTpl.handleIndention('\t\t');

			expect(fireTpl.out.root).to.eql(
				's+=\'<header><h1>Hello World</h1></header><section class="main">' +
				'<ul class="listing">\';s+=scopes.scope001(data.listing,data);' +
				's+=\'</ul></section><footer><span></span>\';s+=scopes.scope002(data.isAdmin,data);' +
				''
			);

			expect(fireTpl.out.scope002).to.eql(
				'var c=data;var r=h.exec(\'if\',c,parent,root,function(data){var s=\'\';'
			);

			expect(fireTpl.closer).to.eql(['</footer>', '', ['code', 'return s;});s+=r;'], 'scope']);
		});

		it(' ... append a span tag', function() {
			fireTpl.parseTag('span', '"Hello Admin"');

			expect(fireTpl.out.root).to.eql(
				's+=\'<header><h1>Hello World</h1></header><section class="main">' +
				'<ul class="listing">\';s+=scopes.scope001(data.listing,data);' +
				's+=\'</ul></section><footer><span></span>\';s+=scopes.scope002(data.isAdmin,data);' +
				''
			);

			expect(fireTpl.out.scope002).to.eql(
				'var c=data;var r=h.exec(\'if\',c,parent,root,function(data){var s=\'\';' +
				's+=\'<span>Hello Admin'
			);

			expect(fireTpl.closer).to.eql(['</footer>', '', ['code', 'return s;});s+=r;'], 'scope', '</span>']);
		});

		it(' ... append an indention (-1)', function() {
			fireTpl.handleIndention('\t');

			expect(fireTpl.out.root).to.eql(
				's+=\'<header><h1>Hello World</h1></header><section class="main">' +
				'<ul class="listing">\';s+=scopes.scope001(data.listing,data);' +
				's+=\'</ul></section><footer><span></span>\';s+=scopes.scope002(data.isAdmin,data);' +
				''
			);

			expect(fireTpl.out.scope002).to.eql(
				'var c=data;var r=h.exec(\'if\',c,parent,root,function(data){var s=\'\';' +
				's+=\'<span>Hello Admin</span>\';return s;});s+=r;'
			);

			expect(fireTpl.closer).to.eql(['</footer>']);
		});
	});

	describe('parseFuncs (hbs)', function() {
		var fireTpl;

		before(function() {
			fireTpl = new FireTPL.Compiler();	
		});

		it('Should append a header tag', function() {
			fireTpl.parseTag('header');

			expect(fireTpl.out.root).to.eql('s+=\'<header>');
			expect(fireTpl.closer).to.eql(['</header>']);
		});

		it(' ... append a h1 tag', function() {
			fireTpl.parseTag('h1', '"Hello World"');

			expect(fireTpl.out.root).to.eql('s+=\'<header><h1>Hello World');
			expect(fireTpl.closer).to.eql(['</header>', '</h1>']);
		});

		it(' ... append a h1 close tag', function() {
			fireTpl.parseEndTag('h1');

			expect(fireTpl.out.root).to.eql('s+=\'<header><h1>Hello World</h1>');
			expect(fireTpl.closer).to.eql(['</header>']);
		});

		it(' ... append a header close tag', function() {
			fireTpl.parseEndTag('header');

			expect(fireTpl.out.root).to.eql('s+=\'<header><h1>Hello World</h1></header>');
			expect(fireTpl.closer).to.eql([]);
		});

		it(' ... append a section tag', function() {
			fireTpl.parseTag('section', 'class=main');

			expect(fireTpl.out.root).to.eql('s+=\'<header><h1>Hello World</h1></header><section class="main">');
			expect(fireTpl.closer).to.eql(['</section>']);
		});

		it(' ... append a ul tag', function() {
			fireTpl.parseTag('ul', 'class="listing"');

			expect(fireTpl.out.root).to.eql(
				's+=\'<header><h1>Hello World</h1></header><section class="main">' +
				'<ul class="listing">'
			);
			expect(fireTpl.closer).to.eql(['</section>', '</ul>']);
		});

		it(' ... append an each helper', function() {
			fireTpl.parseHelper('each', '$listing');

			expect(fireTpl.out.root).to.eql(
				's+=\'<header><h1>Hello World</h1></header><section class="main">' +
				'<ul class="listing">\';s+=scopes.scope001(data.listing,data);'
			);

			expect(fireTpl.out.scope001).to.eql(
				's+=h.exec(\'each\',data,parent,root,function(data){var s=\'\';'
			);

			expect(fireTpl.closer).to.eql(['</section>', '</ul>', '', ['code', 'return s;});'], 'scope']);
		});

		it(' ... append a li tag', function() {
			fireTpl.parseTag('li', 'class="item"');

			expect(fireTpl.out.root).to.eql(
				's+=\'<header><h1>Hello World</h1></header><section class="main">' +
				'<ul class="listing">\';s+=scopes.scope001(data.listing,data);'
			);

			expect(fireTpl.out.scope001).to.eql(
				's+=h.exec(\'each\',data,parent,root,function(data){var s=\'\';' +
				's+=\'<li class="item">'
			);

			expect(fireTpl.closer).to.eql(['</section>', '</ul>', '', ['code', 'return s;});'], 'scope', '</li>']);
		});

		it(' ... append a img tag', function() {
			fireTpl.parseTag('img', 'src="$url"');

			expect(fireTpl.out.root).to.eql(
				's+=\'<header><h1>Hello World</h1></header><section class="main">' +
				'<ul class="listing">\';s+=scopes.scope001(data.listing,data);'
			);

			expect(fireTpl.out.scope001).to.eql(
				's+=h.exec(\'each\',data,parent,root,function(data){var s=\'\';' +
				's+=\'<li class="item"><img src="\'+data.url+\'">'
			);

			expect(fireTpl.closer).to.eql(['</section>', '</ul>', '', ['code', 'return s;});'], 'scope', '</li>']);
		});

		it(' ... append a span tag', function() {
			fireTpl.parseTag('span', '$name');

			expect(fireTpl.out.root).to.eql(
				's+=\'<header><h1>Hello World</h1></header><section class="main">' +
				'<ul class="listing">\';s+=scopes.scope001(data.listing,data);'
			);

			expect(fireTpl.out.scope001).to.eql(
				's+=h.exec(\'each\',data,parent,root,function(data){var s=\'\';' +
				's+=\'<li class="item"><img src="\'+data.url+\'"><span>\'+data.name+\''
			);

			expect(fireTpl.closer).to.eql(['</section>', '</ul>', '', ['code', 'return s;});'], 'scope', '</li>', '</span>']);
		});

		it(' ... append a span close tag', function() {
			fireTpl.parseEndTag('span');

			expect(fireTpl.out.root).to.eql(
				's+=\'<header><h1>Hello World</h1></header><section class="main">' +
				'<ul class="listing">\';s+=scopes.scope001(data.listing,data);'
			);

			expect(fireTpl.out.scope001).to.eql(
				's+=h.exec(\'each\',data,parent,root,function(data){var s=\'\';' +
				's+=\'<li class="item"><img src="\'+data.url+\'"><span>\'+data.name+\'</span>'
			);

			expect(fireTpl.closer).to.eql(['</section>', '</ul>', '', ['code', 'return s;});'], 'scope', '</li>']);
		});

		it(' ... append a li close tag', function() {
			fireTpl.parseEndTag('li');

			expect(fireTpl.out.root).to.eql(
				's+=\'<header><h1>Hello World</h1></header><section class="main">' +
				'<ul class="listing">\';s+=scopes.scope001(data.listing,data);'
			);

			expect(fireTpl.out.scope001).to.eql(
				's+=h.exec(\'each\',data,parent,root,function(data){var s=\'\';' +
				's+=\'<li class="item"><img src="\'+data.url+\'"><span>\'+data.name+\'</span></li>'
			);

			expect(fireTpl.closer).to.eql(['</section>', '</ul>', '', ['code', 'return s;});'], 'scope']);
		});

		it(' ... append a scope close tag', function() {
			fireTpl.parseHelperEnd('');

			expect(fireTpl.out.root).to.eql(
				's+=\'<header><h1>Hello World</h1></header><section class="main">' +
				'<ul class="listing">\';s+=scopes.scope001(data.listing,data);'
			);

			expect(fireTpl.out.scope001).to.eql(
				's+=h.exec(\'each\',data,parent,root,function(data){var s=\'\';' +
				's+=\'<li class="item"><img src="\'+data.url+\'"><span>\'+data.name+\'</span></li>\';return s;});'
			);

			expect(fireTpl.closer).to.eql(['</section>', '</ul>']);
		});

		it(' ... append a ul close tag', function() {
			fireTpl.parseEndTag('ul');

			expect(fireTpl.out.root).to.eql(
				's+=\'<header><h1>Hello World</h1></header><section class="main">' +
				'<ul class="listing">\';s+=scopes.scope001(data.listing,data);' +
				's+=\'</ul>'
			);

			expect(fireTpl.out.scope001).to.eql(
				's+=h.exec(\'each\',data,parent,root,function(data){var s=\'\';' +
				's+=\'<li class="item"><img src="\'+data.url+\'"><span>\'+data.name+\'</span></li>\';return s;});'
			);

			expect(fireTpl.closer).to.eql(['</section>']);
		});

		it(' ... append a section close tag', function() {
			fireTpl.parseEndTag('section');

			expect(fireTpl.out.root).to.eql(
				's+=\'<header><h1>Hello World</h1></header><section class="main">' +
				'<ul class="listing">\';s+=scopes.scope001(data.listing,data);' +
				's+=\'</ul></section>'
			);

			expect(fireTpl.out.scope001).to.eql(
				's+=h.exec(\'each\',data,parent,root,function(data){var s=\'\';' +
				's+=\'<li class="item"><img src="\'+data.url+\'"><span>\'+data.name+\'</span></li>\';return s;});'
			);

			expect(fireTpl.closer).to.eql([]);
		});

		it(' ... append a footer tag', function() {
			fireTpl.parseTag('footer');

			expect(fireTpl.out.root).to.eql(
				's+=\'<header><h1>Hello World</h1></header><section class="main">' +
				'<ul class="listing">\';s+=scopes.scope001(data.listing,data);' +
				's+=\'</ul></section><footer>'
			);

			expect(fireTpl.out.scope001).to.eql(
				's+=h.exec(\'each\',data,parent,root,function(data){var s=\'\';' +
				's+=\'<li class="item"><img src="\'+data.url+\'"><span>\'+data.name+\'</span></li>\';return s;});'
			);

			expect(fireTpl.closer).to.eql(['</footer>']);
		});

		it(' ... append a span tag', function() {
			fireTpl.parseTag('span');

			expect(fireTpl.out.root).to.eql(
				's+=\'<header><h1>Hello World</h1></header><section class="main">' +
				'<ul class="listing">\';s+=scopes.scope001(data.listing,data);' +
				's+=\'</ul></section><footer><span>'
			);

			expect(fireTpl.out.scope001).to.eql(
				's+=h.exec(\'each\',data,parent,root,function(data){var s=\'\';' +
				's+=\'<li class="item"><img src="\'+data.url+\'"><span>\'+data.name+\'</span></li>\';return s;});'
			);

			expect(fireTpl.closer).to.eql(['</footer>', '</span>']);
		});

		it(' ... append an span close tag', function() {
			fireTpl.parseEndTag('span');

			expect(fireTpl.out.root).to.eql(
				's+=\'<header><h1>Hello World</h1></header><section class="main">' +
				'<ul class="listing">\';s+=scopes.scope001(data.listing,data);' +
				's+=\'</ul></section><footer><span></span>'
			);

			expect(fireTpl.out.scope001).to.eql(
				's+=h.exec(\'each\',data,parent,root,function(data){var s=\'\';' +
				's+=\'<li class="item"><img src="\'+data.url+\'"><span>\'+data.name+\'</span></li>\';return s;});'
			);

			expect(fireTpl.closer).to.eql(['</footer>']);
		});

		it(' ... append a if helper (same indention)', function() {
			fireTpl.parseHelper('if', '$isAdmin');

			expect(fireTpl.out.root).to.eql(
				's+=\'<header><h1>Hello World</h1></header><section class="main">' +
				'<ul class="listing">\';s+=scopes.scope001(data.listing,data);' +
				's+=\'</ul></section><footer><span></span>\';s+=scopes.scope002(data.isAdmin,data);' +
				''
			);

			expect(fireTpl.out.scope002).to.eql(
				'var c=data;var r=h.exec(\'if\',c,parent,root,function(data){var s=\'\';'
			);

			expect(fireTpl.closer).to.eql(['</footer>', '', ['code', 'return s;});s+=r;'], 'scope']);
		});

		it(' ... append a span tag', function() {
			fireTpl.parseTag('span', '"Hello Admin"');

			expect(fireTpl.out.root).to.eql(
				's+=\'<header><h1>Hello World</h1></header><section class="main">' +
				'<ul class="listing">\';s+=scopes.scope001(data.listing,data);' +
				's+=\'</ul></section><footer><span></span>\';s+=scopes.scope002(data.isAdmin,data);' +
				''
			);

			expect(fireTpl.out.scope002).to.eql(
				'var c=data;var r=h.exec(\'if\',c,parent,root,function(data){var s=\'\';' +
				's+=\'<span>Hello Admin'
			);

			expect(fireTpl.closer).to.eql(['</footer>', '', ['code', 'return s;});s+=r;'], 'scope', '</span>']);
		});

		it(' ... append a span close tag', function() {
			fireTpl.parseEndTag('span');

			expect(fireTpl.out.root).to.eql(
				's+=\'<header><h1>Hello World</h1></header><section class="main">' +
				'<ul class="listing">\';s+=scopes.scope001(data.listing,data);' +
				's+=\'</ul></section><footer><span></span>\';s+=scopes.scope002(data.isAdmin,data);' +
				''
			);

			expect(fireTpl.out.scope002).to.eql(
				'var c=data;var r=h.exec(\'if\',c,parent,root,function(data){var s=\'\';' +
				's+=\'<span>Hello Admin</span>'
			);

			expect(fireTpl.closer).to.eql(['</footer>', '', ['code', 'return s;});s+=r;'], 'scope']);
		});

		it(' ... append an span close tag', function() {
			fireTpl.parseHelperEnd();

			expect(fireTpl.out.root).to.eql(
				's+=\'<header><h1>Hello World</h1></header><section class="main">' +
				'<ul class="listing">\';s+=scopes.scope001(data.listing,data);' +
				's+=\'</ul></section><footer><span></span>\';s+=scopes.scope002(data.isAdmin,data);' +
				''
			);

			expect(fireTpl.out.scope002).to.eql(
				'var c=data;var r=h.exec(\'if\',c,parent,root,function(data){var s=\'\';' +
				's+=\'<span>Hello Admin</span>\';return s;});s+=r;'
			);

			expect(fireTpl.closer).to.eql(['</footer>']);
		});

		it(' ... append a footer close tag', function() {
			fireTpl.parseEndTag('footer');

			expect(fireTpl.out.root).to.eql(
				's+=\'<header><h1>Hello World</h1></header><section class="main">' +
				'<ul class="listing">\';s+=scopes.scope001(data.listing,data);' +
				's+=\'</ul></section><footer><span></span>\';s+=scopes.scope002(data.isAdmin,data);' +
				's+=\'</footer>'
			);

			expect(fireTpl.out.scope002).to.eql(
				'var c=data;var r=h.exec(\'if\',c,parent,root,function(data){var s=\'\';' +
				's+=\'<span>Hello Admin</span>\';return s;});s+=r;'
			);

			expect(fireTpl.closer).to.eql([]);
		});
	});
	
	describe('parser', function() {
		var fireTpl;

		beforeEach(function() {
			fireTpl = new FireTPL.Compiler();	
		});

		it('Should parse a template file', function() {
			var template = 'div';
			var html = fireTpl.parse(template, 'fire');
			expect(html).to.eql(tmplScope.root('<div></div>'));
		});

		it('Should parse a .hbs template file', function() {
			var template = '<div></div>';
			var html = fireTpl.parse(template, 'hbs');
			expect(html).to.eql(tmplScope.root('<div></div>'));
		});

		it('Should parse tags in a .fire file', function() {
			var template = 'div\n\tspan';
			var html = fireTpl.parse(template, 'fire');
			expect(html).to.eql(tmplScope.root('<div><span></span></div>'));
		});

		it('Should parse tags in a .hbs file', function() {
			var template = '<div>\n\t<span></span>\n</div>';
			var html = fireTpl.parse(template, 'hbs');
			expect(html).to.eql(tmplScope.root('<div><span></span></div>'));
		});

		it('Should parse a helper in a .fire file', function() {
			var parseHelperSpy = sinon.spy(fireTpl, 'parseHelper');
			
			var template = 'div\n\tspan\n\t\t:if $bla';
			var html = fireTpl.parse(template, 'fire');

			expect(parseHelperSpy).was.calledOnce();
			expect(parseHelperSpy).was.calledWith('if', '$bla');
			expect(html).to.eql(
				tmplScope
				.if('')
				.root('<div><span>\';s+=scopes.scope001(data.bla,data);s+=\'</span></div>')
			);
			parseHelperSpy.restore();
		});

		it('Should parse a helper in a .hbs file', function() {
			var parseHelperSpy = sinon.spy(fireTpl, 'parseHelper');
			
			var template = '<div>\n\t<span>\n\t\t{{#if bla}}{{/if}}\n\t</span>\n</div>';
			var html = fireTpl.parse(template, 'hbs');

			expect(parseHelperSpy).was.calledOnce();
			expect(parseHelperSpy).was.calledWith('if', '$bla');
			expect(html).to.eql(
				tmplScope
				.if('')
				.root('<div><span>\';s+=scopes.scope001(data.bla,data);s+=\'</span></div>')
			);
			parseHelperSpy.restore();
		});

		it('Should parse tags with attributes in a .fire file', function() {
			var template = 'div id=mydiv\n\tspan class="listing blue"';
			var html = fireTpl.parse(template, 'fire');

			expect(html).to.eql(
				tmplScope
				.root('<div id="mydiv"><span class="listing blue"></span></div>')
			);
		});

		it('Should parse tags with attributes in a .hbs file', function() {
			var template = '<div id="mydiv">\n\t<span class="listing blue"></span>\n</div>';
			var html = fireTpl.parse(template, 'hbs');

			expect(html).to.eql(
				tmplScope
				.root('<div id="mydiv"><span class="listing blue"></span></div>')
			);
		});

		it('Should parse tags with new line attributes in a .fire file', function() {
			var template = 'div id=mydiv\n' +
				'	class="bla blubb"\n' +
				'	span class="listing blue"';

			var html = fireTpl.parse(template, 'fire');

			expect(html).to.eql(
				tmplScope
				.root('<div id="mydiv" class="bla blubb"><span class="listing blue"></span></div>')
			);
		});

		it('Should parse tags with new line attributes in a .hbs file', function() {
			var template = '<div id="mydiv"\n' +
			'	class="bla blubb">\n' +
			'	<span class="listing blue"></span>\n' +
			'</div>';

			var html = fireTpl.parse(template, 'hbs');

			expect(html).to.eql(
				tmplScope
				.root('<div id="mydiv" class="bla blubb"><span class="listing blue"></span></div>')
			);
		});

		it('Should parse strings in a .fire file', function() {
			var template = 'div id=mydiv\n' +
				'	"Hello World"\n' +
				'	span class="listing blue"\n' +
				'		"I\'m DrTest!"';

			var html = fireTpl.parse(template, 'fire');

			expect(html).to.eql(
				tmplScope
				.root('<div id="mydiv">Hello World<span class="listing blue">I\\\'m DrTest!</span></div>')
			);
		});

		it('Should parse strings in a .hbs file', function() {
			var template = '<div id="mydiv">\n' +
			'	Hello World\n' +
			'	<span class="listing blue">I\'m DrTest!</span>\n' +
			'</div>';

			var html = fireTpl.parse(template, 'hbs');

			expect(html).to.eql(
				tmplScope
				.root('<div id="mydiv">Hello World<span class="listing blue">I\\\'m DrTest!</span></div>')
			);
		});

		it('Should parse a html layout in a .fire file', function() {
			var template = 'header\n' +
				'	h1 "Hello World"\n' +
				'section class=main\n' +
				'	span class="listing"\n' +
				'		"I\'m DrTest!"';

			var html = fireTpl.parse(template, 'fire');

			expect(html).to.eql(
				tmplScope
				.root('<header><h1>Hello World</h1></header><section class="main">' +
					'<span class="listing">I\\\'m DrTest!</span></section>')
			);
		});

		it('Should parse a html layout in a .hbs file', function() {
			var template = '<header>\n' +
				'	<h1>Hello World</h1>\n' +
				'</header>\n' +
				'<section class="main">\n' +
				'	<span class="listing">\n' +
				'		I\'m DrTest!</span>' +
				'</section>\n';

			var html = fireTpl.parse(template, 'hbs');

			expect(html).to.eql(
				tmplScope
				.root('<header><h1>Hello World</h1></header><section class="main">' +
					'<span class="listing">I\\\'m DrTest!</span></section>')
			);
		});

		it('Should parse htmlstrings in a .fire file', function() {
			var template = 'div id=mydiv\n' +
				'	\'<b>Hello World</b>\'\n' +
				'	span class="listing blue"\n' +
				'		\'<span>\'\n' + 
				'		\'  I am DrTest!\'\n' +
				'		\'</span>\'\n';

			var html = fireTpl.parse(template, 'fire');

			expect(html).to.eql(
				tmplScope
				.root('<div id="mydiv"><b>Hello World</b><span class="listing blue">' +
					'<span>\n  I am DrTest!\n</span></span></div>')
			);
		});
	});

	describe('getIndention', function() {
		it('Should get the number of indention', function() {
			var fireTpl = new FireTPL.Compiler();
			var indention = fireTpl.getIndention('\t\t');
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

	describe('getIndention (using spaces)', function() {
		it('Should get the number of indention', function() {
			var fireTpl = new FireTPL.Compiler();
			var indention = fireTpl.getIndention('        ');
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

		it('Should throw an invalid indention error', function() {
			var fireTpl = new FireTPL.Compiler();
			var fn = function() {
				fireTpl.getIndention('       ');
			};
			expect(fn).to.throwError('Invalid indention');
		});
	});

	describe('getIndention (using spaces and tabs)', function() {
		it('Should get the number of indention', function() {
			var fireTpl = new FireTPL.Compiler();
			var indention = fireTpl.getIndention('\t    ');
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

		it('Should throw an invalid indention error (using spaces and tabs)', function() {
			var fireTpl = new FireTPL.Compiler();
			var fn = function() {
				fireTpl.getIndention('\t       ');
			};
			expect(fn).to.throwError('Invalid indention');
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

	describe('handleIndention (using spaces)', function() {
		it('Should handle indention on indent', function() {
			var fireTpl = new FireTPL.Compiler();
			fireTpl.indention = 2;
			fireTpl.closer = ['a', 'b', 'c'];
			fireTpl.handleIndention('            ');

			expect(fireTpl.indention).to.be(3);
			expect(fireTpl.closer).to.length(3);
			expect(fireTpl.closer).to.eql(['a', 'b', 'c']);
		});

		it('Should handle indention on outdent', function() {
			var fireTpl = new FireTPL.Compiler();
			fireTpl.indention = 2;
			fireTpl.closer = ['a', 'b', 'c'];
			fireTpl.handleIndention('    ');

			expect(fireTpl.indention).to.be(1);
			expect(fireTpl.closer).to.length(1);
			expect(fireTpl.closer).to.eql(['a']);
		});

		it('Should handle indention on same indention', function() {
			var fireTpl = new FireTPL.Compiler();
			fireTpl.indention = 2;
			fireTpl.closer = ['a', 'b', 'c'];
			fireTpl.handleIndention('        ');

			expect(fireTpl.indention).to.be(2);
			expect(fireTpl.closer).to.length(2);
			expect(fireTpl.closer).to.eql(['a', 'b']);
		});

		it('Should handle 5 step outdention', function() {
			var fireTpl = new FireTPL.Compiler();
			fireTpl.indention = 8;
			fireTpl.closer = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'];
			fireTpl.handleIndention('            ');

			expect(fireTpl.indention).to.be(3);
			expect(fireTpl.closer).to.length(3);
			expect(fireTpl.closer).to.eql(['a', 'b', 'c']);
		});
	});

	describe('newScope', function() {
		var instance;

		beforeEach(function() {
			instance = new FireTPL.Compiler();
		});

		it('Should add a new scope', function() {
			instance.newScope('scope001');
			expect(instance.curScope).to.eql(['scope001', 'root']);
			expect(instance.out).to.eql({ root: '', scope001: '' });
		});

		it('Should add two if scopes', function() {
			
		});
	});

	describe('append', function() {
		it('Should append to out str', function() {
			var fireTpl = new FireTPL.Compiler();
			fireTpl.out = { root: '' };
			fireTpl.append('str', '<div>');
			fireTpl.append('code', 'if(data.bla){');
			fireTpl.append('str', 'Hello');
			fireTpl.append('code', '}');
			fireTpl.append('code', 'else{');
			fireTpl.append('str', 'Good bye');
			fireTpl.append('code', '}');
			fireTpl.append('str', '</div>');
			expect(fireTpl.out.root).to.eql('s+=\'<div>\';if(data.bla){s+=\'Hello\';}else{s+=\'Good bye\';}s+=\'</div>');
		});
	});

	describe('getOutStream', function() {
		var instance;

		beforeEach(function() {
			instance = new FireTPL.Compiler();
		});

		it('Should get the output stream', function() {
			instance.out = {
				root: 's+=\'<html><head></head><body><div>\'+scope001(data)+\'</div></body></html>\';',
				scope001: 's+=\'<div class="listing"><div>\'+scope002(data.listing)+\'</div></div>\';',
				scope002: 's+=\'<img src="\'+data.img+\'">\';'
			};

			expect(instance.getOutStream()).to.eql(
				'scopes=scopes||{};var root=data,parent=data;' +
				'scopes.scope002=function(data,parent){var s=\'\';s+=\'<img src="\'+data.img+\'">\';return s;};' +
				'scopes.scope001=function(data,parent){var s=\'\';s+=\'<div class="listing"><div>\'+scope002(data.listing)+\'</div></div>\';return s;};' +
				'var s=\'\';' +
				's+=\'<html><head></head><body><div>\'+scope001(data)+\'</div></body></html>\';'
			);
		});
	});

	describe('appendCloser', function() {
		var instance;

		beforeEach(function() {
			instance = new FireTPL.Compiler();
			instance.lastItemType = 'code';
		});

		it('Should append a closer to the out stream', function() {
			instance.closer = ['</html>', '</div>'];
			instance.appendCloser();

			expect(instance.getOutStream()).to.eql('scopes=scopes||{};var root=data,parent=data;var s=\'\';s+=\'</div>\';');
		});

		it('Should append a closer to the out stream', function() {
			instance.closer = ['</html>', '</div>', ['code', 'data.bla;']];
			instance.appendCloser();
			instance.appendCloser();

			expect(instance.getOutStream()).to.eql('scopes=scopes||{};var root=data,parent=data;var s=\'\';data.bla;s+=\'</div>\';');
		});

		it('Should append a closer to the out stream', function() {
			instance.out = { root: '', scope001: '' };
			instance.curScope = ['scope001', 'root'];
			instance.closer = ['</html>', '</div>', '', 'scope', '<img>'];
			instance.lastItemType = 'code';
			instance.appendCloser();
			instance.appendCloser();

			expect(instance.out.root).to.eql('s+=\'</div>');
			expect(instance.out.scope001).to.eql('s+=\'<img>\';');
			expect(instance.getOutStream()).to.eql('scopes=scopes||{};var root=data,parent=data;scopes.scope001=function(data,parent){var s=\'\';s+=\'<img>\';return s;};var s=\'\';s+=\'</div>\';');
		});

		it('Should append a closer to the out stream', function() {
			instance.out = { root: '', scope001: '', scope002: '' };
			instance.curScope = ['scope002', 'scope001', 'root'];
			instance.closer = ['</html>', '</div>', '', 'scope', '<img>', '','scope', '<span>'];
			instance.lastItemType = 'code';
			instance.appendCloser();
			instance.appendCloser();
			instance.appendCloser();

			expect(instance.out.root).to.eql('s+=\'</div>');
			expect(instance.out.scope001).to.eql('s+=\'<img>\';');
			expect(instance.out.scope002).to.eql('s+=\'<span>\';');
			expect(instance.getOutStream()).to.eql('scopes=scopes||{};var root=data,parent=data;scopes.scope002=function(data,parent){var s=\'\';s+=\'<span>\';return s;};scopes.scope001=function(data,parent){var s=\'\';s+=\'<img>\';return s;};var s=\'\';s+=\'</div>\';');
		});
	});

	describe('check pattern (fire)', function() {
		it('Should match an empty line', function() {
			var fireTpl = new FireTPL.Compiler();
			var syntaxConf = fireTpl.getPattern('fire');

			expect(syntaxConf).to.be.an('object');
			expect(syntaxConf.pattern).to.be.an('regexp');

			var match = syntaxConf.pattern.exec('\t\t\t\n');
			expect(/^\s*$/.test(match[0])).to.be(true);
		});

		it('Should match a line comment', function() {
			var fireTpl = new FireTPL.Compiler();
			var syntaxConf = fireTpl.getPattern('fire');
			var match = syntaxConf.pattern.exec('//I\'m a comment');
			expect(match.slice(1)).to.eql([
				undefined,
				undefined,
				'//I\'m a comment',
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined
			]);
		});

		it('Should match a statement', function() {
			var fireTpl = new FireTPL.Compiler();
			var syntaxConf = fireTpl.getPattern('fire');
			var match = syntaxConf.pattern.exec(':if $bla');
			expect(match.slice(1)).to.eql([
				undefined,
				undefined,
				undefined,
				'if',
				'$bla',
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined
			]);
		});

		it('Should match a line attribute', function() {
			var fireTpl = new FireTPL.Compiler();
			var syntaxConf = fireTpl.getPattern('fire');
			var match = syntaxConf.pattern.exec('foo=bar');
			expect(match.slice(1)).to.eql([
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				'foo=bar',
				undefined,
				undefined,
				undefined,
				undefined
			]);
		});

		it('Should match a line attribute, value is enclosed with doublequotes', function() {
			var fireTpl = new FireTPL.Compiler();
			var syntaxConf = fireTpl.getPattern('fire');
			var match = syntaxConf.pattern.exec('bla="Super bla"');
			expect(match.slice(1)).to.eql([
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				'bla="Super bla"',
				undefined,
				undefined,
				undefined,
				undefined
			]);
		});

		it('Should match a line attribute, value is enclosed with singlequotes', function() {
			var fireTpl = new FireTPL.Compiler();
			var syntaxConf = fireTpl.getPattern('fire');
			var match = syntaxConf.pattern.exec('bla=\'Super bla\'');
			expect(match.slice(1)).to.eql([
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				'bla=\'Super bla\'',
				undefined,
				undefined,
				undefined,
				undefined
			]);
		});

		it('Should match a tag', function() {
			var fireTpl = new FireTPL.Compiler();
			var syntaxConf = fireTpl.getPattern('fire');
			var match = syntaxConf.pattern.exec('div');
			expect(match.slice(1)).to.eql([
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				'div',
				undefined,
				undefined,
				undefined
			]);
		});

		it('Should match a tag with attributes', function() {
			var fireTpl = new FireTPL.Compiler();
			var syntaxConf = fireTpl.getPattern('fire');
			var match = syntaxConf.pattern.exec('div id="myDiv class="bla blubb"');
			expect(match.slice(1)).to.eql([
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				'div',
				' id="myDiv class="bla blubb"',
				undefined,
				undefined
			]);
		});

		it('Should match a string', function() {
			var fireTpl = new FireTPL.Compiler();
			var syntaxConf = fireTpl.getPattern('fire');
			var match = syntaxConf.pattern.exec('"Hi, I\'m a string"');
			expect(match.slice(1)).to.eql([
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				'"Hi, I\'m a string"',
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined
			]);
		});

		it('Should match a multiline string', function() {
			var fireTpl = new FireTPL.Compiler();
			var syntaxConf = fireTpl.getPattern('fire');
			var match = syntaxConf.pattern.exec('"Hi, I\'m a multiline string\n\t\t\tend"');
			expect(match.slice(1)).to.eql([
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				'"Hi, I\'m a multiline string\n\t\t\tend"',
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined
			]);
		});

		it('Should match a html string', function() {
			var fireTpl = new FireTPL.Compiler();
			var syntaxConf = fireTpl.getPattern('fire');
			var match = syntaxConf.pattern.exec('\'<b>Hi, I&#39;m a html string</b>\'');
			expect(match.slice(1)).to.eql([
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				'\'<b>Hi, I&#39;m a html string</b>\'',
				undefined,
				undefined,
				undefined,
				undefined,
				undefined
			]);
		});

		it('Should match a multiline html string', function() {
			var fireTpl = new FireTPL.Compiler();
			var syntaxConf = fireTpl.getPattern('fire');
			var match = syntaxConf.pattern.exec('\'<b>Hi, I&#39;m a multiline html string</b>\n\t\t\tend\'');
			expect(match.slice(1)).to.eql([
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				'\'<b>Hi, I&#39;m a multiline html string</b>\n\t\t\tend\'',
				undefined,
				undefined,
				undefined,
				undefined,
				undefined
			]);
		});
	});

	describe('check pattern (hbs)', function() {
		it('Should match an empty line', function() {
			var fireTpl = new FireTPL.Compiler();
			var syntaxConf = fireTpl.getPattern('hbs');

			expect(syntaxConf).to.be.an('object');
			expect(syntaxConf.pattern).to.be.an('regexp');

			var match = syntaxConf.pattern.exec('\t\t\t\n');
			expect(/^\s*$/.test(match[0])).to.be(true);
		});

		it('Should match a line comment', function() {
			var fireTpl = new FireTPL.Compiler();
			var syntaxConf = fireTpl.getPattern('hbs');
			var match = syntaxConf.pattern.exec('{{! I\'m a comment }}');
			expect(match.slice(1)).to.eql([
				undefined,
				'{{! I\'m a comment }}',
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined
			]);
		});

		it('Should match a line comment ({{!-- --}})', function() {
			var fireTpl = new FireTPL.Compiler();
			var syntaxConf = fireTpl.getPattern('hbs');
			var match = syntaxConf.pattern.exec('{{!-- I\'m a comment --}}');
			expect(match.slice(1)).to.eql([
				undefined,
				'{{!-- I\'m a comment --}}',
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined
			]);
		});

		it('Should match a statement', function() {
			var fireTpl = new FireTPL.Compiler();
			var syntaxConf = fireTpl.getPattern('hbs');
			var match = syntaxConf.pattern.exec('{{#if $bla}}');
			expect(match.slice(1)).to.eql([
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				'if',
				'$bla',
				undefined,
				undefined,
				undefined
			]);
		});

		it('Should match a statement closer', function() {
			var fireTpl = new FireTPL.Compiler();
			var syntaxConf = fireTpl.getPattern('hbs');
			var match = syntaxConf.pattern.exec('{{/if}}');
			expect(match.slice(1)).to.eql([
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				'if',
				undefined
			]);
		});

		it('Should match a tag', function() {
			var fireTpl = new FireTPL.Compiler();
			var syntaxConf = fireTpl.getPattern('hbs');
			var match = syntaxConf.pattern.exec('<div>');
			expect(match.slice(1)).to.eql([
				undefined,
				undefined,
				'div',
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined
			]);
		});

		it('Should match a tag with attributes', function() {
			var fireTpl = new FireTPL.Compiler();
			var syntaxConf = fireTpl.getPattern('hbs');
			var match = syntaxConf.pattern.exec('<div id="myDiv class="bla blubb">');
			expect(match.slice(1)).to.eql([
				undefined,
				undefined,
				'div',
				' id="myDiv class="bla blubb"',
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined
			]);
		});

		it('Should match a variable', function() {
			var fireTpl = new FireTPL.Compiler();
			var syntaxConf = fireTpl.getPattern('hbs');
			var match = syntaxConf.pattern.exec('{{myvar}}');
			expect(match.slice(1)).to.eql([
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				'{{myvar}}'
			]);
		});

		it('Should match a variable (tribble bracets)', function() {
			var fireTpl = new FireTPL.Compiler();
			var syntaxConf = fireTpl.getPattern('hbs');
			var match = syntaxConf.pattern.exec('{{{myvar}}}');
			expect(match.slice(1)).to.eql([
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				'{{{myvar}}}'
			]);
		});

		it('Should match a string', function() {
			var fireTpl = new FireTPL.Compiler();
			var syntaxConf = fireTpl.getPattern('hbs');
			var match = syntaxConf.pattern.exec('Hi, I\'m a string');
			expect(match.slice(1)).to.eql([
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				'Hi, I\'m a string'
			]);
		});
	});

	describe('parseVariables', function() {
		it('Should parse a string for variables', function() {
			var str = 'Hello $name!';
			var fireTpl = new FireTPL.Compiler();
			var out = fireTpl.parseVariables(str);
			expect(out).to.eql('Hello \'+data.name+\'!');
		});

		it('Should parse a string for variables and inline functions', function() {
			var str = 'Hello $name.ucase()!';
			var fireTpl = new FireTPL.Compiler();
			var out = fireTpl.parseVariables(str);
			expect(out).to.eql('Hello \'+f.ucase(data.name)+\'!');
		});

		it('Should parse a string for variables and inline chained functions', function() {
			var str = 'Hello $name.ucase().bold()!';
			var fireTpl = new FireTPL.Compiler();
			var out = fireTpl.parseVariables(str);
			expect(out).to.eql('Hello \'+f.bold(f.ucase(data.name))+\'!');
		});

		it('Should parse a string for variables and inline functions with args', function() {
			var str = 'Hello $name.when("green").then("Green")!';
			var fireTpl = new FireTPL.Compiler();
			var out = fireTpl.parseVariables(str);
			expect(out).to.eql('Hello \'+f.then(f.when(data.name, \'green\'), \'Green\')+\'!');
		});

		it('Should parse a string for locale tags', function() {
			var str = '@hello $name!';
			var fireTpl = new FireTPL.Compiler();
			var out = fireTpl.parseVariables(str);
			expect(out).to.eql('\'+l.hello+\' \'+data.name+\'!');
		});

		it('Should parse a string for multiple variables and locale tags', function() {
			var str = '@hello $name! I\'m $reporter and live in $country!';
			var fireTpl = new FireTPL.Compiler();
			var out = fireTpl.parseVariables(str);
			expect(out).to.eql('\'+l.hello+\' \'+data.name+\'! I\\\'m \'+data.reporter+\' and live in \'+data.country+\'!');
		});

		it('Should parse a string ', function() {
			var str = '@hello $name! I\'m $reporter and live in $country!';
			var fireTpl = new FireTPL.Compiler();
			var out = fireTpl.parseVariables(str);
			expect(out).to.eql('\'+l.hello+\' \'+data.name+\'! I\\\'m \'+data.reporter+\' and live in \'+data.country+\'!');
		});

		it('Should parse a string and $this should point to data', function() {
			var str = '@hello $this! I\'m $reporter and live in $country!';
			var fireTpl = new FireTPL.Compiler();
			var out = fireTpl.parseVariables(str);
			expect(out).to.eql('\'+l.hello+\' \'+data+\'! I\\\'m \'+data.reporter+\' and live in \'+data.country+\'!');
		});

		it('Should parse a string and $this.name should point to data', function() {
			var str = '@hello $this.name! I\'m $reporter and live in $country!';
			var fireTpl = new FireTPL.Compiler();
			var out = fireTpl.parseVariables(str);
			expect(out).to.eql('\'+l.hello+\' \'+data.name+\'! I\\\'m \'+data.reporter+\' and live in \'+data.country+\'!');
		});

		it('Should parse a string and $parent.name should point to data', function() {
			var str = '@hello $parent.name! I\'m $reporter and live in $country!';
			var fireTpl = new FireTPL.Compiler();
			var out = fireTpl.parseVariables(str);
			expect(out).to.eql('\'+l.hello+\' \'+parent.name+\'! I\\\'m \'+data.reporter+\' and live in \'+data.country+\'!');
		});

		it('Should parse a string and $root.name should point to data', function() {
			var str = '@hello $root.name! I\'m $reporter and live in $country!';
			var fireTpl = new FireTPL.Compiler();
			var out = fireTpl.parseVariables(str);
			expect(out).to.eql('\'+l.hello+\' \'+root.name+\'! I\\\'m \'+data.reporter+\' and live in \'+data.country+\'!');
		});
	});

	describe.skip('parseVariables scopeTags are enabled', function() {
		it('Should parse a string for variables', function() {
			var str = 'Hello $name!';
			var fireTpl = new FireTPL.Compiler({ scopeTags: true });
			var out = fireTpl.parseVariables(str);
			expect(out).to.eql('Hello <scope path="name"></scope>!');
		});

		it('Should parse a string for locale tags', function() {
			var str = '@hello $name!';
			var fireTpl = new FireTPL.Compiler({ scopeTags: true });
			var out = fireTpl.parseVariables(str);
			expect(out).to.eql('\'+l.hello+\' <scope path="name"></scope>!');
		});

		it('Should parse a string for multiple variables and locale tags', function() {
			var str = '@hello $name! I\'m $reporter and live in $country!';
			var fireTpl = new FireTPL.Compiler({ scopeTags: true });
			var out = fireTpl.parseVariables(str);
			expect(out).to.eql('\'+l.hello+\' <scope path="name"></scope>! I\\\'m <scope path="reporter"></scope> and live in <scope path="country"></scope>!');
		});

		it('Should parse a string ', function() {
			var str = '@hello $name! I\'m $reporter and live in $country!';
			var fireTpl = new FireTPL.Compiler({ scopeTags: true });
			var out = fireTpl.parseVariables(str);
			expect(out).to.eql('\'+l.hello+\' <scope path="name"></scope>! I\\\'m <scope path="reporter"></scope> and live in <scope path="country"></scope>!');
		});

		it('Should parse a string and $this should point to data', function() {
			var str = '@hello $this! I\'m $reporter and live in $country!';
			var fireTpl = new FireTPL.Compiler({ scopeTags: true });
			var out = fireTpl.parseVariables(str);
			expect(out).to.eql('\'+l.hello+\' \'+data+\'! I\\\'m <scope path="reporter"></scope> and live in <scope path="country"></scope>!');
		});

		it('Should parse a string and $this.name should point to data', function() {
			var str = '@hello $this.name! I\'m $reporter and live in $country!';
			var fireTpl = new FireTPL.Compiler({ scopeTags: true });
			var out = fireTpl.parseVariables(str);
			expect(out).to.eql('\'+l.hello+\' <scope path="name"></scope>! I\\\'m <scope path="reporter"></scope> and live in <scope path="country"></scope>!');
		});

		it('Should parse a string and $parent.name should point to data (in a scope)', function() {
			var str = '@hello $parent.name! I\'m $reporter and live in $country!';
			var fireTpl = new FireTPL.Compiler({ scopeTags: true });
			fireTpl.curScope.unshift('scope001');
			var out = fireTpl.parseVariables(str);
			expect(out).to.eql('\'+l.hello+\' <scope path="name"></scope>! I\\\'m \'+data.reporter+\' and live in \'+data.country+\'!');
		});

		it('Should parse a string and $parent should not be replaced by a scope tag (in a scope)', function() {
			var str = '@hello $parent! I\'m $reporter and live in $country!';
			var fireTpl = new FireTPL.Compiler({ scopeTags: true });
			fireTpl.curScope.unshift('scope001');
			var out = fireTpl.parseVariables(str);
			expect(out).to.eql('\'+l.hello+\' \'+parent+\'! I\\\'m \'+data.reporter+\' and live in \'+data.country+\'!');
		});

		it('Should parse a string and $root.name should point to data', function() {
			var str = '@hello $root.name! I\'m $reporter and live in $country!';
			var fireTpl = new FireTPL.Compiler({ scopeTags: true });
			var out = fireTpl.parseVariables(str);
			expect(out).to.eql('\'+l.hello+\' <scope path="name"></scope>! I\\\'m <scope path="reporter"></scope> and live in <scope path="country"></scope>!');
		});

		it('Should parse a string and $root should not be replaced by a scope tag (in a scope)', function() {
			var str = '@hello $root! I\'m $reporter and live in $country!';
			var fireTpl = new FireTPL.Compiler({ scopeTags: true });
			fireTpl.curScope.unshift('scope001');
			var out = fireTpl.parseVariables(str);
			expect(out).to.eql('\'+l.hello+\' \'+root+\'! I\\\'m \'+data.reporter+\' and live in \'+data.country+\'!');
		});
	});

	describe('injectClass', function() {
		it('Should inject a class into the last tag', function() {
			var fireTpl = new FireTPL.Compiler();
			fireTpl.out.root = '<div><span>';
			fireTpl.injectClass('injected');
			expect(fireTpl.out.root).to.eql('<div><span class="injected">');
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
			expect(template).to.eql(
				'scopes=scopes||{};var root=data,parent=data;var s=\'\';' +
				's+=\'<html><head></head><body><div id="myDiv"></div>' +
				'<div id="mySecondDiv" class="myClass"></div>' +
				'</body></html>\';'
			);
		});

		it('Should precompile a tmpl string (using spaces)', function() {
			var template = 'html\n';
			template += '    head\n';
			template += '    body\n';
			template += '        div id=myDiv\n';
			template += '        div id=mySecondDiv class=myClass\n';

			var fireTpl = new FireTPL.Compiler();
			template = fireTpl.precompile(template);
			expect(template).to.eql(
				'scopes=scopes||{};var root=data,parent=data;var s=\'\';' +
				's+=\'<html><head></head><body><div id="myDiv"></div>' +
				'<div id="mySecondDiv" class="myClass"></div>' +
				'</body></html>\';'
			);
		});
		
		it('Should precompile a tmpl string (using spaces and tabs)', function() {
			var template = 'html\n';
			template += '    head\n';
			template += '    body\n';
			template += '\t    div id=myDiv\n';
			template += '\t    div id=mySecondDiv class=myClass\n';

			var fireTpl = new FireTPL.Compiler();
			template = fireTpl.precompile(template);
			expect(template).to.eql(
				'scopes=scopes||{};var root=data,parent=data;var s=\'\';' +
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
			template += '			"Hello World"\n';

			var fireTpl = new FireTPL.Compiler();
			template = fireTpl.precompile(template);
			expect(template).to.eql(
				'scopes=scopes||{};var root=data,parent=data;var s=\'\';' +
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
			template += '			"Hello World"\n';

			var fireTpl = new FireTPL.Compiler();
			template = fireTpl.precompile(template);
			expect(template).to.eql(
				'scopes=scopes||{};var root=data,parent=data;var s=\'\';' +
				's+=\'<html><head></head><body><div id="myDiv"></div>' +
				'<div id="mySecondDiv" class="myClass">Hello World</div>' +
				'</body></html>\';'
			);
		});

		it('Should precompile a tmpl string with an if statement', function() {
			var template = 'html\n';
			template += '	head\n';
			template += '	body\n';
			template += '		:if $sayit : div\n';
			template += '			div\n';
			template += '				"Hello World"\n';

			var fireTpl = new FireTPL.Compiler();
			template = fireTpl.precompile(template);
			expect(template).to.eql(
				'scopes=scopes||{};var root=data,parent=data;' +
				'scopes.scope001=function(data,parent){var s=\'\';' +
				'var c=data;var r=h.exec(\'if\',c,parent,root,function(data){var s=\'\';s+=\'' + 
				'<div>Hello World</div>\';' +
				'return s;});s+=r;return s;' +
				'};var s=\'\';' +
				's+=\'<html><head></head><body><div>\';' + 
				's+=scopes.scope001(data.sayit,data);' +
				's+=\'</div></body></html>\';'
			);
		});

		it('Should precompile a tmpl string with a if..else statement', function() {
			var template = 'html\n';
			template += '	head\n';
			template += '	body\n';
			template += '		:if $sayit\n';
			template += '			div\n';
			template += '				"Hello World"\n';
			template += '		:else\n';
			template += '			div\n';
			template += '				"Good bye"\n';

			var fireTpl = new FireTPL.Compiler();
			template = fireTpl.precompile(template);
			expect(template).to.eql(
				'scopes=scopes||{};var root=data,parent=data;' +
				'scopes.scope001=function(data,parent){var s=\'\';' +
				'var c=data;var r=h.exec(\'if\',c,parent,root,function(data){var s=\'\';' +
				's+=\'<div>Hello World</div>\';' +
				'return s;});s+=r;' +
				'if(!r){s+=h.exec(\'else\',c,parent,root,function(data){var s=\'\';' +
				's+=\'<div>Good bye</div>\';' +
				'return s;});}return s;' +
				'};var s=\'\';' +
				's+=\'<html><head></head><body>\';' +
				's+=scopes.scope001(data.sayit,data);' +
				's+=\'</body></html>\';'
			);
		});

		it('Should precompile a tmpl string with a if..else statement wrapped in a div', function() {
			var template = 'html\n';
			template += '	head\n';
			template += '	body\n';
			template += '		:if $sayit : div\n';
			template += '			div\n';
			template += '				"Hello World"\n';
			template += '		:else\n';
			template += '			div\n';
			template += '				"Good bye"\n';

			var fireTpl = new FireTPL.Compiler();
			template = fireTpl.precompile(template);
			expect(template).to.eql(
				'scopes=scopes||{};var root=data,parent=data;' +
				'scopes.scope001=function(data,parent){var s=\'\';' +
				'var c=data;var r=h.exec(\'if\',c,parent,root,function(data){var s=\'\';' +
				's+=\'<div>Hello World</div>\';' +
				'return s;});s+=r;' +
				'if(!r){s+=h.exec(\'else\',c,parent,root,function(data){var s=\'\';' +
				's+=\'<div>Good bye</div>\';' +
				'return s;});}return s;' +
				'};var s=\'\';' +
				's+=\'<html><head></head><body><div>\';' +
				's+=scopes.scope001(data.sayit,data);' +
				's+=\'</div>\';s+=\'</body></html>\';'
			);
		});

		it('Should precompile a tmpl string with an unless statement', function() {
			var template = 'html\n';
			template += '	head\n';
			template += '	body\n';
			template += '		:unless $sayit\n';
			template += '			div\n';
			template += '				"Hello World"\n';

			var fireTpl = new FireTPL.Compiler();
			template = fireTpl.precompile(template);
			expect(template).to.eql(
				'scopes=scopes||{};var root=data,parent=data;' +
				'scopes.scope001=function(data,parent){var s=\'\';' +
				's+=h.exec(\'unless\',data,parent,root,function(data){var s=\'\';' +
				's+=\'<div>Hello World</div>\';' +
				'return s;});return s;' +
				'};var s=\'\';' +
				's+=\'<html><head></head><body>\';' +
				's+=scopes.scope001(data.sayit,data);' +
				's+=\'</body></html>\';'
			);
		});

		it('Should precompile a tmpl string with an unless statement wrapped in a div', function() {
			var template = 'html\n';
			template += '	head\n';
			template += '	body\n';
			template += '		:unless $sayit : div\n';
			template += '			div\n';
			template += '				"Hello World"\n';

			var fireTpl = new FireTPL.Compiler();
			template = fireTpl.precompile(template);
			expect(template).to.eql(
				'scopes=scopes||{};var root=data,parent=data;' +
				'scopes.scope001=function(data,parent){var s=\'\';' +
				's+=h.exec(\'unless\',data,parent,root,function(data){var s=\'\';' +
				's+=\'<div>Hello World</div>\';' +
				'return s;});return s;' +
				'};var s=\'\';' +
				's+=\'<html><head></head><body><div>\';' +
				's+=scopes.scope001(data.sayit,data);' +
				's+=\'</div></body></html>\';'
			);
		});

		it('Should precompile a tmpl string with an each statement', function() {
			var template = 'html\n';
			template += '	head\n';
			template += '	body\n';
			template += '		:each $listing\n';
			template += '			div\n';
			template += '				"Hello World"\n';

			var fireTpl = new FireTPL.Compiler();
			template = fireTpl.precompile(template);
			expect(template).to.eql(
				'scopes=scopes||{};var root=data,parent=data;' +
				'scopes.scope001=function(data,parent){var s=\'\';' +
				's+=h.exec(\'each\',data,parent,root,function(data){var s=\'\';' +
				's+=\'<div>Hello World</div>\';' +
				'return s;});return s;' +
				'};var s=\'\';' +
				's+=\'<html><head></head><body>\';' +
				's+=scopes.scope001(data.listing,data);' +
				's+=\'</body></html>\';'
			);
		});

		it('Should precompile a tmpl string with an each statement wrapped in a div', function() {
			var template = 'html\n';
			template += '	head\n';
			template += '	body\n';
			template += '		:each $listing : div\n';
			template += '			div\n';
			template += '				"Hello World"\n';

			var fireTpl = new FireTPL.Compiler();
			template = fireTpl.precompile(template);
			expect(template).to.eql(
				'scopes=scopes||{};var root=data,parent=data;' +
				'scopes.scope001=function(data,parent){var s=\'\';' +
				's+=h.exec(\'each\',data,parent,root,function(data){var s=\'\';' +
				's+=\'<div>Hello World</div>\';' +
				'return s;});return s;' +
				'};var s=\'\';' +
				's+=\'<html><head></head><body><div>\';' +
				's+=scopes.scope001(data.listing,data);' +
				's+=\'</div></body></html>\';'
			);
		});

		it('Should precompile a tmpl string with a multiline string', function() {
			var template = 'html\n';
			template += '	head\n';
			template += '	body\n';
			template += '		div class=content\n';
			template += '			"I\'m a multiline\n';
			template += '			String"\n';

			var fireTpl = new FireTPL.Compiler();
			template = fireTpl.precompile(template);
			expect(template).to.eql(
				'scopes=scopes||{};var root=data,parent=data;var s=\'\';' +
				's+=\'<html><head></head><body>' +
				'<div class="content">I\\\'m a multiline String</div>' +
				'</body></html>\';'
			);
		});

		it('Should precompile a tmpl string with a multiline string (using spaces)', function() {
			var template = 'html\n';
			template += '    head\n';
			template += '    body\n';
			template += '        div class=content\n';
			template += '            "I\'m a multiline\n';
			template += '            String"\n';

			var fireTpl = new FireTPL.Compiler();
			template = fireTpl.precompile(template);
			expect(template).to.eql(
				'scopes=scopes||{};var root=data,parent=data;var s=\'\';' +
				's+=\'<html><head></head><body>' +
				'<div class="content">I\\\'m a multiline String</div>' +
				'</body></html>\';'
			);
		});

		it('Should precompile a tmpl string with multiple multiline strings', function() {
			var template = 'html\n';
			template += '	head\n';
			template += '	body\n';
			template += '		div class=content\n';
			template += '			"I\'m a multiline\n';
			template += '			String"\n';
			template += '			"And a line break"\n';
			template += '			\n';
			template += '			"And a paragraph\n';
			template += '			Block"\n';

			var fireTpl = new FireTPL.Compiler();
			template = fireTpl.precompile(template);
			expect(template).to.eql(
				'scopes=scopes||{};var root=data,parent=data;var s=\'\';' +
				's+=\'<html><head></head><body>' +
				'<div class="content">I\\\'m a multiline String<br>' +
				'And a line break<br><br>And a paragraph Block</div>' +
				'</body></html>\';'
			);
		});

		it('Should precompile a tmpl string with multiple multiline strings and placeholders', function() {
			var template = 'html\n';
			template += '	head\n';
			template += '	body\n';
			template += '		div class=content\n';
			template += '			"I\'m a $super multiline\n';
			template += '			String"\n';
			template += '			"And a $super line break"\n';
			template += '			\n';
			template += '			"And a $super paragraph\n';
			template += '			Block"\n';

			var fireTpl = new FireTPL.Compiler();
			template = fireTpl.precompile(template);
			expect(template).to.eql(
				'scopes=scopes||{};var root=data,parent=data;var s=\'\';' +
				's+=\'<html><head></head><body>' +
				'<div class="content">I\\\'m a \'+data.super+\' multiline String<br>' +
				'And a \'+data.super+\' line break<br><br>And a \'+data.super+\' paragraph Block</div>' +
				'</body></html>\';'
			);
		});

		it('Shouldn\'t close void tags', function() {
			var template = 'html\n';
			template += '	head\n';
			template += '		meta\n';
			template += '		title\n';
			template += '		link\n';
			template += '	body\n';
			template += '		input\n';
			template += '		img\n';
			template += '		div class=content\n';
			template += '			map\n';
			template += '				area\n';
			template += '				area\n';
			template += '			br\n';
			template += '			colgroup\n';
			template += '				col\n';
			template += '				col\n';

			var fireTpl = new FireTPL.Compiler();
			template = fireTpl.precompile(template);
			expect(template).to.eql(
				'scopes=scopes||{};var root=data,parent=data;var s=\'\';' +
				's+=\'<html><head><meta><title></title><link></head><body>' +
				'<input><img>' +
				'<div class="content"><map><area><area></map><br>' +
				'<colgroup><col><col></colgroup></div></body></html>\';'
			);
		});

		it('Should precompile a tmpl string with i18n tags', function() {
			var template = 'html\n';
			template += '	head\n';
			template += '	body\n';
			template += '		div class=description\n';
			template += '			@txt.description\n';
			template += '		button @btn.submit';

			var fireTpl = new FireTPL.Compiler();
			template = fireTpl.precompile(template);
			expect(template).to.eql(
				'scopes=scopes||{};var root=data,parent=data;var s=\'\';' +
				's+=\'<html><head></head><body>' +
				'<div class="description">\'+l.txt.description+\'</div>' +
				'<button>\'+l.btn.submit+\'</button></body></html>\';'
			);
		});

		it.skip('Should precompile a tmpl string with an each statement wrapped in a div scopeTags are enabled', function() {
			var template = 'html\n';
			template += '	head\n';
			template += '	body\n';
			template += '		h1 $title\n';
			template += '		:each $listing : div\n';
			template += '			div\n';
			template += '				"Hello $name"\n';

			var fireTpl = new FireTPL.Compiler({
				scopeTags: true
			});
			template = fireTpl.precompile(template);
			expect(template).to.eql(
				'scopes=scopes||{};var root=data,parent=data;' +
				'scopes.scope001=function(data,parent){var s=\'\';' +
				's+=h.exec(\'each\',data,parent,root,function(data){var s=\'\';' +
				's+=\'<div>Hello \'+data.name+\'</div>\';' +
				'return s;});return s;' +
				'};var s=\'\';' +
				's+=\'<html><head></head><body>' +
				'<h1><scope path="title"></scope></h1>' +
				'<div>' +
				'<scope fire-scop="scope001" path="listing"></scope>\';' +
				's+=\'</div></body></html>\';'
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