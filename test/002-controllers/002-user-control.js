/* globals describe, it, before, after */

//complete path testing
const expect = require('chai').expect;
const sinon = require('sinon');
const mockery = require('mockery');

const User = require('../../lib/models/user');
const UserController = require('../../lib/controllers/UserController');
const common = require('../../lib/common');

describe('#UserController module: Test Controllers', function(){
    before(() => {
        sinon.stub(common, 'getStatusCode').returns(500);
        sinon.stub(global.console, 'log').returns(null);
    });

    after(() => {
        common.getStatusCode.restore();
        global.console.log.restore();
    });

    describe('#UserController.login: Login tests', function(){
        let user;
        before(function(){
            this.userFindOneStub = sinon.stub(User, 'findOne');
            user = new UserController({
                name: 'what'
            });
        });

        after(function(){
            User.findOne.restore();
        });

        it('#UserController.login: should return error', function(done){
            let loginCallback = (obj) => {
                expect(obj.err).to.be.an('object');
                expect(obj.err.message).to.be.equal('What');
                expect(obj.doc).to.be.undefined;
                expect(obj.status).to.equal(500);
                expect(obj.success).to.be.false;
                done();
            };
            this.userFindOneStub.yields({
                message: 'What'
            }, null);

            user.login(loginCallback);
        });
        it('#UserController.login: should return error(User not found)', function(done){
            let loginCallback = (obj) => {
                expect(obj.err).to.be.an('object');
                expect(obj.err.message).to.be.equal('Username or password incorrect');
                expect(obj.doc).to.be.undefined;
                expect(obj.status).to.equal(200);
                expect(obj.success).to.be.false;
                done();
            };
            this.userFindOneStub.yields(null, null);

            user.login(loginCallback);
        });
        it('#UserController.login: should return error(password not correct)', function(done){
            let loginCallback = (obj) => {
                expect(obj.err).to.be.an('object');
                expect(obj.err.message).to.be.equal('Username or password incorrect');
                expect(obj.doc).to.be.undefined;
                expect(obj.status).to.equal(200);
                expect(obj.success).to.be.false;
                done();
            };
            this.userFindOneStub.yields(null, {
                _id: 'what',
                name: 'what',
                password: 'what',
                comparePassword: () => {
                    return false;
                }
            });

            user.login(loginCallback);
        });
        it('#UserController.login: should login the user', function(done){
            let loginCallback = (obj) => {
                expect(obj.err).to.be.undefined;
                expect(obj.doc).to.be.an('object');
                expect(obj.doc.name).to.equal('what');
                expect(obj.status).to.equal(200);
                expect(obj.success).to.be.true;
                done();
            };
            this.userFindOneStub.yields(null, {
                _id: 'what',
                name: 'what',
                password: 'what',
                comparePassword: () => {
                    return true;
                },
                toObject: function(){
                    return this;
                }
            });

            user.login(loginCallback);
        });
    });

    describe('#UserController.signup: Signup tests', function(){
        before(function() {
            // mock the error reporter
            mockery.enable({
                warnOnReplace: false,
                warnOnUnregistered: false,
                useCleanCache: true
            });
            this.userSaveStub = sinon.stub(User.prototype, 'save');
        });

        after(function() {
            // disable mock after tests complete
            mockery.disable();
            User.prototype.save.restore();
        });

        it('#UserController.signup: should return an error', function(done){
            let signUpController = (obj) => {
                expect(obj.err).to.be.an('object');
                expect(obj.err.message).to.be.equal('What');
                expect(obj.status).to.equal(500);
                expect(obj.success).to.be.false;
                done();
            };

            this.userSaveStub.yields({
                message: 'What',
            });

            UserController.signup({
                name: 'what'
            }, signUpController);
        });

        it('#UserController.signup: should save the user', function(done) {
            let signUpController = (obj) => {
                expect(obj.err).to.be.null;
                expect(obj.status).to.equal(200);
                expect(obj.success).to.be.true;
                done();
            };

            this.userSaveStub.yields(null);
            UserController.signup({
                name: 'what'
            }, signUpController);
        });
    });

    describe('#UserController.userExists: User Exists test', function(){
        before(function(){
            this.userFindStub = sinon.stub(User, 'findOne');
        });
        after(() => {
            User.findOne.restore();
        });
        it('#UserController.userExists: should return error', function(done){
            let userExistsController = (obj) => {
                expect(obj.err).to.be.an('object');
                expect(obj.err.message).to.be.equal('What');
                expect(obj.status).to.equal(500);
                expect(obj.exists).to.be.undefined;
                expect(obj.success).to.be.false;
                done();
            };
            this.userFindStub.yields({
                message: 'What'
            }, null);

            UserController.userExists('what', userExistsController);
        });
        it('#UserController.emailExists: user exists', function(done){
            let userExistsController = (obj) => {
                expect(obj.err).to.be.undefined;
                expect(obj.status).to.equal(200);
                expect(obj.exists).to.be.true;
                expect(obj.success).to.be.true;
                done();
            };
            this.userFindStub.yields(null, {
                message: 'What'
            });

            UserController.userExists('what', userExistsController);
        });

        it('#UserController.emailExists: user doesn\'t exists', function(done){
            let userExistsController = (obj) => {
                expect(obj.err).to.be.undefined;
                expect(obj.status).to.equal(200);
                expect(obj.exists).to.be.false;
                expect(obj.success).to.be.true;
                done();
            };
            this.userFindStub.yields(null, null);
            UserController.userExists('what', userExistsController);
        });
    });
    describe('#UserController.emailExists: Email Exists test', function(){
        before(function(){
            this.userFindStub = sinon.stub(User, 'findOne');
        });
        after(() => {
            User.findOne.restore();
        });
        it('#UserController.emailExists: should return error', function(done){
            let emailExistsController = (obj) => {
                expect(obj.err).to.be.an('object');
                expect(obj.err.message).to.be.equal('What');
                expect(obj.status).to.equal(500);
                expect(obj.exists).to.be.undefined;
                expect(obj.success).to.be.false;
                done();
            };
            this.userFindStub.yields({
                message: 'What'
            }, null);

            UserController.emailExists('what', emailExistsController);
        });
        it('#UserController.emailExists: user exists', function(done){
            let emailExistsController = (obj) => {
                expect(obj.err).to.be.undefined;
                expect(obj.status).to.equal(200);
                expect(obj.exists).to.be.true;
                expect(obj.success).to.be.true;
                done();
            };
            this.userFindStub.yields(null, {
                message: 'What'
            });

            UserController.emailExists('what', emailExistsController);
        });

        it('#UserController.emailExists: user doesn\'t exists', function(done){
            let emailExistsController = (obj) => {
                expect(obj.err).to.be.undefined;
                expect(obj.status).to.equal(200);
                expect(obj.exists).to.be.false;
                expect(obj.success).to.be.true;
                done();
            };
            this.userFindStub.yields(null, null);
            UserController.emailExists('what', emailExistsController);
        });
    });
});
