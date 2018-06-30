/* globals describe, it, before, beforeEach*/
const sinon = require('sinon');
const expect = require('chai').expect;
const http_mock = require('node-mocks-http');
const emitter = require('events').EventEmitter;

const Middleware = require('../../lib/routes/middlewares');

// complet path testing
describe('#Middleware module testing', function(){
    describe('#Middleware.validateRequest: Validate Request Tests', function(){
        before(function(){
            this.req;
        });

        beforeEach(function(){
            this.res = http_mock.createResponse({eventEmitter: emitter});
        });

        describe('#Middleware.validateRequest: Validate Request should do the same in case of body and query', function(){
            beforeEach(function(){
                this.req = http_mock.createRequest({
                    query: {
                        name: 'what'
                    },
                    body: {
                        name: 'what'
                    },
                });
            });

            it('#Middleware.validateRequest: should return error(query)', function(done){
                let next = sinon.spy();
                this.res.on('end', () => {
                    try{
                        let response = JSON.parse(this.res._getData());
                        expect(response.err).to.be.an('object');
                        expect(response.err).to.have.property('password');
                        expect(response.err).to.not.have.property('name');
                        expect(response.err.password.message).to.equal('password must not be empty.');
                        expect(response.success).to.to.be.false;
                        expect(this.res.statusCode).to.be.equal(400);
                        expect(next.called).to.be.false;
                        done();
                    }
                    catch(error){
                        done(error);
                    }
                });

                let mapping = [ 'name', 'password'];

                let realMiddleware = Middleware.validateRequest(mapping, true, 'query');
                realMiddleware(this.req, this.res, next);
            });

            it('#Middleware.validateRequest: should return error(body)', function(done){
                let next = sinon.spy();
                this.res.on('end', () => {
                    try{
                        let response = JSON.parse(this.res._getData());
                        expect(response.err).to.be.an('object');
                        expect(response.err).to.have.property('password');
                        expect(response.err).to.not.have.property('name');
                        expect(response.err.password.message).to.equal('password must not be empty.');
                        expect(response.success).to.to.be.false;
                        expect(this.res.statusCode).to.be.equal(400);
                        expect(next.called).to.be.false;
                        done();
                    }
                    catch(error){
                        done(error);
                    }
                });

                let mapping = [ 'name', 'password'];

                let realMiddleware = Middleware.validateRequest(mapping);
                realMiddleware(this.req, this.res, next);
            });
        });

        it('#Middleware.validateRequest: Validate request should return an error', function(done){
            this.req = http_mock.createRequest({
                body: {
                    name: 'what',
                    password: ''
                },
            });
            let next = sinon.spy();
            this.res.on('end', () => {
                try{
                    let response = JSON.parse(this.res._getData());
                    expect(response.err).to.be.an('object');
                    expect(response.err).to.have.property('password');
                    expect(response.err).to.not.have.property('name');
                    expect(response.err.password.message).to.equal('password must not be empty.');
                    expect(response.success).to.to.be.false;
                    expect(this.res.statusCode).to.be.equal(400);
                    expect(next.called).to.be.false;
                    done();
                }
                catch(error){
                    done(error);
                }
            });

            let mapping = [ 'name', 'password'];

            let realMiddleware = Middleware.validateRequest(mapping);
            realMiddleware(this.req, this.res, next);
        });

        it('#Middleware.validateRequest: Validate request should succeced(null mapping)', function(done){
            this.req = http_mock.createRequest({
                body: {
                    name: 'what',
                },
            });
            let next = () => {
                done();
            };

            let mapping = null;

            let realMiddleware = Middleware.validateRequest(mapping, false);
            realMiddleware(this.req, this.res, next);
        });

        it('#Middleware.validateRequest: Validate request should succeced(mapping with resources not stripped)', function(done){
            this.req = http_mock.createRequest({
                body: {
                    name: 'what',
                    password: 'abcdef',
                    amount: 115
                },
            });
            let next = () => {
                expect(this.req.body).to.not.have.property('amount');
                expect(this.req.body).to.have.property('name');
                expect(this.req.body).to.have.property('password');
                expect(this.req.body.name).to.be.equal('what');
                done();
            };

            let mapping = [ 'name', 'password'];

            let realMiddleware = Middleware.validateRequest(mapping, true);
            realMiddleware(this.req, this.res, next);
        });

        it('#Middleware.validateRequest: Validate request should succeced(mapping with resources stripped)', function(done){
            this.req = http_mock.createRequest({
                body: {
                    name: 'what',
                    password: 'abcdef',
                    amount: 115
                },
            });
            let next = () => {
                expect(this.req.body).to.have.property('amount');
                expect(this.req.body).to.have.property('name');
                expect(this.req.body).to.have.property('password');
                expect(this.req.body.name).to.be.equal('what');
                expect(this.req.body.amount).to.be.equal(115);
                done();
            };

            let mapping = [ 'name', 'password'];

            let realMiddleware = Middleware.validateRequest(mapping, false);
            realMiddleware(this.req, this.res, next);
        });
    });
    describe('#Middleware.validateAmount: Validate Amount Tests', function(){
        beforeEach(function(){
            this.req = http_mock.createRequest({
                body:{
                }
            });
            this.res = http_mock.createResponse({eventEmitter:emitter});
        });
        it('#Middleware.validateAmount: should fail', function(done){
            let next = sinon.spy();
            this.req.body.amount = -2000;
            this.res.on('end', function(){
                try{
                    let response = JSON.parse(this._getData());

                    expect(this.statusCode).to.be.equal(400);
                    expect(response.err).to.be.an('object');
                    expect(response.success).to.be.false;
                    expect(response.err.message).to.be.equal('Amount must be greater than 0');
                    expect(next.called).to.to.be.false;
                    done();
                }
                catch(err){
                    done(err);
                }
            });

            Middleware.validateAmount(this.req, this.res, next);
        });
        it('#Middleware.validateAmount: should succeced', function(done){
            let next = () => {
                done();
            };
            this.req.body.amount = 10;

            Middleware.validateAmount(this.req, this.res, next);
        });
    });
});
