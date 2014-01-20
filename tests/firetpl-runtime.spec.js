describe('FireTPL runtime', function() {
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
			expect(html).to.equal(
				'<html><head></head><body><div class="xq-scope xq-scope001"><div>Hello World</div></div>' +
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
			expect(html).to.equal(
				'<html><head></head><body><div class="xq-scope xq-scope001"><div>Hello World</div></div>' +
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
			expect(html).to.equal(
				'<html><head></head><body><div class="xq-scope xq-scope001"><div>Good bye</div></div>' +
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
			expect(html).to.equal(
				'<html><head></head><body><div class="xq-scope xq-scope001">' +
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
			expect(html).to.equal(
				'<html><head></head><body><div class="xq-scope xq-scope001"><div>Hello World</div>' +
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
			expect(html).to.equal(
				'<html><head></head><body><div class="listing xq-scope xq-scope001">' +
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
			expect(html).to.equal(
				'<html><head></head><body><div class="xq-scope xq-scope001">' +
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
			expect(html).to.equal(
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
			expect(html).to.equal(
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
			expect(html).to.equal(
				'<html><head></head><body><div id="myDiv"></div>' +
				'<div id="mySecondDiv" class="myClass">Hello World</div>' +
				'</body></html>'
			);
		});

		it('Should compile a tmpl string with an if statement', function() {
			var template = function(data, scopes) {
				var s='';
				var h=FireTPL.helpers;
				scopes=scopes||{};
				scopes.scope001=function(data){
						var s='';
						var c=data;
						var r=h.if(c,function(data){
								var s='';
								s+='<div>Hello World</div>';
								return s;

						});
						s+=r;
						return s;

				};
				s+='<html><head></head><body><div class="xq-scope xq-scope001">';
				s+=scopes.scope001(data.sayit);
				s+='</div></body></html>';
				return s;
			};

			var html = template({
				sayit: true
			});
			expect(html).to.equal(
				'<html><head></head><body><div class="xq-scope xq-scope001"><div>Hello World</div>' +
				'</div></body></html>'
			);
		});

		it('Should compile a tmpl string with a truthy if..else statement', function() {
			var template = function(data, scopes) {
                var h=FireTPL.helpers;
                scopes=scopes||{};
                scopes.scope001=function(data){
                        var s='';
                        var c=data;
                        var r=h.if(c,function(data){
                                var s='';
                                s+='<div>Hello World</div>';
                                return s;

                        });
                        s+=r;
                        if(!r){
                                s+=h.else(c,function(data){
                                        var s='';
                                        s+='<div>Good bye</div>';
                                        return s;

                                });

                        }return s;

                };
                var s='';
                s+='<html><head></head><body><div class="xq-scope xq-scope001">';
                s+=scopes.scope001(data.sayit);
                s+='</div></body></html>';
                return s;
			};

			var html = template({
				sayit: true
			});
			expect(html).to.equal(
				'<html><head></head><body><div class="xq-scope xq-scope001"><div>Hello World</div>' +
				'</div></body></html>'
			);
		});

		it('Should compile a tmpl string with a falsy if..else statement', function() {
			var template = function(data, scopes) {
				var h=FireTPL.helpers;
                scopes=scopes||{};
                scopes.scope001=function(data){
                        var s='';
                        var c=data;
                        var r=h.if(c,function(data){
                                var s='';
                                s+='<div>Hello World</div>';
                                return s;

                        });
                        s+=r;
                        if(!r){
                                s+=h.else(c,function(data){
                                        var s='';
                                        s+='<div>Good bye</div>';
                                        return s;

                                });

                        }return s;

                };
                var s='';
                s+='<html><head></head><body><div class="xq-scope xq-scope001">';
                s+=scopes.scope001(data.sayit);
                s+='</div></body></html>';
                return s;

			};

			var html = template({
				sayit: false
			});
			expect(html).to.equal(
				'<html><head></head><body><div class="xq-scope xq-scope001"><div>Good bye</div>' +
				'</div></body></html>'
			);
		});

		it('Should compile a tmpl string with an truthy unless statement', function() {
			var template = function(data, scopes) {
				var h=FireTPL.helpers;
                scopes=scopes||{};
                scopes.scope001=function(data){
                        var s='';
                        s+=h.unless(data,function(data){
                                var s='';
                                s+='<div>Hello World</div>';
                                return s;

                        });
                        return s;

                };
                var s='';
                s+='<html><head></head><body><div class="xq-scope xq-scope001">';
                s+=scopes.scope001(data.sayit);
                s+='</div></body></html>';
                return s;
			};

			var html = template({
				sayit: true
			});
			expect(html).to.equal(
				'<html><head></head><body><div class="xq-scope xq-scope001">' +
				'</div></body></html>'
			);
		});

		it('Should compile a tmpl string with an falsy unless statement', function() {
			var template = function(data, scopes) {
				var h=FireTPL.helpers;
                scopes=scopes||{};
                scopes.scope001=function(data){
                        var s='';
                        s+=h.unless(data,function(data){
                                var s='';
                                s+='<div>Hello World</div>';
                                return s;

                        });
                        return s;
                };
                var s='';
                s+='<html><head></head><body><div class="xq-scope xq-scope001">';
                s+=scopes.scope001(data.sayit);
                s+='</div></body></html>';
                return s;
			};

			var html = template({
				sayit: false
			});
			expect(html).to.equal(
				'<html><head></head><body><div class="xq-scope xq-scope001"><div>Hello World</div>' +
				'</div></body></html>'
			);
		});

		it('Should compile a tmpl string with an falsy each statement', function() {
			var template = function(data, scopes) {
				var h=FireTPL.helpers;
                scopes=scopes||{};
                scopes.scope001=function(data){
                        var s='';
                        s+=h.each(data,function(data){
                                var s='';
                                s+='<div>Hello World</div>';
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
				listing: undefined
			});
			expect(html).to.equal(
				'<html><head></head><body><div class="listing xq-scope xq-scope001">' +
				'</div></body></html>'
			);
		});

		it('Should compile a tmpl string with an truthy each statement', function() {
			var template = function(data, scopes) {
				var h=FireTPL.helpers;
                scopes=scopes||{};
                scopes.scope001=function(data){
                        var s='';
                        s+=h.each(data,function(data){
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
});