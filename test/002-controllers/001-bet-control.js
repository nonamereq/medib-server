/*  globals before, after, describe, it */

//complete path testing
const expect = require('chai').expect;
const sinon = require('sinon');
const mockery = require('mockery');

const User = require('../../lib/models/user');
const Event = require('../../lib/models/event');
const Bet = require('../../lib/models/bet');
const BetController = require('../../lib/controllers/BetController');
const common = require('../../lib/common');

describe('#BetController module: Test Controllers', function(){
    before(() => {
        sinon.stub(common, 'getStatusCode').returns(500);
    });
    after(() => {
        common.getStatusCode.restore();
    });
    describe('#BetController.hasSufficentAmount: hasSufficentAmount testing', function(){
        let bet = new BetController({
            amount: 10
        });
        it('#BetController.hasSufficentAmount: should return false', function(){
            expect(bet.hasSufficentAmount(100)).to.be.false;
        });
        it('#BetController.hasSufficentAmount: should return true', function(){
            expect(bet.hasSufficentAmount(1)).to.be.true;
        });
    });

    describe('#BetController.viewEvent: View Event Tests', function() {
        before(function(){
            this.eventFindStub = sinon.stub(Event, 'findById');
        });

        after(() => {
            Event.findById.restore();
        });

        it('#BetController.viewEvent: Should return an error(server error)', function(done){
            let viewCallback = (obj) => {
                expect(obj.err).to.be.an('object');
                expect(obj.status).to.equal(500);
                expect(obj.doc).to.be.undefined;
                expect(obj.err.message).to.equal('what');
                done();
            };

            this.eventFindStub.yields({
                message: 'what'
            }, null);

            BetController.viewEvent('abcdef', viewCallback);
        });

        it('#BetController.viewEvent: Should return error(No such event)', function(done){
            let viewCallback = (obj) => {
                expect(obj.err).to.be.an('object');
                expect(obj.status).to.equal(200);
                expect(obj.err.message).to.equal('No such event');
                expect(obj.doc).to.be.undefined;
                done();
            };

            this.eventFindStub.yields(null, null);

            BetController.viewEvent('abcdef', viewCallback);
        });

        it('#BetController.viewEvent: Should return error(No such event)', function(done){
            let viewCallback = (obj) => {
                expect(obj.err).to.be.an('object');
                expect(obj.status).to.equal(200);
                expect(obj.err.message).to.equal('No such event');
                expect(obj.doc).to.be.undefined;
                done();
            };

            this.eventFindStub.yields(null, {
                closingTime: Date.now()
            });

            BetController.viewEvent('abcdef', viewCallback);
        });

        it('#BetController.viewEvent: Should reutrn an event', function(done){
            let closingDate = Date.now() + ( 24 * 60 * 60 * 1000);
            let viewCallback = (obj) => {
                expect(obj.err).to.be.undefined;
                expect(obj.status).to.equal(200);
                expect(obj.doc._id).to.equal('abcdef');
                expect(obj.doc.closingTime).to.equal(closingDate);
                done();
            };

            this.eventFindStub.yields(null, {
                _id: 'abcdef',
                closingTime: closingDate
            });

            BetController.viewEvent('abcdef', viewCallback);
        });
    });

    describe('#BetController.subtractAmount: subtract Amount tests', function(){
        let bet = new BetController({
            name: 'abel',
            _id: 'abcdef'
        });
        before(function(){
            this.userUpdateStub = sinon.stub(User, 'updateOne');
        });

        after(function(){
            User.updateOne.restore();
        });

        it('#BetController.subtractAmount: return an error', function(done){
            let subtractAmountCallback = (obj) => {
                expect(obj.success).to.be.false;
                expect(obj.err).to.be.an('object');
                expect(obj.err.message).to.equal('What');
                expect(obj.status).to.equal(500);
                done();
            };

            this.userUpdateStub.yields({
                message: 'What',
            });

            bet.subtractAmount(1000, subtractAmountCallback);
        });

        it('#BetController.subtractAmount: succeceds', function(done){
            let subtractAmountCallback = (obj) => {
                expect(obj.success).to.be.true;
                expect(obj.err).to.be.undefined;
                expect(obj.status).to.equal(200);
                done();
            };

            this.userUpdateStub.yields(null);

            bet.subtractAmount(1000, subtractAmountCallback);
        });
    });

    describe('#BetController.addAmount: Add Amount tests', function(){
        let bet = new BetController({
            _id: 'abcdefg',
            name: 'what',
        });
        before(function(){
            this.userUpdateStub = sinon.stub(User, 'updateOne');
        });

        after(function(){
            User.updateOne.restore();
        });

        it('#BetController.addAmount: Should return error', function(done){
            let addAmountCallback = (obj) => {
                expect(obj.err).to.be.an('object');
                expect(obj.err.name).to.be.equal('MongoError');
                expect(obj.status).to.equal(500);
                expect(obj.success).to.be.false;
                done();
            };

            this.userUpdateStub.yields({
                name: 'MongoError'
            },null);

            bet.addAmount(1000, addAmountCallback);
        });

        it('#BetController.addAmount: should succeced', function(done){
            let addAmountCallback = (obj) => {
                expect(obj.success).to.be.true;
                expect(obj.err).to.be.undefined;
                expect(obj.status).to.equal(200);
                done();
            };

            this.userUpdateStub.yields(null, {});

            bet.addAmount(1000, addAmountCallback);
        });
    });

    describe('#BetController.betOn: Bet on tests', function(){
        let bet = new BetController({
            name: 'test_bet',
            amount: 1000
        });
        before(function(){
            // mock the error reporter
            mockery.enable({
                warnOnReplace: false,
                warnOnUnregistered: false,
                useCleanCache: true
            });
            this.eventFindStub = sinon.stub(Event, 'findById');
            this.betSaveStub = sinon.stub(Bet.prototype, 'save');
            this.hasSufficentAmountStub = sinon.stub(BetController.prototype, 'hasSufficentAmount');

        });
        after(function(){
            // disable mock after tests complete
            mockery.disable();
            Bet.prototype.save.restore();
            Event.findById.restore();
            BetController.prototype.hasSufficentAmount.restore();
        });

        it('#BetController.betOn: should fail not enough amount', function(done){
            let betCallback = (obj) => {
                expect(obj.err).to.be.an('object');
                expect(obj.success).to.be.false;
                expect(obj.status).to.be.equal(400);
                expect(obj.err.message).to.be.equal('User does not have a sufficent amount');
                done();
            };

            this.hasSufficentAmountStub.returns(false);
            bet.betOn('abcdef', 'abc', 10000, betCallback);
        });

        it('#BetController.betOn: should fail server error', function(done){
            let betCallback = (obj) => {
                expect(obj.err).to.be.an('object');
                expect(obj.success).to.be.false;
                expect(obj.status).to.be.equal(500);
                expect(obj.err.name).to.be.equal('MongoError');
                done();
            };

            this.hasSufficentAmountStub.returns(true);

            this.eventFindStub.yields({
                name: 'MongoError'
            }, null);

            bet.betOn('abcdef', 'abc', 10000, betCallback);
        });

        it('#BetController.betOn: should fail no such event', function(done){
            let betCallback = (obj) => {
                expect(obj.err).to.be.an('object');
                expect(obj.success).to.be.false;
                expect(obj.status).to.be.equal(400);
                expect(obj.err.message).to.be.equal('No such event');
                done();
            };

            this.hasSufficentAmountStub.returns(true);

            this.eventFindStub.yields(null, null);

            bet.betOn('abcdef', 'abc', 10000, betCallback);
        });

        it('#BetController.betOn: should fail incorrect team', function(done){
            let betCallback = (obj) => {
                expect(obj.err).to.be.an('object');
                expect(obj.success).to.be.false;
                expect(obj.status).to.be.equal(200);
                expect(obj.err.message).to.be.equal('You have to choose a correct team.');
                done();
            };

            this.hasSufficentAmountStub.returns(true);

            this.eventFindStub.yields(null, {
                team1_name: 'which',
                team2_name: 'what'
            });

            bet.betOn('abcdef', 'abc', 10000, betCallback);
        });

        it('#BetController.betOn: should fail couldn\'t subtract amount', function(done){
            let betCallback = (obj) => {
                expect(obj.err).to.be.an('object');
                expect(obj.success).to.be.false;
                expect(obj.status).to.be.equal(500);
                expect(obj.err.name).to.be.equal('MongoError');
                BetController.prototype.subtractAmount.restore();
                done();
            };

            this.hasSufficentAmountStub.returns(true);

            this.eventFindStub.yields(null, {
                team1_name: 'which',
                team2_name: 'what'
            });

            sinon.stub(BetController.prototype, 'subtractAmount').yields({
                success: false,
                status: 500,
                err:{
                    name: 'MongoError'
                }
            });

            bet.betOn('abcdef', 'which', 10000, betCallback);
        });

        it('#BetController.bet: should fail server error', function(done){
            let betCallback = (obj) => {
                expect(obj.err).to.be.an('object');
                expect(obj.success).to.be.false;
                expect(obj.status).to.be.equal(500);
                expect(obj.err.name).to.be.equal('MongoError');
                expect(add.called).to.be.true;
                BetController.prototype.subtractAmount.restore();
                BetController.prototype.addAmount.restore();
                done();
            };

            this.hasSufficentAmountStub.returns(true);

            this.eventFindStub.yields(null, {
                team1_name: 'which',
                team2_name: 'what'
            });

            sinon.stub(BetController.prototype, 'subtractAmount').yields({
                success: true,
            });
            let add = sinon.stub(BetController.prototype, 'addAmount');

            this.betSaveStub.yields({
                name: 'MongoError'
            }, null);

            bet.betOn('abcdef', 'which', 10000, betCallback);
        });
        it('#BetController.bet: should succeced', function(done){
            let betCallback = (obj) => {
                expect(obj.err).to.be.undefined;
                expect(obj.success).to.be.true;
                expect(obj.status).to.be.equal(200);
                expect(obj.doc).to.be.an('object');
                expect(obj.doc._id).to.be.equal('abc123');
                BetController.prototype.subtractAmount.restore();
                done();
            };

            this.hasSufficentAmountStub.returns(true);

            this.eventFindStub.yields(null, {
                team1_name: 'which',
                team2_name: 'what'
            });

            sinon.stub(BetController.prototype, 'subtractAmount').yields({
                success: true,
            });

            this.betSaveStub.yields(null, {
                _id: 'abc123'
            });

            bet.betOn('abcdef', 'which', 10000, betCallback);
        });
    });

    describe('#BetController.cashOut: Cashout tests', function(){
        it('#BetController.cashOut: should fail with error', function(done){
            let cashOutCallback = (obj) => {
                expect(obj.err).to.be.an('object');
                expect(obj.err.message).to.be.equal('User does not have a sufficent amount');
                expect(obj.status).to.equal(400);
                expect(obj.success).to.be.false;
                BetController.prototype.hasSufficentAmount.restore();
                done();
            };

            let bet = new BetController({
                name: 'what',
            });
            sinon.stub(BetController.prototype, 'hasSufficentAmount').returns(false);

            bet.cashOut(100, cashOutCallback);
        });

        it('#BetController.cashOut: should succeced', function(done){
            let cashOutCallback = (obj) => {
                expect(obj.err).to.be.undefined;
                expect(obj.status).to.equal(200);
                expect(obj.success).to.be.true;
                BetController.prototype.hasSufficentAmount.restore();
                BetController.prototype.subtractAmount.restore();
                done();
            };

            let bet = new BetController({
                name: 'what',
            });

            sinon.stub(BetController.prototype, 'hasSufficentAmount').returns(true);
            sinon.stub(BetController.prototype, 'subtractAmount').yields({
                success: true,
                status: 200
            });

            bet.cashOut(100, cashOutCallback);
        });
    });

    describe('#BetController.index: Index tests', function(){
        before(function(){
            this.eventFindStub = sinon.stub(Event, 'find');
        });

        after(function(){
            Event.find.restore();
        });

        it('#BetController.index: Should fail server error', function(done){
            let indexCallback = (obj) =>{
                expect(obj.err).to.be.an('object');
                expect(obj.err.name).to.be.equal('MongoError');
                expect(obj.success).to.be.false;
                expect(obj.status).to.equal(500);
                done();
            };

            this.eventFindStub.yields({
                name: 'MongoError',
            }, null);

            BetController.index(null, null, indexCallback);
        });

        it('#BetController.index: Should return documents less than limit', function(done){
            let indexCallback = (obj) => {
                expect(obj.err).to.be.undefined;
                expect(obj.doc).to.be.an('array');
                expect(obj.doc).to.have.lengthOf.at.most(7);
                expect(obj.success).to.be.true;
                expect(obj.status).to.equal(200);
                done();
            };

            this.eventFindStub.yields(null, [
                {
                    team1_name: 'which',
                    team2_name: 'what',
                },
                {
                    team1_name: 'which',
                    team2_name: 'what',
                },
                {
                    team1_name: 'which',
                    team2_name: 'what',
                },
                {
                    team1_name: 'which',
                    team2_name: 'what',
                },
                {
                    team1_name: 'which',
                    team2_name: 'what',
                },
                {
                    team1_name: 'which',
                    team2_name: 'what',
                },
            ]);
            BetController.index(null, null, indexCallback);
        });
    });
});
