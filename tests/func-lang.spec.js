describe.only('fn.lang()', function() {
    'use strict';

    describe('Method', function() {
        it('Should be a function', function() {
            expect(FireTPL.fn.lang).to.be.a('function');
        });

        it('Should return a localized string', function() {
            var l = function() {
                return 'Hello I\'m an i18n string';
            };

            expect(FireTPL.fn.lang(l({}))).to.eql(l);
        });

        it('Should return a singular localized string', function() {
            var l = {
                sing: 'Hello I\'m an i18n string'
            };

            expect(FireTPL.fn.lang(l, {})).to.eql(l.sing);
        });

        it('Should return a singular localized string', function() {
            var l = {
                sing: 'Hello I\'m an i18n string',
                key: 'number'
            };

            expect(FireTPL.fn.lang(l, {
                number: 1
            })).to.eql(l.sing);
        });

        it('Should return a plurial localized string', function() {
            var l = {
                sing: 'Hello I\'m an i18n string',
                plur: 'Hello we\'re i18n strings',
                key: 'number'
            };

            expect(FireTPL.fn.lang(l, {
                number: 5
            })).to.eql(l.plur);
        });

        it('Should replace var tags', function() {
            var l = {
                sing: 'Hello I\'m an '+data.name+' string',
                plur: 'Hello we\'re '+data.name+' strings',
                key: 'number'
            };

            expect(FireTPL.fn.lang(l, {
                number: 5
                name: 'i18n'
            })).to.eql(l.plur);
        });
    });
});