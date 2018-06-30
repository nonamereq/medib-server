/* globals before, after, describe, it */

//complete path testing
const expect = require('chai').expect;
const sinon = require('sinon');
const mockery = require('mockery');

const AdminController = require('../../lib/controllers/AdminController');
const Event = require('../../lib/models/event');
const common = require('../../lib/common');

describe('#AdminController module: Test Controllers', function(){
    describe('#AdminController.postEvent: Post Event Tests', function(){
        before(function() {
            // mock the error reporter
            mockery.enable({
                warnOnReplace: false,
                warnOnUnregistered: false,
                useCleanCache: true
            });
            this.eventSaveStub = sinon.stub(Event.prototype, 'save');
            this.getStatusCodeStub = sinon.stub(common, 'getStatusCode');
        });

        after(function() {
            // disable mock after tests complete
            mockery.disable();
            Event.prototype.save.restore();
            common.getStatusCode.restore();
        });

        it('#AdminController.postEvent: should fail(Invalid date)', function(done){
            let postCallback = (obj) => {
                expect(obj.success).to.be.false;
                expect(obj.err.message).to.be.equal('Invalid date');
                done();
            };


            AdminController.postEvent({
                date: -10000
            }, postCallback);
        });

        it('#AdminController.postEvent: should fail(With MongoError, status 500)', function(done){
            let postCallback = (obj) => {
                expect(obj.success).to.be.false;
                expect(obj.err.name).to.be.equal('MongoError');
                expect(obj.status).to.equal(500);
                done();
            };

            this.getStatusCodeStub.returns(500);
            this.eventSaveStub.yields({
                name: 'MongoError'
            },null);

            AdminController.postEvent({
                date: 1529492888469
            }, postCallback);
        });

        it('#AdminController.postEvent: should save', function(done){
            let postCallback = (obj) => {
                expect(obj.success).to.be.true;
                expect(obj.doc.name).to.be.equal('EventDocument');
                expect(obj.status).to.equal(200);
                done();
            };

            this.getStatusCodeStub.returns(500);
            this.eventSaveStub.yields(null, {
                name: 'EventDocument'
            });
            AdminController.postEvent({
                date: 1529492888469
            }, postCallback);
        });
    });

    describe('#AdminController.updateEvent: Update Event Tests', function(){
        before(function(){
            this.eventUpdateStub = sinon.stub(Event, 'findByIdAndUpdate');
            sinon.stub(common, 'getStatusCode').returns(500);
        });

        after(function(){
            Event.findByIdAndUpdate.restore();
            common.getStatusCode.restore();
        });

        describe('#AdminController.updateEvent: should  return error', function(){
            let updateEventCallback = (done) => {
                return (obj) => {
                    expect(obj.success).to.be.false;
                    expect(obj.err).to.be.an('object');
                    expect(obj.err.message).to.equal('What the');
                    expect(obj.status).to.equal(500);
                    done();
                };
            };
            it('#AdminController.updateEvent: should return error invalid date', function(done){
                this.eventUpdateStub.yields({
                    name: 'MongoError',
                    message: 'What the'
                }, null);

                AdminController.updateEvent('abcdef', {
                    date: -10000
                }, updateEventCallback(done));
            });
            it('#AdminController.updateEvent: should return error correct date', function(done){

                this.eventUpdateStub.yields({
                    name: 'MongoError',
                    message: 'What the'
                }, null);

                AdminController.updateEvent('abcdef', {
                    date: Date.now() + (1000*60*70)
                }, updateEventCallback(done));
            });
        });

        it('#AdminController.updateEvent: should return error no such event', function(done){
            let updateEventCallback = (obj) => {
                expect(obj.success).to.be.false;
                expect(obj.err).to.be.an('object');
                expect(obj.err.message).to.equal('No such event');
                expect(obj.status).to.equal(400);
                done();
            };

            this.eventUpdateStub.yields(null, null);

            AdminController.updateEvent('abcdef', {
                date: -10000
            }, updateEventCallback);
        });

        it('#AdminController.updateEvent: should update the event', function(done){
            let updateEventCallback = (obj) => {
                expect(obj.success).to.be.true;
                expect(obj.err).to.be.undefined;
                expect(obj.doc).to.be.an('object');
                expect(obj.doc._id).to.be.equal('abcdef');
                expect(obj.status).to.equal(200);
                done();
            };

            this.eventUpdateStub.yields(null, {
                _id: 'abcdef'
            });

            AdminController.updateEvent('abcdef', {
                date: Date.now() + (50*60*1000)
            }, updateEventCallback);
        });
    });

    describe('#AdminController.assignWinner: Assign Winner Tests', function(){
        before(function(){
            this.eventUpdateStub = sinon.stub(Event, 'updateOne');
            sinon.stub(common, 'getStatusCode').returns(500);
            sinon.stub(AdminController, 'updateBets').returns(null);
        });

        after(function(){
            Event.updateOne.restore();
            common.getStatusCode.restore();
            AdminController.updateBets.restore();
        });

        it('#AdminController.assignWinner: Should return an error', function(done){
            let assignWinnerCallback = (obj) => {
                expect(obj.success).to.be.false;
                expect(obj.err).to.be.an('object');
                expect(obj.err.name).to.equal('MongoError');
                expect(obj.status).to.equal(500);
                done();
            };

            this.eventUpdateStub.yields({
                name: 'MongoError'
            },null);

            AdminController.assignWinner('abcdef', 'what', assignWinnerCallback);
        });
        it('#AdminController.assignWinner: Should return an error', function(done){
            let assignWinnerCallback = (obj) => {
                expect(obj.success).to.be.false;
                expect(obj.err).to.be.an('object');
                expect(obj.err.message).to.equal('No such event');
                expect(obj.status).to.equal(200);
                done();
            };

            this.eventUpdateStub.yields(null, null);

            AdminController.assignWinner('abcdef', 'what', assignWinnerCallback);
        });
        it('#AdminController.assignWinner: Should return an error', function(done){
            let assignWinnerCallback = (obj) => {
                expect(obj.success).to.be.false;
                expect(obj.err).to.be.an('object');
                expect(obj.err.message).to.equal('No such event');
                expect(obj.status).to.equal(400);
                done();
            };

            this.eventUpdateStub.yields(null, {
                nModified: 0
            });

            AdminController.assignWinner('abcdef', 'what', assignWinnerCallback);
        });
        it('#AdminController.assignWinner: Should update the event', function(done){
            let assignWinnerCallback = (obj) => {
                expect(obj.success).to.be.true;
                expect(obj.err).to.be.undefined;
                expect(obj.doc).to.be.an('object');
                expect(obj.doc.nModified).to.equal(1);
                expect(obj.status).to.equal(200);
                done();
            };

            this.eventUpdateStub.yields(null, {
                nModified: 1
            });

            AdminController.assignWinner('abcdef', 'what', assignWinnerCallback);
        });
    });
});
