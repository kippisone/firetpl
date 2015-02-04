describe.only('Parser', function() {
    'use strict';

    var Parser = require('../firetpl-node').Parser,
        coffeeTools = require('./coffee-tools');

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

    describe('undent', function() {
        it('Should undent a string block', function() {
            var fireTpl = new Parser();
            var str = '\n' + 
                '        div\n' +     
                '            span\n' +     
                '            "Undented"\n' +     
                '        \n';

            expect(fireTpl.undent(2, str)).to.eql(
                'div\n' +     
                '    span\n' +     
                '    "Undented"\n' +     
                ''
            );     
        });
    });

    describe('escape', function() {
        it('Should escape a string', function() {
            var fireTpl = new Parser();
            var str = fireTpl.escape('Hello \'Andi\'');
            expect(str).to.eql('Hello \\\'Andi\\\'');
        });
    });

    describe('htmlEscape', function() {
        it('Should escape a html string', function() {
            var fireTpl = new Parser();
            var str = fireTpl.htmlEscape('Hello "Andi"');
            expect(str).to.eql('Hello &quot;Andi&quot;');
        });
    });

    describe('parse', function() {
        var stubs;

        var parser, 
            result;

        beforeEach(function() {
            stubs = ['parseTag', 'parseCloseTag', 'parseString', 'parseVariable', 'parseHelper',
            'parseCodeBlock', 'parseAttribute', 'parseIndention'];

            result = [];
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

        it('Should parse a code block', function() {
            var tmpl =
                'div\n' +
                '    ```js\n' +
                '        var bla = "blubb";\n' +
                '        bla = bla.concat(`$inlineVar`).trim();\n' +
                '        console.log(bla);\n' +
                '    ```\n';

            parser.parse(tmpl);
            expect(result).to.eql([
                ['parseTag', 'div'],
                ['parseIndention', '    '],
                ['parseCodeBlock', 'js',
                    '\n' +
                    '        var bla = "blubb";\n' +
                    '        bla = bla.concat(`$inlineVar`).trim();\n' +
                    '        console.log(bla);\n    '
                ]
            ]);
        });
    });

    describe('parseTag', function() {
        it('Should parse a tag', function() {
            var parser = new Parser();
            parser.parseTag('div');

            expect(parser.flush()).to.eql('scopes=scopes||{};var root=data,parent=data;var s=\'\';s+=\'<div></div>\';');
        });

        it('Should parse a void tag', function() {
            var parser = new Parser();
            parser.parseTag('img');

            expect(parser.flush()).to.eql('scopes=scopes||{};var root=data,parent=data;var s=\'\';s+=\'<img>\';');
        });

        it('Should parse a non standard tag', function() {
            var parser = new Parser();
            parser.parseTag('beer');

            expect(parser.flush()).to.eql('scopes=scopes||{};var root=data,parent=data;var s=\'\';s+=\'<beer></beer>\';');
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

            expect(fireTpl.flush()).to.eql('scopes=scopes||{};var root=data,parent=data;var s=\'\';s+=\'Hello World!\';');
        });

        it('Should parse a string with with variables', function() {
            var fireTpl = new Parser();
            fireTpl.parseString('Hello $name!');

            expect(fireTpl.flush()).to.eql('scopes=scopes||{};var root=data,parent=data;var s=\'\';s+=\'Hello \'+data.name+\'!\';');
        });

        it('Should parse a string with with multiple variables', function() {
            var fireTpl = new Parser();
            fireTpl.parseString('Hello $name.firstname $name.lastname!');

            expect(fireTpl.flush()).to.eql('scopes=scopes||{};var root=data,parent=data;var s=\'\';s+=\'Hello \'+data.name.firstname+\' \'+data.name.lastname+\'!\';');
        });

        it('Should parse a string with inline functions', function() {
            var fireTpl = new Parser();
            fireTpl.parseString('Hello $name.if("andi", "Andi", "Other")!');

            expect(fireTpl.flush()).to.eql('scopes=scopes||{};var root=data,parent=data;var s=\'\';s+=\'Hello \'+f.if(data.name,\'andi\',\'Andi\',\'Other\')+\'!\';');
        });
    });

    describe('parseVariable', function() {
        it('Should parse a variable', function() {
            var fireTpl = new Parser();
            fireTpl.parseVariable('$name');

            expect(fireTpl.flush()).to.eql('scopes=scopes||{};var root=data,parent=data;var s=\'\';s+=\'\'+data.name+\'\';');
        });

        it('Should parse $this', function() {
            var fireTpl = new Parser();
            fireTpl.parseVariable('$this');

            expect(fireTpl.flush()).to.eql('scopes=scopes||{};var root=data,parent=data;var s=\'\';s+=\'\'+data+\'\';');
        });

        it('Should parse $root', function() {
            var fireTpl = new Parser();
            fireTpl.parseVariable('$root.name');

            expect(fireTpl.flush()).to.eql('scopes=scopes||{};var root=data,parent=data;var s=\'\';s+=\'\'+root.name+\'\';');
        });

        it('Should parse $parent', function() {
            var fireTpl = new Parser();
            fireTpl.parseVariable('$parent.name');

            expect(fireTpl.flush()).to.eql('scopes=scopes||{};var root=data,parent=data;var s=\'\';s+=\'\'+parent.name+\'\';');
        });

        it('Should parse a chained variable variables', function() {
            var fireTpl = new Parser();
            fireTpl.parseVariable('$name.firstname');

            expect(fireTpl.flush()).to.eql('scopes=scopes||{};var root=data,parent=data;var s=\'\';s+=\'\'+data.name.firstname+\'\';');
        });

        it('Should parse a variable with inline functions', function() {
            var fireTpl = new Parser();
            fireTpl.parseVariable('$name.if("andi", "Andi", "Other")');

            expect(fireTpl.flush()).to.eql('scopes=scopes||{};var root=data,parent=data;var s=\'\';s+=\'\'+f.if(data.name,\'andi\',\'Andi\',\'Other\')+\'\';');
        });

        it('Should parse a variable with inline functions, using single quotes', function() {
            var fireTpl = new Parser();
            fireTpl.parseVariable('$name.if(\'andi\', \'Andi\', \'Other\')');

            expect(fireTpl.flush()).to.eql('scopes=scopes||{};var root=data,parent=data;var s=\'\';s+=\'\'+f.if(data.name,\'andi\',\'Andi\',\'Other\')+\'\';');
        });

        it('Should parse an inline function with an integer value', function() {
            var fireTpl = new Parser();
            fireTpl.parseVariable('$number.eq(3)');

            expect(fireTpl.flush()).to.eql('scopes=scopes||{};var root=data,parent=data;var s=\'\';s+=\'\'+f.eq(data.number,3)+\'\';');
        });

        it('Should parse a variable with inline functions, using single quotes in args', function() {
            var fireTpl = new Parser();
            fireTpl.parseVariable('$name.if("andi", "\'Andi\'", "\'Other\'")');

            expect(fireTpl.flush()).to.eql('scopes=scopes||{};var root=data,parent=data;var s=\'\';s+=\'\'+f.if(data.name,\'andi\',\'\\\'Andi\\\'\',\'\\\'Other\\\'\')+\'\';');
        });

        it('Should parse a variable with inline functions, using double quotes in args', function() {
            var fireTpl = new Parser();
            fireTpl.parseVariable('$name.if("andi", \'\"Andi\"\', \'\"Other\"\')');

            expect(fireTpl.flush()).to.eql('scopes=scopes||{};var root=data,parent=data;var s=\'\';s+=\'\'+f.if(data.name,\'andi\',\'\"Andi\"\',\'\"Other\"\')+\'\';');
        });

        it('Should parse a variable with multiple inline functions', function() {
            var fireTpl = new Parser();
            fireTpl.parseVariable('$name.when("andi").then("Andi")');

            expect(fireTpl.flush()).to.eql('scopes=scopes||{};var root=data,parent=data;var s=\'\';s+=\'\'+f.then(f.when(data.name,\'andi\'),\'Andi\')+\'\';');
        });

        it('Should parse a chained variable with multiple inline functions', function() {
            var fireTpl = new Parser();
            fireTpl.parseVariable('$name.firstname.when("andi").then("Andi")');

            expect(fireTpl.flush()).to.eql('scopes=scopes||{};var root=data,parent=data;var s=\'\';s+=\'\'+f.then(f.when(data.name.firstname,\'andi\'),\'Andi\')+\'\';');
        });

        it('Should parse a parent variable with multiple inline functions', function() {
            var fireTpl = new Parser();
            fireTpl.parseVariable('$parent.name.when("andi").then("Andi")');

            expect(fireTpl.flush()).to.eql('scopes=scopes||{};var root=data,parent=data;var s=\'\';s+=\'\'+f.then(f.when(parent.name,\'andi\'),\'Andi\')+\'\';');
        });

        it('Should parse a chained parent variable with multiple inline functions', function() {
            var fireTpl = new Parser();
            fireTpl.parseVariable('$parent.name.firstname.when("andi").then("Andi")');

            expect(fireTpl.flush()).to.eql('scopes=scopes||{};var root=data,parent=data;var s=\'\';s+=\'\'+f.then(f.when(parent.name.firstname,\'andi\'),\'Andi\')+\'\';');
        });

        it('Should parse a root variable with multiple inline functions', function() {
            var fireTpl = new Parser();
            fireTpl.parseVariable('$root.name.when("andi").then("Andi")');

            expect(fireTpl.flush()).to.eql('scopes=scopes||{};var root=data,parent=data;var s=\'\';s+=\'\'+f.then(f.when(root.name,\'andi\'),\'Andi\')+\'\';');
        });

        it('Should parse a chained root variable with multiple inline functions', function() {
            var fireTpl = new Parser();
            fireTpl.parseVariable('$root.name.firstname.when("andi").then("Andi")');

            expect(fireTpl.flush()).to.eql('scopes=scopes||{};var root=data,parent=data;var s=\'\';s+=\'\'+f.then(f.when(root.name.firstname,\'andi\'),\'Andi\')+\'\';');
        });
    });

    describe('parseHelper', function() {
        it('Should parse a helper', function() {
            var fireTpl = new Parser();
            fireTpl.parseHelper('if', 'name');

            expect(fireTpl.flush()).to.eql('scopes=scopes||{};var root=data,parent=data;scopes.scope001=function(data,parent){var s=\'\';var c=data;var r=h.exec(\'if\',c,parent,root,function(data){var s=\'\';return s;});s+=r;return s;};var s=\'\';s+=scopes.scope001(name,data);'); 
        });
    });

    describe('parseAttribute', function() {
        it('Should parse an attribute tag', function() {
            var fireTpl = new Parser();
            fireTpl.parseTag('div');
            fireTpl.parseAttribute('class', 'bla');

            expect(fireTpl.flush()).to.eql('scopes=scopes||{};var root=data,parent=data;var s=\'\';s+=\'<div class="bla"></div>\';');
        });

        it('Should parse an attribute tag, value within double quotes', function() {
            var fireTpl = new Parser();
            fireTpl.parseTag('div');
            fireTpl.parseAttribute('class', '"bla"');

            expect(fireTpl.flush()).to.eql('scopes=scopes||{};var root=data,parent=data;var s=\'\';s+=\'<div class="bla"></div>\';');
        });

        it('Should parse an attribute tag, value within single quotes', function() {
            var fireTpl = new Parser();
            fireTpl.parseTag('div');
            fireTpl.parseAttribute('class', '\'bla\'');

            expect(fireTpl.flush()).to.eql('scopes=scopes||{};var root=data,parent=data;var s=\'\';s+=\'<div class="bla"></div>\';');
        });

        it('Should parse an tag with multiple attributes', function() {
            var fireTpl = new Parser();
            fireTpl.parseTag('div');
            fireTpl.parseAttribute('class', '\'bla\'');
            fireTpl.parseAttribute('id', '\'blubb\'');

            expect(fireTpl.flush()).to.eql('scopes=scopes||{};var root=data,parent=data;var s=\'\';s+=\'<div class="bla" id="blubb"></div>\';');
        });

        it('Should parse a tag with a newline attribute', function() {
            var fireTpl = new Parser();
            fireTpl.parseTag('div');
            fireTpl.parseIndention('    ');
            fireTpl.parseAttribute('class', '\'bla\'');
            fireTpl.parseAttribute('id', '\'blubb\'');

            expect(fireTpl.flush()).to.eql('scopes=scopes||{};var root=data,parent=data;var s=\'\';s+=\'<div class="bla" id="blubb"></div>\';');
        });
    });

    describe('parseCodeBlock', function() {
        it('Should parse a code block', function() {
           var fireTpl = new Parser();
            fireTpl.parseTag('div');
            fireTpl.parseIndention('    ');
            fireTpl.parseCodeBlock('js',
                '\n' +
                '        var bla = \'blubb\'\n' +
                '        console.log(bla);\n' +
                '    '
            );

            expect(fireTpl.flush()).to.eql('scopes=scopes||{};var root=data,parent=data;var s=\'\';s+=\'<div><code class="js">var bla = \\\'blubb\\\'\nconsole.log(bla);</code></div>\';');
        });
    });

    describe.skip('parseFuncs', function() {
        var fireTpl;

        before(function() {
            fireTpl = new Parser();
            fireTpl.addEmptyCloseTags = true;
        });

        it('Should append a header tag', function() {
            fireTpl.parseTag('header');

            expect(fireTpl.out.root).to.eql('s+=\'<header>');
            expect(fireTpl.closer).to.eql(['</header>']);
        });

        it(' ... append an indention (+1)', function() {
            fireTpl.parseIndention('\t');

            expect(fireTpl.out.root).to.eql('s+=\'<header>');
            expect(fireTpl.closer).to.eql(['</header>']);
        });

        it(' ... append a h1 tag', function() {
            fireTpl.parseTag('h1');
            fireTpl.parseString('"Hello World');

            expect(fireTpl.out.root).to.eql('s+=\'<header><h1>Hello World');
            expect(fireTpl.closer).to.eql(['</header>', '</h1>']);
        });

        it(' ... append an indention (-1)', function() {
            fireTpl.parseIndention('');

            expect(fireTpl.out.root).to.eql('s+=\'<header><h1>Hello World</h1></header>');
            expect(fireTpl.closer).to.eql([]);
        });

        it(' ... append a section tag', function() {
            fireTpl.parseTag('section', 'class=main');

            expect(fireTpl.out.root).to.eql('s+=\'<header><h1>Hello World</h1></header><section class="main">');
            expect(fireTpl.closer).to.eql(['</section>']);
        });

        it(' ... append an indention (+1)', function() {
            fireTpl.parseIndention('\t');

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
            fireTpl.parseIndention('\t\t');

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
            fireTpl.parseIndention('\t\t\t');

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
            fireTpl.parseIndention('\t\t\t\t');

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
            fireTpl.parseIndention('\t\t\t\t');

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
            fireTpl.parseIndention('');

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
            fireTpl.parseIndention('\t');

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
            fireTpl.parseIndention('\t');

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
            fireTpl.parseIndention('\t\t');

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
            fireTpl.parseIndention('\t');

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

    describe.only('parse a fire tpl', function() {
        var tmpl,
            parser,
            next,
            rec,
            res = [],
            stubs = ['parseTag', 'parseCloseTag', 'parseString', 'parseVariable', 'parseHelper',
                'parseCodeBlock', 'parseAttribute', 'parseIndention'];

        before(function() {
            tmpl =
                'div class="firetpl-template"\n' +
                '    h1 "This is a basic firetpl tempalte"\n' +
                '    span $version\n' +
                '    :if $listing\n' +
                '        h2 "Has listings:"\n' +
                '            :each $listing : ul\n' +
                '                li class="item"\n' +
                '                    span class="name" $name\n' +
                '                    span class="gender" $gender\n' +
                '    :else\n' +
                '        h2 "Hasn\'t any listings!"\n'
            ;

            parser = new Parser();

            rec = coffeeTools.record(parser, stubs);

            parser.parse(tmpl);
            rec.play();
        });

        after(function() {
            
        });

        it('Should parse a template', function() {
            var step = rec.next();
            expect(step.name).to.eql('parseTag');
            expect(step.args[0]).to.eql('div');
            expect(parser.out.root).to.eql('s+=\'<div>');
            expect(parser.closer).to.eql(['</div>']);
        });

        it(' ... add a class', function() {
            var step = rec.next();
            expect(step.name).to.eql('parseAttribute');
            expect(step.args[0]).to.eql('class', '"firetpl-template"');
            expect(parser.out.root).to.eql('s+=\'<div class="firetpl-template">');
            expect(parser.closer).to.eql(['</div>']);
        });
    });
});