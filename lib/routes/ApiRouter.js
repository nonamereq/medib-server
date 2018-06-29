const express = require('express');

const UserController = require('../controllers/UserController');
const Middleware = require('./middlewares');
const Auth = require('../auth/user');

let router = express.Router();

let signUpMiddleware = (req, res, next) => {
    UserController.userExists(req.body.name, (obj) => {
        if(obj.success == false){
            delete obj.exists;
        }
        else if(obj.exists){
            obj.err = { message: 'User already exists' };
        }
        else{
            return next();
        }
        res.status(obj.status).json(obj);
    });
};

router.use('/signup', signUpMiddleware); 

router.post('/signup', Middleware.validateRequest(['name', 'password', 'email']), (req, res) => {
    UserController.signup(req.body, (signup_doc) => {
        res.status(200).json(signup_doc);
    });
});

router.post('/login', Middleware.validateRequest(['name', 'password']), (req, res) => {
    let user = new UserController(req.body);
    user.login((user_doc)=>{
        if(user_doc.success){
            user_doc.token = Auth.generateToken(user_doc.doc);
        }
        res.status(user_doc.status).json(user_doc);
    });
});

module.exports = router;

/*//Built in tests
[> globals describe, it, before, after, beforeEach<]
const sinon = require('sinon');
const expect = require('chai').expect;
const http_mock = require('node-mocks-http');
const emitter = require('events').EventEmitter;

describe('#signUpMiddleware: Signup Middleware tests', function(){
    before(function(){
        this.userExistsStub = sinon.stub(UserController, 'userExists');
    });
    after(function(){
        UserController.userExists.restore();
    });
    beforeEach(function(){
        this.req = http_mock.createRequest({
            body: {
                name: 'what'
            }
        });

        this.res = http_mock.createResponse({eventEmitter: emitter});
    });
    it('#signUpMiddleware: should  fail', function(done){
        let next = sinon.spy();
        this.userExistsStub.yields({
            success:false,
            status: 500,
            err: {
                name: 'MongoError',
            }
        });

        this.res.on('end', function(){
            expect(this.statusCode).to.be.equal(500);
            expect(next.called).to.be.false;
            try{
                let response = JSON.parse(this._getData());
                expect(response.success).to.be.false;
                expect(response.err).to.be.an('object');
                expect(response.err.name).to.equal('MongoError');
                expect(response.exists).to.be.undefined;
                done();
            }catch(err){
                done(err);
            }
        });

        signUpMiddleware(this.req, this.res, next);
    });
    it('#signUpMiddleware: should fail(user already exists)', function(done){
        let next = sinon.spy();
        this.userExistsStub.yields({
            success:true,
            status: 200,
            exists: true
        });

        this.res.on('end', function(){
            expect(this.statusCode).to.be.equal(200);
            expect(next.called).to.be.false;
            try{
                let response = JSON.parse(this._getData());
                expect(response.success).to.be.true;
                expect(response.err).to.be.an('object');
                expect(response.err.message).to.equal('User already exists');
                expect(response.exists).to.be.true;
                done();
            }catch(err){
                done(err);
            }
        });

        signUpMiddleware(this.req, this.res, next);
    });
    it('#signUpMiddleware: should call next', function(done){
        let next = () => { done(); };
        this.userExistsStub.yields({
            success:true,
            status: 200,
            exists: false
        });
        signUpMiddleware(this.req, this.res, next);
    });
});*/
