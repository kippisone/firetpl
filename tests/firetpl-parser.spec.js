describe.only('Parser', function() {
    'use strict';

    var Parser = require('../firetpl-node').Parser;

    var predefinedSyntaxConfig = {
        "pattern": [
            {
                "name": "tag",
                "func": "parseTag",
                "args": ["tag"],
                "parts": [
                    {
                        "name": "tagName",
                        "pattern": "([a-zA-Z][a-zA-Z0-9:_-]*)"
                    }
                ]
            }, {
                "name": "string",
                "func": "parseString",
                "args": ["string"],
                "parts": [
                    {
                        "name": "stringValue",
                        "pattern": "\"([^\"]*)\""
                    }
                ]
            }, {
                "name": "variable",
                "func": "parseVariable",
                "args": ["variableString"],
                "parts": [
                    {
                        "name": "variableString",
                        "pattern": "([@\\$](?:\\.?(?:[a-zA-Z][a-zA-Z0-9_-]*)(?:\\((?:[, ]*(?:\"[^\"]*\"|'[^']*'|\\d+))*\\))?)+)"
                    }
                ]
            }
        ]
    };

    describe('Instance', function() {
        it('Should be an instance of FireTPL.Parser', function() {
            expect(Parser).to.be.a('function');
            expect(new Parser()).to.be.a(Parser);
        });
    });

    describe('patternBuilder', function() {
        var parser,
            getSyntaxConfStub;

        beforeEach(function() {
            parser = new Parser();
            parser.syntax = predefinedSyntaxConfig;
        });

        it('Should create a names array from syntax conf', function() {
            var pat = parser.patternBuilder();
            expect(pat.names).to.eql([
                { name: 'tag', index: 1},
                { name: 'tagName', index: 2},
                { name: 'string', index: 3},
                { name: 'stringValue', index: 4},
                { name: 'variable', index: 5},
                { name: 'variableString', index: 6}
            ]);
        });

        it('Should create a funcs array from syntax conf', function() {
            var pat = parser.patternBuilder();
            expect(pat.funcs).to.eql([
                { func: 'parseTag', args: [1], index: 1},
                { func: 'parseString', args: [3], index: 3},
                { func: 'parseVariable', args: [6], index: 5}
            ]);
        });

        it('Should create a pattern from syntax conf', function() {
            var pattern = '(([a-zA-Z][a-zA-Z0-9:_-]*))|' +
                '(\"([^\"]*)\")|' +
                '(([@\\$](?:\\.?(?:[a-zA-Z][a-zA-Z0-9_-]*)(?:\\((?:[, ]*(?:"[^"]*"|\'[^\']*\'|\\d+))*\\))?)+))';

            var pat = parser.patternBuilder();
            expect(pat.pattern).to.eql(pattern);
        });

        it('Should create a firetpl pattern', function() {
            var getSyntaxConfStub = sinon.stub(Parser.prototype, 'getSyntaxConf');
            var parser = new Parser();

            expect(getSyntaxConfStub).was.calledOnce();
            expect(getSyntaxConfStub).was.calledWith('fire');
            
            getSyntaxConfStub.restore();
        });

        it('Should create a hbs pattern', function() {
            var getSyntaxConfStub = sinon.stub(Parser.prototype, 'getSyntaxConf');
            var parser = new Parser({
                type: 'hbs'
            });

            expect(getSyntaxConfStub).was.calledOnce();
            expect(getSyntaxConfStub).was.calledWith('hbs');
            
            getSyntaxConfStub.restore();
        });
    });

    describe('patternBuilder with subpattern', function() {
        var parser,
            getSyntaxConfStub;

        beforeEach(function() {
            parser = new Parser();
            parser.syntax = predefinedSyntaxConfig;
        });

        it('Should get a sub pattern', function() {
            var pat = parser.patternBuilder('variable');
            expect(pat.names).to.eql([
                { name: 'variable', index: 1},
                { name: 'variableString', index: 2}
            ]);
        });

        it('Should create a funcs array from syntax conf', function() {
            var pat = parser.patternBuilder('variable');
            expect(pat.funcs).to.eql([
                { func: 'parseVariable', args: [2], index: 1}
            ]);
        });

        it('Should create a pattern from syntax conf', function() {
            var pattern = '(([@\\$](?:\\.?(?:[a-zA-Z][a-zA-Z0-9_-]*)(?:\\((?:[, ]*(?:"[^"]*"|\'[^\']*\'|\\d+))*\\))?)+))';

            var pat = parser.patternBuilder('variable');
            expect(pat.pattern).to.eql(pattern);
        });
    });

    describe('getIndention', function() {
        it('Should get the number of indention', function() {
            var fireTpl = new Parser();
            var indention = fireTpl.getIndention('\t\t');
            expect(indention).to.eql(2);
        });

        it('Should get indention from an empty string', function() {
            var fireTpl = new Parser();
            var indention = fireTpl.getIndention('');
            expect(indention).to.eql(0);
        });

        it('Should get indention from a null object', function() {
            var fireTpl = new Parser();
            var indention = fireTpl.getIndention(null);
            expect(indention).to.eql(0);
        });
    });

    describe('getIndention (using spaces)', function() {
        it('Should get the number of indention', function() {
            var fireTpl = new Parser();
            var indention = fireTpl.getIndention('        ');
            expect(indention).to.eql(2);
        });

        it('Should get indention from an empty string', function() {
            var fireTpl = new Parser();
            var indention = fireTpl.getIndention('');
            expect(indention).to.eql(0);
        });

        it('Should get indention from a null object', function() {
            var fireTpl = new Parser();
            var indention = fireTpl.getIndention(null);
            expect(indention).to.eql(0);
        });

        it('Should throw an invalid indention error', function() {
            var fireTpl = new Parser();
            var fn = function() {
                fireTpl.getIndention('       ');
            };
            expect(fn).to.throwError('Invalid indention');
        });
    });

    describe('getIndention (using spaces and tabs)', function() {
        it('Should get the number of indention', function() {
            var fireTpl = new Parser();
            var indention = fireTpl.getIndention('\t    ');
            expect(indention).to.eql(2);
        });

        it('Should get indention from an empty string', function() {
            var fireTpl = new Parser();
            var indention = fireTpl.getIndention('');
            expect(indention).to.eql(0);
        });

        it('Should get indention from a null object', function() {
            var fireTpl = new Parser();
            var indention = fireTpl.getIndention(null);
            expect(indention).to.eql(0);
        });

        it('Should throw an invalid indention error (using spaces and tabs)', function() {
            var fireTpl = new Parser();
            var fn = function() {
                fireTpl.getIndention('\t       ');
            };
            expect(fn).to.throwError('Invalid indention');
        });
    });

    describe('matchVariables', function() {
        it('Should parse a string for variables', function() {
            var str = 'Hello $name!';
            var fireTpl = new Parser();
            var out = fireTpl.matchVariables(str);
            expect(out).to.eql('Hello \'+data.name+\'!');
        });

        it('Should parse a string for variables and inline functions', function() {
            var str = 'Hello $name.ucase()!';
            var fireTpl = new Parser();
            var out = fireTpl.matchVariables(str);
            expect(out).to.eql('Hello \'+f.ucase(data.name)+\'!');
        });

        it('Should parse a string for variables and inline chained functions', function() {
            var str = 'Hello $name.ucase().bold()!';
            var fireTpl = new Parser();
            var out = fireTpl.matchVariables(str);
            expect(out).to.eql('Hello \'+f.bold(f.ucase(data.name))+\'!');
        });

        it('Should parse a string for variables and inline functions with args', function() {
            var str = 'Hello $name.when("green").then("Green")!';
            var fireTpl = new Parser();
            var out = fireTpl.matchVariables(str);
            expect(out).to.eql('Hello \'+f.then(f.when(data.name,\'green\'),\'Green\')+\'!');
        });

        it('Should parse a string for locale tags', function() {
            var str = '@hello $name!';
            var fireTpl = new Parser();
            var out = fireTpl.matchVariables(str);
            expect(out).to.eql('\'+l.hello+\' \'+data.name+\'!');
        });

        it('Should parse a string for multiple variables and locale tags', function() {
            var str = '@hello $name! I\'m $reporter and live in $country!';
            var fireTpl = new Parser();
            var out = fireTpl.matchVariables(str);
            expect(out).to.eql('\'+l.hello+\' \'+data.name+\'! I\\\'m \'+data.reporter+\' and live in \'+data.country+\'!');
        });

        it('Should parse a string ', function() {
            var str = '@hello $name! I\'m $reporter and live in $country!';
            var fireTpl = new Parser();
            var out = fireTpl.matchVariables(str);
            expect(out).to.eql('\'+l.hello+\' \'+data.name+\'! I\\\'m \'+data.reporter+\' and live in \'+data.country+\'!');
        });

        it('Should parse a string and $this should point to data', function() {
            var str = '@hello $this! I\'m $reporter and live in $country!';
            var fireTpl = new Parser();
            var out = fireTpl.matchVariables(str);
            expect(out).to.eql('\'+l.hello+\' \'+data+\'! I\\\'m \'+data.reporter+\' and live in \'+data.country+\'!');
        });

        it('Should parse a string and $this.name should point to data', function() {
            var str = '@hello $this.name! I\'m $reporter and live in $country!';
            var fireTpl = new Parser();
            var out = fireTpl.matchVariables(str);
            expect(out).to.eql('\'+l.hello+\' \'+data.name+\'! I\\\'m \'+data.reporter+\' and live in \'+data.country+\'!');
        });

        it('Should parse a string and $parent.name should point to data', function() {
            var str = '@hello $parent.name! I\'m $reporter and live in $country!';
            var fireTpl = new Parser();
            var out = fireTpl.matchVariables(str);
            expect(out).to.eql('\'+l.hello+\' \'+parent.name+\'! I\\\'m \'+data.reporter+\' and live in \'+data.country+\'!');
        });

        it('Should parse a string and $root.name should point to data', function() {
            var str = '@hello $root.name! I\'m $reporter and live in $country!';
            var fireTpl = new Parser();
            var out = fireTpl.matchVariables(str);
            expect(out).to.eql('\'+l.hello+\' \'+root.name+\'! I\\\'m \'+data.reporter+\' and live in \'+data.country+\'!');
        });
    });

    describe.skip('matchVariables scopeTags enabled', function() {
        it('Should parse a string for variables', function() {
            var str = 'Hello $name!';
            var fireTpl = new Parser({ scopeTags: true });
            var out = fireTpl.matchVariables(str);
            expect(out).to.eql('Hello <scope path="name"></scope>!');
        });

        it('Should parse a string for locale tags', function() {
            var str = '@hello $name!';
            var fireTpl = new Parser({ scopeTags: true });
            var out = fireTpl.matchVariables(str);
            expect(out).to.eql('\'+l.hello+\' <scope path="name"></scope>!');
        });

        it('Should parse a string for multiple variables and locale tags', function() {
            var str = '@hello $name! I\'m $reporter and live in $country!';
            var fireTpl = new Parser({ scopeTags: true });
            var out = fireTpl.matchVariables(str);
            expect(out).to.eql('\'+l.hello+\' <scope path="name"></scope>! I\\\'m <scope path="reporter"></scope> and live in <scope path="country"></scope>!');
        });

        it('Should parse a string ', function() {
            var str = '@hello $name! I\'m $reporter and live in $country!';
            var fireTpl = new Parser({ scopeTags: true });
            var out = fireTpl.matchVariables(str);
            expect(out).to.eql('\'+l.hello+\' <scope path="name"></scope>! I\\\'m <scope path="reporter"></scope> and live in <scope path="country"></scope>!');
        });

        it('Should parse a string and $this should point to data', function() {
            var str = '@hello $this! I\'m $reporter and live in $country!';
            var fireTpl = new Parser({ scopeTags: true });
            var out = fireTpl.matchVariables(str);
            expect(out).to.eql('\'+l.hello+\' \'+data+\'! I\\\'m <scope path="reporter"></scope> and live in <scope path="country"></scope>!');
        });

        it('Should parse a string and $this.name should point to data', function() {
            var str = '@hello $this.name! I\'m $reporter and live in $country!';
            var fireTpl = new Parser({ scopeTags: true });
            var out = fireTpl.matchVariables(str);
            expect(out).to.eql('\'+l.hello+\' <scope path="name"></scope>! I\\\'m <scope path="reporter"></scope> and live in <scope path="country"></scope>!');
        });

        it('Should parse a string and $parent.name should point to data (in a scope)', function() {
            var str = '@hello $parent.name! I\'m $reporter and live in $country!';
            var fireTpl = new Parser({ scopeTags: true });
            fireTpl.curScope.unshift('scope001');
            var out = fireTpl.matchVariables(str);
            expect(out).to.eql('\'+l.hello+\' <scope path="name"></scope>! I\\\'m \'+data.reporter+\' and live in \'+data.country+\'!');
        });

        it('Should parse a string and $parent should not be replaced by a scope tag (in a scope)', function() {
            var str = '@hello $parent! I\'m $reporter and live in $country!';
            var fireTpl = new Parser({ scopeTags: true });
            fireTpl.curScope.unshift('scope001');
            var out = fireTpl.matchVariables(str);
            expect(out).to.eql('\'+l.hello+\' \'+parent+\'! I\\\'m \'+data.reporter+\' and live in \'+data.country+\'!');
        });

        it('Should parse a string and $root.name should point to data', function() {
            var str = '@hello $root.name! I\'m $reporter and live in $country!';
            var fireTpl = new Parser({ scopeTags: true });
            var out = fireTpl.matchVariables(str);
            expect(out).to.eql('\'+l.hello+\' <scope path="name"></scope>! I\\\'m <scope path="reporter"></scope> and live in <scope path="country"></scope>!');
        });

        it('Should parse a string and $root should not be replaced by a scope tag (in a scope)', function() {
            var str = '@hello $root! I\'m $reporter and live in $country!';
            var fireTpl = new Parser({ scopeTags: true });
            fireTpl.curScope.unshift('scope001');
            var out = fireTpl.matchVariables(str);
            expect(out).to.eql('\'+l.hello+\' \'+root+\'! I\\\'m \'+data.reporter+\' and live in \'+data.country+\'!');
        });
    });

    describe('parse', function() {
        var stubs = ['parseTag', 'parseCloseTag', 'parseString', 'parseVariable', 'parseHelper',
            'parseCodeBlock', 'parseAttribute', 'parseIndention'];

        var parser, 
            result = [];

        beforeEach(function() {
            parser = new Parser();
            stubs = stubs.map(function(stub) {
                return sinon.stub(parser, stub, function() {
                    var args = Array.prototype.slice.call(arguments);
                    args.unshift(stub);
                    result.push(args);
                });
            });
        });
        
        afterEach(function() {
            stubs.forEach(function(stub) {
                stub.restore();
            });
        });

        it('Should parse a tag', function() {
            var tmpl =
                'div\n' +
                '    span "Hello World"\n' +
                '    :if $name\n' +
                '        span $name\n' +
                '        span $state.if("loggedin", "Logged-in", "Logged-out")\n' +
                '    div class="register"\n' +
                '        id="regform"\n' +
                '            "Create new account $name"\n';

            parser.parse(tmpl);
            expect(result).to.eql([
                ['parseTag', 'div'],
                ['parseIndention', '    '],
                ['parseTag', 'span'],
                ['parseString', 'Hello World'],
                ['parseIndention', '    '],
                ['parseHelper', 'if', 'name', undefined],
                ['parseIndention', '        '],
                ['parseTag', 'span'],
                ['parseVariable', '$name'],
                ['parseIndention', '        '],
                ['parseTag', 'span'],
                ['parseVariable', '$state.if("loggedin", "Logged-in", "Logged-out")'],
                ['parseIndention', '    '],
                ['parseTag', 'div'],
                ['parseAttribute', 'class', '"register"'],
                ['parseIndention', '        '],
                ['parseAttribute', 'id', '"regform"'],
                ['parseIndention', '            '],
                ['parseString', 'Create new account $name']
            ]);
        });
    });

    describe('parseTag', function() {
        it('Should parse a tag', function() {
            var parser = new Parser();
            parser.parseTag('div');

            expect(parser.flush()).to.eql('s+=\'<div></div>\';');
        });

        it('Should parse a void tag', function() {
            var parser = new Parser();
            parser.parseTag('img');

            expect(parser.flush()).to.eql('s+=\'<img>\';');
        });

        it('Should parse a non standard tag', function() {
            var parser = new Parser();
            parser.parseTag('beer');

            expect(parser.flush()).to.eql('s+=\'<beer></beer>\';');
        });
    });

    describe('parseIndention', function() {
        it('Should handle indention on indent', function() {
            var fireTpl = new Parser();
            fireTpl.indention = 2;
            fireTpl.closer = ['a', 'b', 'c'];
            fireTpl.parseIndention('\t\t\t');

            expect(fireTpl.indention).to.be(3);
            expect(fireTpl.closer).to.length(3);
            expect(fireTpl.closer).to.eql(['a', 'b', 'c']);
        });

        it('Should handle indention on outdent', function() {
            var fireTpl = new Parser();
            fireTpl.indention = 2;
            fireTpl.closer = ['a', 'b', 'c'];
            fireTpl.parseIndention('\t');

            expect(fireTpl.indention).to.be(1);
            expect(fireTpl.closer).to.length(1);
            expect(fireTpl.closer).to.eql(['a']);
        });

        it('Should handle indention on same indention', function() {
            var fireTpl = new Parser();
            fireTpl.indention = 2;
            fireTpl.closer = ['a', 'b', 'c'];
            fireTpl.parseIndention('\t\t');

            expect(fireTpl.indention).to.be(2);
            expect(fireTpl.closer).to.length(2);
            expect(fireTpl.closer).to.eql(['a', 'b']);
        });

        it('Should handle 5 step outdention', function() {
            var fireTpl = new Parser();
            fireTpl.indention = 8;
            fireTpl.closer = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'];
            fireTpl.parseIndention('\t\t\t');

            expect(fireTpl.indention).to.be(3);
            expect(fireTpl.closer).to.length(3);
            expect(fireTpl.closer).to.eql(['a', 'b', 'c']);
        });
    });

    describe('parseIndention (using spaces)', function() {
        it('Should handle indention on indent', function() {
            var fireTpl = new Parser();
            fireTpl.indention = 2;
            fireTpl.closer = ['a', 'b', 'c'];
            fireTpl.parseIndention('            ');

            expect(fireTpl.indention).to.be(3);
            expect(fireTpl.closer).to.length(3);
            expect(fireTpl.closer).to.eql(['a', 'b', 'c']);
        });

        it('Should handle indention on outdent', function() {
            var fireTpl = new Parser();
            fireTpl.indention = 2;
            fireTpl.closer = ['a', 'b', 'c'];
            fireTpl.parseIndention('    ');

            expect(fireTpl.indention).to.be(1);
            expect(fireTpl.closer).to.length(1);
            expect(fireTpl.closer).to.eql(['a']);
        });

        it('Should handle indention on same indention', function() {
            var fireTpl = new Parser();
            fireTpl.indention = 2;
            fireTpl.closer = ['a', 'b', 'c'];
            fireTpl.parseIndention('        ');

            expect(fireTpl.indention).to.be(2);
            expect(fireTpl.closer).to.length(2);
            expect(fireTpl.closer).to.eql(['a', 'b']);
        });

        it('Should handle 5 step outdention', function() {
            var fireTpl = new Parser();
            fireTpl.indention = 8;
            fireTpl.closer = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'];
            fireTpl.parseIndention('            ');

            expect(fireTpl.indention).to.be(3);
            expect(fireTpl.closer).to.length(3);
            expect(fireTpl.closer).to.eql(['a', 'b', 'c']);
        });
    });

    describe('parseString', function() {
        it('Should parse a string', function() {
            var fireTpl = new Parser();
            fireTpl.parseString('Hello World!');

            expect(fireTpl.flush()).to.eql('s+=\'Hello World!\';');
        });

        it('Should parse a string with with variables', function() {
            var fireTpl = new Parser();
            fireTpl.parseString('Hello $name!');

            expect(fireTpl.flush()).to.eql('s+=\'Hello \'+data.name+\'!\';');
        });

        it('Should parse a string with with multiple variables', function() {
            var fireTpl = new Parser();
            fireTpl.parseString('Hello $name.firstname $name.lastname!');

            expect(fireTpl.flush()).to.eql('s+=\'Hello \'+data.name.firstname+\' \'+data.name.lastname+\'!\';');
        });

        it('Should parse a string with inline functions', function() {
            var fireTpl = new Parser();
            fireTpl.parseString('Hello $name.if("andi", "Andi", "Other")!');

            expect(fireTpl.flush()).to.eql('s+=\'Hello \'+f.if(data.name,\'andi\',\'Andi\',\'Other\')+\'!\';');
        });
    });


});