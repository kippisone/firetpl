describe('FireTPL integration tests', function() {
    'use strict';

    var minimalTemplate = 'div $name';

    var baseTemplate = 'section class=base-template\n' +
        '    h1 $title\n' +
        '    :if $listing\n' + 
        '        ul class=listing\n' +
        '            :each $listing\n' +
        '                li $name\n' +
        '    :else\n' +
        '        div class=no-data "No data available!"';
    
    describe('FireTPL.precompile()', function() {
        beforeEach(function() {

        });

        afterEach(function() {

        });

        it('Should compile a minimal template', function() {
            var template = FireTPL.compile(minimalTemplate);
            var html = template({
                name: 'Andi'
            });

            expect(html).to.eql('<div>Andi</div>');
        });

        it('Should compile a base template', function() {
            var template = FireTPL.compile(baseTemplate);
            var html = template({
                title: 'Listing test',
                listing: [{
                    name: 'Andi'
                }, {
                    name: 'Tini'
                }]
            });

            expect(html).to.eql('<section class="base-template"><h1>Listing test</h1><ul class="listing"><li>Andi</li><li>Tini</li></ul></section>');
        });
    });
});