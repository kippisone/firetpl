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
			template += '		if $sayit\n';
			template += '			div\n';
			template += '				Hello World\n';

			template = FireTPL.compile(template);
			var html = template({
				sayit: true
			});
			expect(html).to.equal(
				'<html><head></head><body><div>Hello World</div>' +
				'</body></html>'
			);
		});

		it('Should compile a tmpl string with a truthy if..else statement', function() {
			var template = 'html\n';
			template += '	head\n';
			template += '	body\n';
			template += '		if $sayit\n';
			template += '			div\n';
			template += '				Hello World\n';
			template += '		else\n';
			template += '			div\n';
			template += '				Good bye\n';

			template = FireTPL.compile(template);
			var html = template({
				sayit: true
			});
			expect(html).to.equal(
				'<html><head></head><body><div>Hello World</div>' +
				'</body></html>'
			);
		});

		it('Should compile a tmpl string with a falsy if..else statement', function() {
			var template = 'html\n';
			template += '	head\n';
			template += '	body\n';
			template += '		if $sayit\n';
			template += '			div\n';
			template += '				Hello World\n';
			template += '		else\n';
			template += '			div\n';
			template += '				Good bye\n';

			template = FireTPL.compile(template);
			var html = template({
				sayit: false
			});
			expect(html).to.equal(
				'<html><head></head><body><div>Good bye</div>' +
				'</body></html>'
			);
		});

		it('Should compile a tmpl string with an truthy unless statement', function() {
			var template = 'html\n';
			template += '	head\n';
			template += '	body\n';
			template += '		unless $sayit\n';
			template += '			div\n';
			template += '				Hello World\n';

			template = FireTPL.compile(template);
			var html = template({
				sayit: true
			});
			expect(html).to.equal(
				'<html><head></head><body>' +
				'</body></html>'
			);
		});

		it('Should compile a tmpl string with an falsy unless statement', function() {
			var template = 'html\n';
			template += '	head\n';
			template += '	body\n';
			template += '		unless $sayit\n';
			template += '			div\n';
			template += '				Hello World\n';

			template = FireTPL.compile(template);
			var html = template({
				sayit: false
			});
			expect(html).to.equal(
				'<html><head></head><body><div>Hello World</div>' +
				'</body></html>'
			);
		});

		it('Should compile a tmpl string with an falsy each statement', function() {
			var template = 'html\n';
			template += '	head\n';
			template += '	body\n';
			template += '		each $listing\n';
			template += '			div\n';
			template += '				Hello World\n';

			template = FireTPL.compile(template);
			var html = template({
				listing: undefined
			});
			expect(html).to.equal(
				'<html><head></head><body class="xq-scope xq-scope001">' +
				'</body></html>'
			);
		});

		it('Should compile a tmpl string with an truthy each statement', function() {
			var template = 'html\n';
			template += '	head\n';
			template += '	body\n';
			template += '		each $listing\n';
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
				'<html><head></head><body class="xq-scope xq-scope001">' +
				'<span>Andi</span><span>Donnie</span>' +
				'</body></html>'
			);
		});
	});

	describe('compile (using template cache)', function() {
		it('Should compile a tmpl string', function() {
			var template = 's+=\'<html><head></head><body><div id="myDiv"></div>' +
				'<div id="mySecondDiv" class="myClass"></div>' +
				'</body></html>\';';

			template = FireTPL.compile(template);
			var html = template();
			expect(html).to.equal(
				'<html><head></head><body><div id="myDiv"></div>' +
				'<div id="mySecondDiv" class="myClass"></div>' +
				'</body></html>'
			);
		});

		it('Should compile a tmpl string with inline text', function() {
			var template = 's+=\'<html><head></head><body><div id="myDiv"></div>' +
				'<div id="mySecondDiv" class="myClass">Hello World</div>' +
				'</body></html>\';';

			template = FireTPL.compile(template);
			var html = template();
			expect(html).to.equal(
				'<html><head></head><body><div id="myDiv"></div>' +
				'<div id="mySecondDiv" class="myClass">Hello World</div>' +
				'</body></html>'
			);
		});

		it('Should compile a tmpl string with line attribute', function() {
			var template = 's+=\'<html><head></head><body><div id="myDiv"></div>' +
				'<div id="mySecondDiv" class="myClass">Hello World</div>' +
				'</body></html>\';';

			template = FireTPL.compile(template);
			var html = template();
			expect(html).to.equal(
				'<html><head></head><body><div id="myDiv"></div>' +
				'<div id="mySecondDiv" class="myClass">Hello World</div>' +
				'</body></html>'
			);
		});

		it('Should compile a tmpl string with an if statement', function() {
			var template = 's+=\'<html><head></head><body>\';' + 
				'var c=data.sayit;var r=h.if(c,function(data){var s=\'\';s+=\'' + 
				'<div>Hello World</div>\';' +
				'return s;});s+=r;' +
				's+=\'</body></html>\';';

			template = FireTPL.compile(template);
			var html = template({
				sayit: true
			});
			expect(html).to.equal(
				'<html><head></head><body><div>Hello World</div>' +
				'</body></html>'
			);
		});

		it('Should compile a tmpl string with a truthy if..else statement', function() {
			var template = 's+=\'<html><head></head><body>\';' +
				'var c=data.sayit;var r=h.if(c,function(data){var s=\'\';' +
				's+=\'<div>Hello World</div>\';' +
				'return s;});s+=r;' +
				'if(!r){s+=h.else(c,function(data){var s=\'\';' +
				's+=\'<div>Good bye</div>\';' +
				'return s;});}' +
				's+=\'</body></html>\';';

			template = FireTPL.compile(template);
			var html = template({
				sayit: true
			});
			expect(html).to.equal(
				'<html><head></head><body><div>Hello World</div>' +
				'</body></html>'
			);
		});

		it('Should compile a tmpl string with a falsy if..else statement', function() {
			var template = 's+=\'<html><head></head><body>\';' +
				'var c=data.sayit;var r=h.if(c,function(data){var s=\'\';' +
				's+=\'<div>Hello World</div>\';' +
				'return s;});s+=r;' +
				'if(!r){s+=h.else(c,function(data){var s=\'\';' +
				's+=\'<div>Good bye</div>\';' +
				'return s;});}' +
				's+=\'</body></html>\';';

			template = FireTPL.compile(template);
			var html = template({
				sayit: false
			});
			expect(html).to.equal(
				'<html><head></head><body><div>Good bye</div>' +
				'</body></html>'
			);
		});

		it('Should compile a tmpl string with an truthy unless statement', function() {
			var template = 's+=\'<html><head></head><body>\';' +
				's+=h.unless(data.sayit,function(data){var s=\'\';' +
				's+=\'<div>Hello World</div>\';' +
				'return s;});' +
				's+=\'</body></html>\';';

			template = FireTPL.compile(template);
			var html = template({
				sayit: true
			});
			expect(html).to.equal(
				'<html><head></head><body>' +
				'</body></html>'
			);
		});

		it('Should compile a tmpl string with an falsy unless statement', function() {
			var template = 's+=\'<html><head></head><body>\';' +
				's+=h.unless(data.sayit,function(data){var s=\'\';' +
				's+=\'<div>Hello World</div>\';' +
				'return s;});' +
				's+=\'</body></html>\';';

			template = FireTPL.compile(template);
			var html = template({
				sayit: false
			});
			expect(html).to.equal(
				'<html><head></head><body><div>Hello World</div>' +
				'</body></html>'
			);
		});

		it('Should compile a tmpl string with an falsy each statement', function() {
			var template = 's+=\'<html><head></head><body class="xq-scope xq-scope001">\';' +
				's+=h.each(data.listing,function(data){var s=\'\';' +
				's+=\'<span>\'+data.name+\'</span>\';' +
				'return s;});' +
				's+=\'</body></html>\';';

			template = FireTPL.compile(template);
			var html = template({
				listing: undefined
			});
			expect(html).to.equal(
				'<html><head></head><body class="xq-scope xq-scope001">' +
				'</body></html>'
			);
		});

		it('Should compile a tmpl string with an truthy each statement', function() {
			var template = 's+=\'<html><head></head><body class="xq-scope xq-scope001">\';' +
				's+=h.each(data.listing,function(data){var s=\'\';' +
				's+=\'<span>\'+data.name+\'</span>\';' +
				'return s;});' +
				's+=\'</body></html>\';';

			template = FireTPL.compile(template);
			var html = template({
				listing: [
					{name: 'Andi'},
					{name: 'Donnie'}
				]
			});
			expect(html).to.equal(
				'<html><head></head><body class="xq-scope xq-scope001">' +
				'<span>Andi</span><span>Donnie</span>' +
				'</body></html>'
			);
		});
	});
});