/* globals beforeEach, afterEach, describe, it */

const sinon = require('sinon');
const expect = require('chai').expect;
const http_mock = require('node-mocks-http');
const emitter = require('events').EventEmitter;

const Auth   = require('../../lib/auth/user');
const User   = require('../../lib/models/user');
const common = require('../../lib/common');

/*Complete path testing*/
describe('#Authenticator module: Test Autenticators', function(){
    describe('#GenerateToken function tests', () => {
        it('#Auth.generateToken: should not fail', function(){
            let object = {
                'sub': '1234567890',
                'name': 'John Doe',
                'iat': 1516239022
            };
            expect(Auth.generateToken(object)).to.equal('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.qh0RqsI5tRZgbT8pxhvyusCteK3I9_IctLvov5wboxk');
        });
    });

    describe('#Auth.decodeToken: Decode Token tests', function(){
        it('Auth.decodeToken: should fail', function(){
            let object = Auth.decodeToken('CI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.qh0RqsI5tRZgbT8pxhvyusCteK3I9_IctLvov5wboxk');

            expect(object).to.be.an('object');
            expect(object).to.be.empty;
        });
        it('Auth.decodeToken: should decode properely', function(){
            /* real object
             * let object = {
                'sub': '1234567890',
                'name': 'John Doe',
                'iat': 1516239022
            };*/
            let object = Auth.decodeToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.qh0RqsI5tRZgbT8pxhvyusCteK3I9_IctLvov5wboxk');

            expect(object).to.be.an('object');
            expect(object).to.have.property('sub');
            expect(object.sub).to.be.equal('1234567890');
            expect(object).to.have.property('name');
            expect(object.name).to.be.equal('John Doe');
            expect(object).to.have.property('iat');
            expect(object.iat).to.be.equal(1516239022);
        });
    });
    describe('#Request Resource required', () => {
        let mockReqRes = (token)=>{
            let res = http_mock.createResponse({eventEmitter:emitter});
            let req = http_mock.createRequest({
                body:{
                    token: token
                }
            });
            return [req, res];
        };

        beforeEach(function(){
            let reqRes = mockReqRes('abc123');
            this.req = reqRes[0];
            this.res = reqRes[1];
        });

        describe('#LoginRequired function tests', function(){
            beforeEach(function(){
                this.getStatusCodeStub = sinon.stub(common, 'getStatusCode');
                this.getStatusCodeStub.returns(500);
                this.decodeTokenStub = sinon.stub(Auth, 'decodeToken');
                this.decodeTokenStub.withArgs('abc123').returns('abc123');
            });
            afterEach(function(){
                common.getStatusCode.restore();
                Auth.decodeToken.restore();
            });
            it('#Auth.loginRequired: should fail return 401 status', function(done){
                this.req.body.token = null;

                this.res.on('end', () => {
                    try {
                        let resJson = JSON.parse(this.res._getData());
                        expect(resJson.err.message).to.be.equal('You need to log in');
                        expect(this.res.statusCode).to.be.equal(401);
                        done();
                    } catch (error) {
                        done(error);
                    }
                });

                Auth.loginRequired(this.req, this.res, null);
            });

            it('#Auth.loginRequired: should fail return 401 status', function(done){
                this.req.body.token = '';

                this.res.on('end', () => {
                    try {
                        let resJson = JSON.parse(this.res._getData());
                        expect(resJson.err.message).to.be.equal('You need to log in');
                        expect(this.res.statusCode).to.be.equal(401);
                        done();
                    } catch (error) {
                        done(error);
                    }
                });

                Auth.loginRequired(this.req, this.res, null);
            });
            it('#Auth.loginRequired: should call next', function(done){
                let next = () => { 
                    User.findById.restore();
                    done(); 
                };

                sinon.stub(User, 'findById').yields(null, {
                    _id    : 'abc123',
                    name   : 'abel',
                    email  : 'abel@a.com',
                    amount : 50,
                    isAdmin: false,
                    toObject : function(){
                        return this;
                    },
                    errors: null
                });


                Auth.loginRequired(this.req, this.res, next);
            });

            it('#Auth.loginRequired: should fail(user must be logged in)', function(done){
                this.res.on('end', () => {
                    User.findById.restore();
                    try {
                        let resJson = JSON.parse(this.res._getData());
                        expect(resJson.err).to.be.an('object');
                        expect(resJson.err.message).to.be.equal('User must be logged in');
                        expect(this.res.statusCode).to.be.equal(401);
                        done();
                    } catch (error) {
                        done(error);
                    }
                });

                sinon.stub(User, 'findById').yields(null, null);


                Auth.loginRequired(this.req, this.res, null);
            });

            it('#Auth.loginRequired: should fail(server error)', function(done){
                this.res.on('end', () => {
                    User.findById.restore();
                    try {
                        let resJson = JSON.parse(this.res._getData());
                        expect(resJson.err.name).to.be.equal('MongoError');
                        expect(this.res.statusCode).to.be.equal(500);
                        done();
                    } catch (error) {
                        done(error);
                    }
                });

                sinon.stub(User, 'findById').yields({
                    name: 'MongoError',
                }, null);

                this.getStatusCodeStub.returns(500);

                Auth.loginRequired(this.req, this.res, null);
            });

        });

        describe('#AdminRequired function tests', function(){
            it('#Auth.adminRequired: should return a status 401', function(done){
                this.req.user = {};
                this.res.on('end',()=>{
                    try {
                        let resJson = JSON.parse(this.res._getData());
                        expect(this.res.statusCode).to.equal(401);
                        expect(resJson.success).to.equal(false);
                        expect(resJson.err.message).to.equal('You have to be admin');
                        done();
                    } catch (error) {
                        done(error);
                    }
                });
                Auth.adminRequired(this.req, this.res, null);
            });
            it('#Auth.adminRequired: should call next', function(done){
                let next = () => done();
                this.req.user = {isAdmin: true};

                Auth.adminRequired(this.req, this.res, next);
            });
        });
    });
});
