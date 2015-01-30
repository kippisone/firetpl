describe('Comparsion Functions', function() {
    'use strict';
    
    describe('Function gt()', function() {
        it('Should be a function', function() {
            expect(FireTPL.fn.gt).to.be.a('function');
        });

        it('Should compare two numbers', function() {
            expect(FireTPL.fn.gt('328', '300')).to.be(true);
        });

        it('Should fail a comparsion with a string', function() {
            expect(FireTPL.fn.gt('three', '300')).to.be(false);
        });

        it('Should fail a comparsion with a lower number', function() {
            expect(FireTPL.fn.gt(200, '300')).to.be(false);
        });

        it('Should fail a comparsion with equal numbers', function() {
            expect(FireTPL.fn.gt(300, '300')).to.be(false);
        });
    });

    describe('Function gte()', function() {
        it('Should be a function', function() {
            expect(FireTPL.fn.gte).to.be.a('function');
        });

        it('Should compare two numbers', function() {
            expect(FireTPL.fn.gte('328', '300')).to.be(true);
        });

        it('Should fail a comparsion with a string', function() {
            expect(FireTPL.fn.gte('three', '300')).to.be(false);
        });

        it('Should fail a comparsion with a lower number', function() {
            expect(FireTPL.fn.gte(200, '300')).to.be(false);
        });

        it('Should fail a comparsion with equal numbers', function() {
            expect(FireTPL.fn.gte(300, '300')).to.be(true);
        });
    });

    describe('Function lt()', function() {
        it('Should be a function', function() {
            expect(FireTPL.fn.lt).to.be.a('function');
        });

        it('Should compare two numbers', function() {
            expect(FireTPL.fn.lt('228', '300')).to.be(true);
        });

        it('Should fail a comparsion with a string', function() {
            expect(FireTPL.fn.lt('three', '300')).to.be(false);
        });

        it('Should fail a comparsion with a lower number', function() {
            expect(FireTPL.fn.lt(400, '300')).to.be(false);
        });

        it('Should fail a comparsion with equal numbers', function() {
            expect(FireTPL.fn.lt(300, '300')).to.be(false);
        });
    });

    describe('Function lte()', function() {
        it('Should be a function', function() {
            expect(FireTPL.fn.lte).to.be.a('function');
        });

        it('Should compare two numbers', function() {
            expect(FireTPL.fn.lte('228', '300')).to.be(true);
        });

        it('Should fail a comparsion with a string', function() {
            expect(FireTPL.fn.lte('three', '300')).to.be(false);
        });

        it('Should fail a comparsion with a lower number', function() {
            expect(FireTPL.fn.lte(400, '300')).to.be(false);
        });

        it('Should fail a comparsion with equal numbers', function() {
            expect(FireTPL.fn.lte(300, '300')).to.be(true);
        });
    });
});