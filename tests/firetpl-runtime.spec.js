describe.only('FireTPL runtime', function() {
	describe('compile', function() {
		it('Should compile a tmpl string', function() {
			var template = 'html\n';
			template += '	head\n';
			template += '	body\n';
			template += '		div id=myDiv\n';
			template += '		div id=mySecondDiv class=myClass\n';

			template = FireTPL.compile(template);
			var html = template();
			expect(html).to.equal(
				'<html><head></head><body><div id="myDiv"></div>' +
				'<div id="mySecondDiv" class="myClass"></div>' +
				'</body></html>'
			);
		});

		it('Should compile a tmpl string with inline text', function() {
			var template = 'html\n';
			template += '	head\n';
			template += '	body\n';
			template += '		div id=myDiv\n';
			template += '		div id=mySecondDiv class=myClass\n';
			template += '			Hello World\n';

			template = FireTPL.compile(template);
			var html = template();
			expect(html).to.equal(
				'<html><head></head><body><div id="myDiv"></div>' +
				'<div id="mySecondDiv" class="myClass">Hello World</div>' +
				'</body></html>'
			);
		});

		it('Should compile a tmpl string with line attribute', function() {
			var template = 'html\n';
			template += '	head\n';
			template += '	body\n';
			template += '		div id=myDiv\n';
			template += '		div\n';
			template += '			id=mySecondDiv\n';
			template += '			class=myClass\n';
			template += '			\n';
			template += '			Hello World\n';

			template = FireTPL.compile(template);
			var html = template();
			expect(html).to.equal(
				'<html><head></head><body><div id="myDiv"></div>' +
				'<div id="mySecondDiv" class="myClass">Hello World</div>' +
				'</body></html>'
			);
		});

		it('Should compile a tmpl string with an if statement', function() {
			var template = 'html\n';
			template += '	head\n';
			template += '	body\n';
			template += '		:if $sayit\n';
			template += '			div\n';
			template += '				Hello World\n';

			template = FireTPL.compile(template);
			var html = template({
				sayit: true
			});
			expect(html).to.eql(
				'<html><head></head><body>'+
				'<div xq-scope="scope001" xq-path="sayit" class="xq-scope xq-scope001"><div>Hello World</div></div>' +
				'</body></html>'
			);
		});

		it('Should compile a tmpl string with a truthy if..else statement', function() {
			var template = 'html\n';
			template += '	head\n';
			template += '	body\n';
			template += '		:if $sayit\n';
			template += '			div\n';
			template += '				Hello World\n';
			template += '		:else\n';
			template += '			div\n';
			template += '				Good bye\n';

			template = FireTPL.compile(template);
			var html = template({
				sayit: true
			});
			expect(html).to.eql(
				'<html><head></head><body><div xq-scope="scope001" xq-path="sayit" class="xq-scope xq-scope001"><div>Hello World</div></div>' +
				'</body></html>'
			);
		});

		it('Should compile a tmpl string with a falsy if..else statement', function() {
			var template = 'html\n';
			template += '	head\n';
			template += '	body\n';
			template += '		:if $sayit\n';
			template += '			div\n';
			template += '				Hello World\n';
			template += '		:else\n';
			template += '			div\n';
			template += '				Good bye\n';

			template = FireTPL.compile(template);
			var html = template({
				sayit: false
			});
			expect(html).to.eql(
				'<html><head></head><body><div xq-scope="scope001" xq-path="sayit" class="xq-scope xq-scope001"><div>Good bye</div></div>' +
				'</body></html>'
			);
		});

		it('Should compile a tmpl string with an truthy unless statement', function() {
			var template = 'html\n';
			template += '	head\n';
			template += '	body\n';
			template += '		:unless $sayit\n';
			template += '			div\n';
			template += '				Hello World\n';

			template = FireTPL.compile(template);
			var html = template({
				sayit: true
			});
			expect(html).to.eql(
				'<html><head></head><body><div xq-scope="scope001" xq-path="sayit" class="xq-scope xq-scope001">' +
				'</div></body></html>'
			);
		});

		it('Should compile a tmpl string with an falsy unless statement', function() {
			var template = 'html\n';
			template += '	head\n';
			template += '	body\n';
			template += '		:unless $sayit\n';
			template += '			div\n';
			template += '				Hello World\n';

			template = FireTPL.compile(template);
			var html = template({
				sayit: false
			});
			expect(html).to.eql(
				'<html><head></head><body>' +
				'<div xq-scope="scope001" xq-path="sayit" class="xq-scope xq-scope001"><div>Hello World</div>' +
				'</div></body></html>'
			);
		});

		it('Should compile a tmpl string with an falsy each statement', function() {
			var template = 'html\n';
			template += '	head\n';
			template += '	body\n';
			template += '		:each $listing : div class=listing\n';
			template += '			div\n';
			template += '				"Hello World"\n';

			template = FireTPL.compile(template);
			var html = template({
				listing: undefined
			});
			expect(html).to.eql(
				'<html><head></head><body><div class="listing xq-scope xq-scope001" xq-scope="scope001" xq-path="listing">' +
				'</div></body></html>'
			);
		});

		it('Should compile a tmpl string with inline variable', function() {
			var template = 'html\n';
			template += '	head\n';
			template += '	body\n';
			template += '		:each $listing : div class=listing\n';
			template += '			span class="type-$type"	$name';

			template = FireTPL.compile(template);
			var html = template({
				listing: [
					{ name: 'Andi', type: 'cool' },
					{ name: 'Tini', type: 'sassy' }
				]
			});
			expect(html).to.eql(
				'<html><head></head><body>' + 
				'<div class="listing xq-scope xq-scope001" xq-scope="scope001" xq-path="listing">' +
				'<span class="type-cool">Andi</span>' +
				'<span class="type-sassy">Tini</span>' +
				'</div></body></html>'
			);
		});

		it('Should compile a tmpl string with an truthy each statement', function() {
			var template = 'html\n';
			template += '	head\n';
			template += '	body\n';
			template += '		:each $listing\n';
			template += '			span\n';
			template += '				$name\n';

			template = FireTPL.compile(template);
			var html = template({
				listing: [
					{name: 'Andi'},
					{name: 'Donnie'}
				]
			});
			expect(html).to.eql(
				'<html><head></head><body><div xq-scope="scope001" xq-path="listing" class="xq-scope xq-scope001">' +
				'<span>Andi</span><span>Donnie</span>' +
				'</div></body></html>'
			);
		});
	});

	describe('compile (using template cache)', function() {
		it('Should compile a tmpl string', function() {
			var template = function(data, scopes) {
				var s = '';
				s+='<html><head></head><body><div id="myDiv"></div>';
				s+='<div id="mySecondDiv" class="myClass"></div>';
				s+='</body></html>';
				return s;
			};

			var html = template();
			expect(html).to.eql(
				'<html><head></head><body><div id="myDiv"></div>' +
				'<div id="mySecondDiv" class="myClass"></div>' +
				'</body></html>'
			);
		});

		it('Should compile a tmpl string with inline text', function() {
			var template = function(data, scopes) {
				var s = '';
				s+='<html><head></head><body><div id="myDiv"></div>' +
				'<div id="mySecondDiv" class="myClass">Hello World</div>' +
				'</body></html>';
				return s;
			};

			var html = template();
			expect(html).to.eql(
				'<html><head></head><body><div id="myDiv"></div>' +
				'<div id="mySecondDiv" class="myClass">Hello World</div>' +
				'</body></html>'
			);
		});

		it('Should compile a tmpl string with line attribute', function() {
			var template = function(data, scopes) {
				var s = '';
				s+='<html><head></head><body><div id="myDiv"></div>' +
				'<div id="mySecondDiv" class="myClass">Hello World</div>' +
				'</body></html>';
				return s;
			};

			var html = template();
			expect(html).to.eql(
				'<html><head></head><body><div id="myDiv"></div>' +
				'<div id="mySecondDiv" class="myClass">Hello World</div>' +
				'</body></html>'
			);
		});

		it('Should compile a tmpl string with an if statement', function() {
			var template = function(data, scopes) {
				var s='';
				var h = new FireTPL.Runtime();
				scopes=scopes||{};
				var parent = data;
				var root = data;
				scopes.scope001=function(data, parent){
						var s='';
						var c=data;
						var r=h.exec('if', c, parent, root,function(data){
								var s='';
								s+='<div>Hello World</div>';
								return s;

						});
						s+=r;
						return s;

				};
				s+='<html><head></head><body><div xq-scope="scope001" xq-path="sayit" class="xq-scope xq-scope001">';
				s+=scopes.scope001(data.sayit, data);
				s+='</div></body></html>';
				return s;
			};

			var html = template({
				sayit: true
			});
			expect(html).to.eql(
				'<html><head></head><body><div xq-scope="scope001" xq-path="sayit" class="xq-scope xq-scope001"><div>Hello World</div>' +
				'</div></body></html>'
			);
		});

		it('Should compile a tmpl string with a truthy if..else statement', function() {
			var template = function(data, scopes) {
				var h = new FireTPL.Runtime();
				scopes=scopes||{};
				var parent = data;
				var root = data;
				scopes.scope001=function(data, parent){
						var s='';
						var c=data;
						var r=h.exec('if', c, parent, root,function(data){
								var s='';
								s+='<div>Hello World</div>';
								return s;

						});
						s+=r;
						if(!r){
								s+=h.exec('else', c, parent, root, function(data){
										var s='';
										s+='<div>Good bye</div>';
										return s;

								});

						}return s;

				};
				var s='';
				s+='<html><head></head><body><div xq-scope="scope001" xq-path="sayit" class="xq-scope xq-scope001">';
				s+=scopes.scope001(data.sayit, data);
				s+='</div></body></html>';
				return s;
			};

			var html = template({
				sayit: true
			});
			expect(html).to.equal(
				'<html><head></head><body><div xq-scope="scope001" xq-path="sayit" class="xq-scope xq-scope001"><div>Hello World</div>' +
				'</div></body></html>'
			);
		});

		it('Should compile a tmpl string with a falsy if..else statement', function() {
			var template = function(data, scopes) {
				var h = new FireTPL.Runtime();
				scopes=scopes||{};
				var parent = data;
				var root = data;
				scopes.scope001=function(data){
						var s='';
						var c=data;
						var r=h.exec('if', c, parent, root,function(data){
								var s='';
								s+='<div>Hello World</div>';
								return s;

						});
						s+=r;
						if(!r){
								s+=h.exec('else', c, parent, root, function(data){
										var s='';
										s+='<div>Good bye</div>';
										return s;

								});

						}return s;

				};
				var s='';
				s+='<html><head></head><body><div xq-scope="scope001" xq-path="sayit" class="xq-scope xq-scope001">';
				s+=scopes.scope001(data.sayit);
				s+='</div></body></html>';
				return s;

			};

			var html = template({
				sayit: false
			});
			expect(html).to.equal(
				'<html><head></head><body><div xq-scope="scope001" xq-path="sayit" class="xq-scope xq-scope001"><div>Good bye</div>' +
				'</div></body></html>'
			);
		});

		it('Should compile a tmpl string with an truthy unless statement', function() {
			var template = function(data, scopes) {
				var h = new FireTPL.Runtime();
				scopes=scopes||{};
				var parent = data;
				var root = data;
				scopes.scope001=function(data){
						var s='';
						s+=h.exec('unless', data, parent, root, function(data){
								var s='';
								s+='<div>Hello World</div>';
								return s;

						});
						return s;

				};
				var s='';
				s+='<html><head></head><body><div xq-scope="scope001" xq-path="sayit" class="xq-scope xq-scope001">';
				s+=scopes.scope001(data.sayit);
				s+='</div></body></html>';
				return s;
			};

			var html = template({
				sayit: true
			});
			expect(html).to.equal(
				'<html><head></head><body><div xq-scope="scope001" xq-path="sayit" class="xq-scope xq-scope001">' +
				'</div></body></html>'
			);
		});

		it('Should compile a tmpl string with an falsy unless statement', function() {
			var template = function(data, scopes) {
				var h = new FireTPL.Runtime();
				scopes=scopes||{};
				var parent = data;
				var root = data;
				scopes.scope001=function(data){
						var s='';
						s+=h.exec('unless', data, parent, root, function(data){
								var s='';
								s+='<div>Hello World</div>';
								return s;

						});
						return s;
				};
				var s='';
				s+='<html><head></head><body><div xq-scope="scope001" xq-path="sayit" class="xq-scope xq-scope001">';
				s+=scopes.scope001(data.sayit);
				s+='</div></body></html>';
				return s;
			};

			var html = template({
				sayit: false
			});
			expect(html).to.equal(
				'<html><head></head><body><div xq-scope="scope001" xq-path="sayit" class="xq-scope xq-scope001"><div>Hello World</div>' +
				'</div></body></html>'
			);
		});

		it('Should compile a tmpl string with an falsy each statement', function() {
			var template = function(data, scopes) {
				var h = new FireTPL.Runtime();
				scopes=scopes||{};
				var parent = data;
				var root = data;
				scopes.scope001=function(data,parent){
						var s='';
						s+=h.exec('each',data,parent,root,function(data){
								var s='';
								s+='<div>Hello World</div>';
								return s;

						});
						return s;

				};
				var s='';
				s+='<html><head></head><body><div class="listing xq-scope xq-scope001">';
				s+=scopes.scope001(data.listing,data);
				s+='</div></body></html>';
				return s;
			};

			var html = template({
				listing: undefined
			});
			expect(html).to.equal(
				'<html><head></head><body><div class="listing xq-scope xq-scope001">' +
				'</div></body></html>'
			);
		});

		it('Should compile a tmpl string with an truthy each statement', function() {
			var template = function(data, scopes) {
				var h = new FireTPL.Runtime();
				scopes=scopes||{};
				var parent = data;
				var root = data;
				scopes.scope001=function(data){
						var s='';
						s+=h.exec('each', data, parent, root, function(data){
								var s='';
								s+='<span>' + data.name + '</span>';
								return s;

						});
						return s;

				};
				var s='';
				s+='<html><head></head><body><div class="listing xq-scope xq-scope001">';
				s+=scopes.scope001(data.listing);
				s+='</div></body></html>';
				return s;
			};

			var html = template({
				listing: [
					{name: 'Andi'},
					{name: 'Donnie'}
				]
			});
			expect(html).to.equal(
				'<html><head></head><body><div class="listing xq-scope xq-scope001">' +
				'<span>Andi</span><span>Donnie</span>' +
				'</div></body></html>'
			);
		});
	});
	
	describe('Scopes', function() {
		it('Should call a scope function of a FireTemplate', function() {
			var template = function(data, scopes) {
				var h = new FireTPL.Runtime();
				scopes=scopes||{};
				var parent = data;
				var root = data;
				scopes.scope001=function(data){
						var s='';
						s+=h.exec('each', data, parent, root, function(data){
								var s='';
								s+='<span>' + data.name + '</span>';
								return s;

						});
						return s;

				};
				var s='';
				s+='<html><head></head><body><div class="listing xq-scope xq-scope001">';
				s+=scopes.scope001(data.listing);
				s+='</div></body></html>';
				return s;
			};

			var scopes = {};
			var html = template({
				listing: [
					{name: 'Andi'},
					{name: 'Donnie'}
				]
			}, scopes);

			expect(scopes).to.be.an('object');
			expect(scopes.scope001).to.be.a('function');

			expect(html).to.equal(
				'<html><head></head><body><div class="listing xq-scope xq-scope001">' +
				'<span>Andi</span><span>Donnie</span>' +
				'</div></body></html>'
			);

			var scopeCall = scopes.scope001([
				{name: 'Carl'}
			]);

			expect(scopeCall).to.eql('<span>Carl</span>');
		});
	});

	describe('$parent, $root and $this', function() {
		it('Should get the parent data scope with $parent', function() {
			var tmpl = 'div\n' +
				'	:each $listing : div\n' +
				'		span $parent.name\n';

			var template = FireTPL.compile(tmpl);
			var html = template({
				name: 'Andi',
				listing: [
					{ key: 'A', value: 'AAA' },
					{ key: 'B', value: 'BBB' }
				]
			});

			expect(html).to.eql('<div><div xq-scope="scope001" xq-path="listing" class="xq-scope xq-scope001"><span>Andi</span><span>Andi</span></div></div>');
		});

		it('Should get the root scope with $root', function() {
			var tmpl = 'div\n' +
				'	:each $list.listing : div\n' +
				'		span $root.name\n';

			var template = FireTPL.compile(tmpl);
			var html = template({
				name: 'Andi',
				list: {
					name:'Donnie',
					listing: [
						{ key: 'A', value: 'AAA' },
						{ key: 'B', value: 'BBB' }
					]
				}
			});

			expect(html).to.eql('<div><div xq-scope="scope001" xq-path="list.listing" class="xq-scope xq-scope001"><span>Andi</span><span>Andi</span></div></div>');
		});

		it('Should get the current scope with $this', function() {
			var tmpl = 'div\n' +
				'	:each $list.listing : div\n' +
				'		span $this.name\n';

			var template = FireTPL.compile(tmpl);
			var html = template({
				name: 'Andi',
				list: {
					name:'Donnie',
					listing: [
						{ name: 'Berney', key: 'A', value: 'AAA' },
						{ name: 'Donnie', key: 'B', value: 'BBB' }
					]
				}
			});

			expect(html).to.eql('<div><div xq-scope="scope001" xq-path="list.listing" class="xq-scope xq-scope001"><span>Berney</span><span>Donnie</span></div></div>');
		});
	});

	describe('template()', function() {
		it('Should not create a new data scope in an :if helper', function() {
			var tmpl = 'div\n' +
				'	:if $listing : div\n' +
				'		span $listing.name\n' +
				'	:if $name : div\n' +
				'		span $name\n';

			var template = FireTPL.compile(tmpl);
			var html = template({
				name: 'Andi',
				listing: {
					name: 'Berney',
					key: 'A',
					value: 'AAA'
				}
			});

			expect(html).to.eql('<div>' +
				'<div xq-scope="scope001" xq-path="listing" class="xq-scope xq-scope001"><span>Berney</span></div>' +
				'<div xq-scope="scope002" xq-path="name" class="xq-scope xq-scope002"><span>Andi</span></div>' +
				'</div>');
		});
	});
});