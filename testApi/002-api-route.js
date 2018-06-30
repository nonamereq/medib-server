/* globals describe, it, before, beforeEach, after*/
const expect = require('chai').expect;
const chai = require('chai');
const chaiHttp = require('chai-http');

const sinon  = require('sinon');

const app = require('../app');
const User = require('../lib/models/user');
const Event = require('../lib/models/event');

chai.use(chaiHttp);

let userToken = null;
let adminToken = null;

let saveEvent = (event_doc, callback) => {
    event_doc.save({
        validateBeforeSave: false
    }, callback);
};

describe('#API TESTS', function(){
    let id;
    before(function(){
        sinon.stub(global.console, 'log').returns(0);
        id = null;
    });

    after(function(){
        global.console.log.restore();
    });
    describe('#ApiRouter tests', function(){
        describe('/POST /api/signup Tests', function(){
            beforeEach(function(){
                this.timeout = 10000;
            });

            before(function(done){
                User.remove({}, () => done());
            });

            it('#Should not save: username, password and email empty', function(done){
                let user = {};
                chai.request(app.app)
                    .post('/api/signup')
                    .send(user)
                    .end((res_err, res) => {
                        expect(res).to.have.status(400);
                        expect(res.body).to.be.an('object');
                        expect(res.body.success).to.be.false;
                        expect(res.body.err).to.be.an('object');
                        expect(res.body.err.name.message).to.match(/.*empty.*/);
                        expect(res.body.err.email.message).to.match(/.*empty.*/);
                        done();
                    });
            });

            it('#Should not save: email empty', function(done){
                let user = {
                    name: 'mock',
                    password: 'what',
                };
                chai.request(app.app)
                    .post('/api/signup')
                    .send(user)
                    .end((res_err, res) => {
                        expect(res).to.have.status(400);
                        expect(res.body).to.be.an('object');
                        expect(res.body.success).to.be.false;
                        expect(res.body.err).to.be.an('object');
                        expect(res.body.err.email.message).to.match(/.*empty.*/);
                        done();
                    });
            });

            it('#Should not save: validation failed', function(done){
                let user = {
                    name: 'mock#',
                    password: 'abcdef',
                    email: 'mock@mock.com'
                };
                chai.request(app.app)
                    .post('/api/signup')
                    .send(user)
                    .end((res_err, res) => {
                        expect(res).to.have.status(400);
                        expect(res.body).to.be.an('object');
                        expect(res.body.success).to.be.false;

                        expect(res.body.err).to.be.an('object');
                        expect(res.body.err.name).to.be.equal('ValidationError');

                        expect(res.body.err.errors).to.be.an('object');
                        expect(res.body.err.errors.name.message).to.match(/.*alphanumeric.*/);
                        done();
                    });
            });

            it('#Should save', function(done){
                let user = {
                    name: 'mock',
                    password: 'abcdef',
                    email: 'mock@mock.com'
                };
                chai.request(app.app)
                    .post('/api/signup')
                    .send(user)
                    .end((res_err, res) => {
                        expect(res).to.have.status(200);
                        expect(res.body).to.be.an('object');

                        expect(res.body.success).to.be.true;

                        expect(res.body.err).to.be.undefined;

                        expect(res.body.doc).to.be.an('object');
                        expect(res.body.doc).to.have.property('name');
                        expect(res.body.doc).to.not.have.property('password');
                        expect(res.body.doc).to.not.have.property('email');
                        expect(res.body.doc.name).to.be.equal('mock');
                        done();
                    });
            });

            it('#Should not save: user exists', function(done){
                let user = {
                    name: 'mock',
                    password: 'abcdef',
                    email: 'mock@mock.com'
                };
                chai.request(app.app)
                    .post('/api/signup')
                    .send(user)
                    .end((res_err, res) => {
                        expect(res).to.have.status(400);
                        expect(res.body).to.be.an('object');

                        expect(res.body.success).to.be.false;

                        expect(res.body.err).to.be.an('object');
                        expect(res.body.err.message).to.be.match(/.*exists.*/);

                        expect(res.body.doc).to.be.undefined;

                        done();
                    });
            });

            it('#Should not save: email the same', function(done){
                let user = {
                    name: 'mock1',
                    password: 'abcdef',
                    email: 'mock@mock.com'
                };
                chai.request(app.app)
                    .post('/api/signup')
                    .send(user)
                    .end((res_err, res) => {
                        expect(res).to.have.status(400);
                        expect(res.body).to.be.an('object');

                        expect(res.body.success).to.be.false;

                        expect(res.body.err).to.be.an('object');

                        expect(res.body.doc).to.be.undefined;

                        done();
                    });
            });
        });

        describe('/POST /api/login Tests', function(){
            it('#Should fail: empty username and password', function(done){
                let user = {};
                chai.request(app.app)
                    .post('/api/login')
                    .send(user)
                    .end((err, res) => {
                        expect(res.body).to.be.an('object');
                        expect(res).to.have.status(400);

                        expect(res.body.success).to.be.false;

                        expect(res.body.err).to.be.an('object');
                        expect(res.body.err.name.message).to.match(/.*empty.*/);
                        done();
                    });
            });

            it('#Should fail: empty password', function(done){
                let user = {
                    name: 'mock'
                };
                chai.request(app.app)
                    .post('/api/login')
                    .send(user)
                    .end((err, res) => {
                        expect(res.body).to.be.an('object');
                        expect(res).to.have.status(400);

                        expect(res.body.success).to.be.false;

                        expect(res.body.err).to.be.an('object');
                        expect(res.body.err.password.message).to.match(/.*empty.*/);
                        done();
                    });
            });

            it('#Should fail: incorrect username or password', function(done) {
                let user = {
                    name: 'mock',
                    password: '123456'
                };
                chai.request(app.app)
                    .post('/api/login')
                    .send(user)
                    .end((err, res) => {
                        expect(res.body).to.be.an('object');
                        expect(res).to.have.status(200);

                        expect(res.body.success).to.be.false;

                        expect(res.body.err).to.be.an('object');
                        expect(res.body.err.message).to.match(/.*incorrect.*/);
                        done();
                    });
            });

            it('#Should login', function(done){
                let user = {
                    name: 'mock',
                    password: 'abcdef'
                };
                chai.request(app.app)
                    .post('/api/login')
                    .send(user)
                    .end((err, res) => {
                        expect(res.body).to.be.an('object');
                        expect(res).to.have.status(200);

                        expect(res.body.success).to.be.true;

                        expect(res.body.err).to.be.undefined;

                        expect(res.body.doc).to.be.an('object');
                        expect(res.body.doc).to.have.property('name');
                        expect(res.body.doc).to.not.have.property('password');
                        expect(res.body.doc).to.not.have.property('email');
                        expect(res.body.doc.name).to.equal('mock');

                        //should have 3 dots
                        expect(res.body.token).to.match(/.*\..*\..*/);

                        userToken = res.body.token;
                        done();
                    });
            });
        });
    });

    describe('#AdminRouter tests', function(){
        before(function(done){
            Event.remove({}, () => done());
        });
        describe('/POST /admin/signup Tests', function(){
            it('#Should signup an admin and login', function(done){
                let user = {
                    name: 'admin',
                    password: '123456',
                    email: 'admin@admin.com'
                };
                chai.request(app.app)
                    .post('/admin/signup')
                    .send(user)
                    .end((res_err, res) => {
                        expect(res).to.have.status(200);
                        expect(res.body).to.be.an('object');

                        expect(res.body.success).to.be.true;

                        expect(res.body.err).to.be.undefined;

                        expect(res.body.doc).to.be.an('object');
                        expect(res.body.doc).to.have.property('name');
                        expect(res.body.doc).to.not.have.property('password');
                        expect(res.body.doc).to.not.have.property('email');
                        expect(res.body.doc.name).to.be.equal('admin');
                        expect(res.body.doc.isAdmin).to.be.true;

                        delete user.email;
                        chai.request(app.app)
                            .post('/api/login')
                            .send(user)
                            .end((err, res) => {
                                expect(res.body).to.be.an('object');
                                expect(res).to.have.status(200);

                                expect(res.body.success).to.be.true;

                                expect(res.body.err).to.be.undefined;

                                expect(res.body.doc).to.be.an('object');
                                expect(res.body.doc).to.have.property('name');
                                expect(res.body.doc).to.not.have.property('password');
                                expect(res.body.doc).to.not.have.property('email');
                                expect(res.body.doc.name).to.equal('admin');
                                expect(res.body.doc.isAdmin).to.be.true;

                                //should have 3 dots
                                expect(res.body.token).to.match(/.*\..*\..*/);

                                adminToken = res.body.token;
                                done();
                            });
                    });
            });
        });
        describe('These require tokens', function(){
            before(function(done){
                this.timeout(1000);
                setTimeout(()=>{
                    if(adminToken == null)
                        this.skip();
                    done();
                }, 800);
            });

            describe('/POST /admin/postEvent Tests', function(){
                it('#Should fail: you should be logged in', function(done){
                    let event_doc = { };

                    chai.request(app.app)
                        .post('/admin/postEvent')
                        .send(event_doc)
                        .end((res_err, res) => {
                            expect(res).to.have.status(401);
                            expect(res.body).to.be.an('object');

                            expect(res.body.success).to.be.false;

                            expect(res.body.err).to.be.an('object');
                            expect(res.body.err.message).to.match(/.*logged.*/);

                            done();
                        });
                });

                it('#Should fail: no team1_name, team2_name ... etc', function(done){
                    let event_doc = {
                        token: adminToken
                    };

                    chai.request(app.app)
                        .post('/admin/postEvent')
                        .send(event_doc)
                        .end((res_err, res) => {
                            expect(res).to.have.status(400);
                            expect(res.body).to.be.an('object');

                            expect(res.body.success).to.be.false;

                            expect(res.body.err).to.be.an('object');
                            expect(res.body.err.team1_name.message).to.match(/.*empty.*/);
                            expect(res.body.err.team2_name.message).to.match(/.*empty.*/);

                            done();
                        });
                });

                it('#Should fail: no team1_name', function(done){
                    let event_doc = {
                        token: adminToken,
                        team2_name: 'manchester',
                        team1_odd: '1.2',
                        team2_odd: '2.2',
                        date: Date.now() + (7 * 60 * 1000), 
                    };

                    chai.request(app.app)
                        .post('/admin/postEvent')
                        .send(event_doc)
                        .end((res_err, res) => {
                            expect(res).to.have.status(400);
                            expect(res.body).to.be.an('object');

                            expect(res.body.success).to.be.false;

                            expect(res.body.err).to.be.an('object');
                            expect(res.body.err.team1_name.message).to.match(/.*empty.*/);
                            expect(res.body.err.team2_name).to.be.undefined;

                            done();
                        });
                });

                it('#Should fail: time error', function(done){
                    let event_doc = {
                        token: adminToken,
                        team1_name: 'man utd',
                        team2_name: 'manchester',
                        team1_odd: '1.2',
                        team2_odd: '2.2',
                        date: Date.now(),
                    };
                    chai.request(app.app)
                        .post('/admin/postEvent')
                        .send(event_doc)
                        .end((res_err, res) => {
                            expect(res).to.have.status(400);
                            expect(res.body).to.be.an('object');
                            expect(res.body.success).to.be.false;

                            expect(res.body.err).to.be.an('object');
                            expect(res.body.err.name).to.be.equal('ValidationError');

                            expect(res.body.err.errors).to.be.an('object');
                            expect(res.body.err.errors.closingTime.message).to.match(/.*greater.*/);
                            done();
                        });
                });

                it('#Should save', function(done){
                    let date = Date.now() + (24* 60 * 60 * 1000);
                    let event_doc = {
                        token: adminToken,
                        team1_name: 'man utd',
                        team2_name: 'manchester',
                        team1_odd: '1.2',
                        team2_odd: '2.2',
                        date: date
                    };
                    chai.request(app.app)
                        .post('/admin/postEvent')
                        .send(event_doc)
                        .end((res_err, res) => {
                            expect(res).to.have.status(200);
                            expect(res.body).to.be.an('object');
                            expect(res.body.success).to.be.true;

                            expect(res.body.err).to.be.undefined;

                            expect(res.body.doc).to.be.an('object');
                            expect(res.body.doc.team1_name).to.be.equal('man utd');
                            expect(res.body.doc.team2_odd).to.be.equal(2.2);
                            expect(res.body.doc.closingTime).to.be.equal(date - ( 5 * 60 * 1000));
                            id = res.body.doc._id;
                            done();
                        });
                });
            });

            describe('/POST /admin/editEvent Tests', function(){
                before(function(done){
                    this.timeout(1001);
                    setTimeout(done, 800);
                });

                it('#Should fail: you should be logged in', function(done){
                    let event_doc = { };

                    chai.request(app.app)
                        .post('/admin/editEvent')
                        .send(event_doc)
                        .end((res_err, res) => {
                            expect(res).to.have.status(401);
                            expect(res.body).to.be.an('object');

                            expect(res.body.success).to.be.false;

                            expect(res.body.err).to.be.an('object');
                            expect(res.body.err.message).to.match(/.*logged.*/);

                            done();
                        });
                });

                it('#Should fail: no id', function(done){
                    let event_doc ={
                        token: adminToken,
                        team1_odd: 1.2,
                        team2_odd: 2,
                        date: Date.now() + (7*60*1000*1000)
                    };

                    chai.request(app.app)
                        .post('/admin/editEvent')
                        .send(event_doc)
                        .end((res_err, res) => {
                            expect(res).to.have.status(400);
                            expect(res.body).to.be.an('object');

                            expect(res.body.success).to.be.false;

                            expect(res.body.err).to.be.an('object');
                            expect(res.body.err.id.message).to.match(/.*empty.*/);

                            done();
                        });
                });

                it('#Should fail: invalid id', function(done){
                    let event_doc ={
                        token: adminToken,
                        id: 'abcdef',
                        team1_odd: 1.2,
                        team2_odd: 2,
                        date: Date.now() + (7*60*1000*1000)
                    };

                    chai.request(app.app)
                        .post('/admin/editEvent')
                        .send(event_doc)
                        .end((res_err, res) => {
                            expect(res).to.have.status(400);
                            expect(res.body).to.be.an('object');

                            expect(res.body.success).to.be.false;

                            expect(res.body.err).to.be.an('object');
                            expect(res.body.err.name).to.equal('CastError');
                            expect(res.body.err.message).to.match(/.*cast.*/i);

                            done();
                        });
                });

                it('#Should fail: invalid id', function(done){
                    let sub_id = id.substr(0, id.length-1);
                    let counter = 0;
                    let this_id;
                    while((this_id = sub_id + String(counter)) == id) 
                        ++counter;


                    let event_doc ={
                        token: adminToken,
                        id: this_id,
                        team1_odd: 1.2,
                        team2_odd: 2,
                        date: Date.now() + (7*60*1000*1000)
                    };

                    chai.request(app.app)
                        .post('/admin/editEvent')
                        .send(event_doc)
                        .end((res_err, res) => {
                            expect(res).to.have.status(400);
                            expect(res.body).to.be.an('object');

                            expect(res.body.success).to.be.false;

                            expect(res.body.err).to.be.an('object');
                            expect(res.body.err.message).to.match(/.*no such.*/i);

                            done();
                        });
                });

                it('#Should edit', function(done){
                    let event_doc ={
                        token: adminToken,
                        id: id,
                        team1_odd: 1.2,
                        team2_odd: 2,
                        date: Date.now() + (24*60*1000*1000)
                    };

                    chai.request(app.app)
                        .post('/admin/editEvent')
                        .send(event_doc)
                        .end((res_err, res) => {
                            expect(res).to.have.status(200);
                            expect(res.body).to.be.an('object');

                            expect(res.body.success).to.be.true;

                            expect(res.body.doc).to.be.an('object');

                            expect(res.body.err).to.be.undefined;

                            id = res.body.doc._id;
                            done();
                        });
                });
            });

            describe('/POST /admin/assignWinner', function(){
                let event_doc = new Event({
                    team1_name: 'man utd',
                    team2_name: 'manchester',
                    team1_odd: '1.2',
                    team2_odd: '2.2',
                    closingTime: Date.now(),
                });

                before(function(done){
                    console.log('assign winner');
                    saveEvent(event_doc, done);
                });

                it('#Should fail: you should be logged in', function(done){
                    let event_test_doc = { };

                    chai.request(app.app)
                        .post('/admin/assignWinner')
                        .send(event_test_doc)
                        .end((res_err, res) => {
                            expect(res).to.have.status(401);
                            expect(res.body).to.be.an('object');

                            expect(res.body.success).to.be.false;

                            expect(res.body.err).to.be.an('object');
                            expect(res.body.err.message).to.match(/.*logged.*/);

                            done();
                        });
                });

                it('#Should fail: no id', function(done){
                    let event_test_doc ={
                        token: adminToken,
                        which_team: 'man utd'
                    };

                    chai.request(app.app)
                        .post('/admin/assignWinner')
                        .send(event_test_doc)
                        .end((res_err, res) => {
                            expect(res).to.have.status(400);
                            expect(res.body).to.be.an('object');

                            expect(res.body.success).to.be.false;

                            expect(res.body.err).to.be.an('object');
                            expect(res.body.err.id.message).to.match(/.*empty.*/);

                            done();
                        });
                });

                it('#Should fail: invalid id', function(done){
                    let event_test_doc ={
                        token: adminToken,
                        id: 'abcdef',
                        which_team: 'man utd'
                    };

                    chai.request(app.app)
                        .post('/admin/assignWinner')
                        .send(event_test_doc)
                        .end((res_err, res) => {
                            expect(res).to.have.status(400);
                            expect(res.body).to.be.an('object');

                            expect(res.body.success).to.be.false;

                            expect(res.body.err).to.be.an('object');
                            expect(res.body.err.name).to.equal('CastError');
                            expect(res.body.err.message).to.match(/.*cast.*/i);

                            done();
                        });
                });

                it('#Should fail: no such event', function(done){
                    let ev_id = String(event_doc['_id']);
                    let sub_id = ev_id.substr(0, id.length-1);
                    let counter = 0;
                    let this_id;
                    while((this_id = sub_id + String(counter)) == ev_id) 
                        ++counter;


                    let event_test_doc ={
                        token: adminToken,
                        id: this_id,
                        which_team: 'man utd'
                    };

                    chai.request(app.app)
                        .post('/admin/assignWinner')
                        .send(event_test_doc)
                        .end((res_err, res) => {
                            expect(res).to.have.status(400);
                            expect(res.body).to.be.an('object');

                            expect(res.body.success).to.be.false;

                            expect(res.body.err).to.be.an('object');
                            expect(res.body.err.message).to.match(/.*no such.*/i);

                            done();
                        });
                });

                it('#Should assign winner', function(done){
                    let event_test_doc ={
                        token: adminToken,
                        id: event_doc['_id'],
                        which_team: 'man utd'
                    };

                    chai.request(app.app)
                        .post('/admin/assignWinner')
                        .send(event_test_doc)
                        .end((res_err, res) => {
                            expect(res).to.have.status(200);
                            expect(res.body).to.be.an('object');

                            expect(res.body.success).to.be.true;

                            expect(res.body.doc).to.be.an('object');

                            expect(res.body.err).to.be.undefined;
                            done();
                        });
                });
            });
        });

        describe('/POST /admin/finishedEvent Tests', function(){

            it('#Should return one events(from assignWinner)', function(done){
                chai.request(app.app)
                    .get('/admin/finishedEvents')
                    .end((res_err, res) => {
                        expect(res).to.have.status(200);
                        expect(res.body).to.be.an('object');
                        expect(res.body.success).to.be.true;

                        expect(res.body.err).to.be.undefined;

                        expect(res.body.doc).to.be.an('array');
                        expect(res.body.doc).to.have.lengthOf(1);
                        done();
                    });
            });

            describe('save before getting', function(){
                beforeEach(function(done){
                    let event_doc = new Event({
                        team1_name: 'man utd',
                        team2_name: 'manchester',
                        team1_odd: '1.2',
                        team2_odd: '2.2',
                        closingTime: Date.now(),
                    });
                    saveEvent(event_doc, done);
                });
                it('#Should return two events', function(done){
                    chai.request(app.app)
                        .get('/admin/finishedEvents')
                        .end((res_err, res) => {
                            expect(res).to.have.status(200);
                            expect(res.body).to.be.an('object');
                            expect(res.body.success).to.be.true;

                            expect(res.body.err).to.be.undefined;

                            expect(res.body.doc).to.be.an('array');
                            expect(res.body.doc).to.have.lengthOf(2);
                            done();
                        });
                });

                it('#Should return three events', function(done){
                    chai.request(app.app)
                        .get('/admin/finishedEvents')
                        .end((res_err, res) => {
                            expect(res).to.have.status(200);
                            expect(res.body).to.be.an('object');
                            expect(res.body.success).to.be.true;

                            expect(res.body.err).to.be.undefined;

                            expect(res.body.doc).to.be.an('array');
                            expect(res.body.doc).to.have.lengthOf(3);
                            done();
                        });
                });
            });
        });
    });

    describe('#UserRouter tests', function(){
        describe('#Userinfo tests', function(){
            it('#Should fail: you should be logged in', function(done){
                let user_doc = { };

                chai.request(app.app)
                    .post('/user/userinfo')
                    .send(user_doc)
                    .end((res_err, res) => {
                        expect(res).to.have.status(401);
                        expect(res.body).to.be.an('object');

                        expect(res.body.success).to.be.false;

                        expect(res.body.err).to.be.an('object');
                        expect(res.body.err.message).to.match(/.*logged.*/);

                        done();
                    });
            });

            it('#Should fail: invalid token', function(done){
                let user_doc = {
                    token: 'abcdef'
                };

                chai.request(app.app)
                    .post('/user/userinfo')
                    .send(user_doc)
                    .end((res_err, res) => {
                        expect(res).to.have.status(401);
                        expect(res.body).to.be.an('object');

                        expect(res.body.success).to.be.false;

                        expect(res.body.err).to.be.an('object');
                        expect(res.body.err.message).to.match(/.*logged.*/);

                        done();
                    });
            });

            it('#Should return user info',function(done){
                let user_doc = {
                    token: userToken
                };

                chai.request(app.app)
                    .post('/user/userinfo')
                    .send(user_doc)
                    .end((res_err, res) => {
                        expect(res).to.have.status(200);
                        expect(res.body).to.be.an('object');

                        expect(res.body.success).to.be.true;

                        expect(res.body.err).to.be.undefined;

                        expect(res.body.doc).to.be.an('object');
                        expect(res.body.doc.name).to.be.equal('mock');
                        expect(res.body.doc.password).to.be.undefined;
                        expect(res.body.doc.isAdmin).to.be.false;

                        done();
                    });
            });

            it('#Should return user info',function(done){
                let user_doc = {
                    token: adminToken
                };

                chai.request(app.app)
                    .post('/user/userinfo')
                    .send(user_doc)
                    .end((res_err, res) => {
                        expect(res).to.have.status(200);
                        expect(res.body).to.be.an('object');

                        expect(res.body.success).to.be.true;

                        expect(res.body.err).to.be.undefined;

                        expect(res.body.doc).to.be.an('object');
                        expect(res.body.doc.name).to.be.equal('admin');
                        expect(res.body.doc.password).to.be.undefined;
                        expect(res.body.doc.isAdmin).to.be.true;

                        done();
                    });
            });
        });

        describe('#updateBalance tests', function(){
            it('#Should fail: you should be logged in', function(done){
                let user_doc = { };

                chai.request(app.app)
                    .post('/user/updateBalance')
                    .send(user_doc)
                    .end((res_err, res) => {
                        expect(res).to.have.status(401);
                        expect(res.body).to.be.an('object');

                        expect(res.body.success).to.be.false;

                        expect(res.body.err).to.be.an('object');
                        expect(res.body.err.message).to.match(/.*logged.*/);

                        done();
                    });
            });

            it('#Should fail: no amount',function(done){
                let user_doc = {
                    token: userToken
                };

                chai.request(app.app)
                    .post('/user/updateBalance')
                    .send(user_doc)
                    .end((res_err, res) => {
                        expect(res).to.have.status(400);
                        expect(res.body).to.be.an('object');

                        expect(res.body.success).to.be.false;

                        expect(res.body.err).to.be.an('object');
                        expect(res.body.err.amount.message).to.match(/.*empty.*/);

                        expect(res.body.doc).to.be.undefined;
                        done();
                    });
            });

            it('#Should fail: invalid amount', function(done){
                let user_doc = {
                    token: userToken,
                    amount: -1000
                };

                chai.request(app.app)
                    .post('/user/updateBalance')
                    .send(user_doc)
                    .end((res_err, res) => {
                        expect(res).to.have.status(400);
                        expect(res.body).to.be.an('object');

                        expect(res.body.success).to.be.false;

                        expect(res.body.err).to.be.an('object');
                        expect(res.body.err.message).to.match(/.*greater than.*/);

                        expect(res.body.doc).to.be.undefined;
                        done();
                    });
            });

            it('#Should update', function(done){
                let user_doc = {
                    token: userToken,
                    amount: 10000
                };

                chai.request(app.app)
                    .post('/user/updateBalance')
                    .send(user_doc)
                    .end((res_err, res) => {
                        expect(res).to.have.status(200);
                        expect(res.body).to.be.an('object');

                        expect(res.body.success).to.be.true;

                        expect(res.body.err).to.be.undefined;
                        expect(res.body.doc).to.be.undefined;
                        done();
                    });
            });
        });

        describe('#cashOut test', function(){
            it('#Should fail: you should be logged in', function(done){
                let user_doc = { };

                chai.request(app.app)
                    .post('/user/cashout')
                    .send(user_doc)
                    .end((res_err, res) => {
                        expect(res).to.have.status(401);
                        expect(res.body).to.be.an('object');

                        expect(res.body.success).to.be.false;

                        expect(res.body.err).to.be.an('object');
                        expect(res.body.err.message).to.match(/.*logged.*/);

                        done();
                    });
            });

            it('#Should fail: no amount',function(done){
                let user_doc = {
                    token: userToken
                };

                chai.request(app.app)
                    .post('/user/cashout')
                    .send(user_doc)
                    .end((res_err, res) => {
                        expect(res).to.have.status(400);
                        expect(res.body).to.be.an('object');

                        expect(res.body.success).to.be.false;

                        expect(res.body.err).to.be.an('object');
                        expect(res.body.err.amount.message).to.match(/.*empty.*/);

                        expect(res.body.doc).to.be.undefined;
                        done();
                    });
            });

            it('#Should fail: invalid amount', function(done){
                let user_doc = {
                    token: userToken,
                    amount: -1000
                };

                chai.request(app.app)
                    .post('/user/cashout')
                    .send(user_doc)
                    .end((res_err, res) => {
                        expect(res).to.have.status(400);
                        expect(res.body).to.be.an('object');

                        expect(res.body.success).to.be.false;

                        expect(res.body.err).to.be.an('object');
                        expect(res.body.err.message).to.match(/.*greater than.*/);

                        expect(res.body.doc).to.be.undefined;
                        done();
                    });
            });

            it('#Should fail: insufficent amount', function(done){
                let user_doc = {
                    token: userToken,
                    amount: 10000000
                };

                chai.request(app.app)
                    .post('/user/cashout')
                    .send(user_doc)
                    .end((res_err, res) => {
                        expect(res).to.have.status(400);
                        expect(res.body).to.be.an('object');

                        expect(res.body.success).to.be.false;

                        expect(res.body.err).to.be.an('object');
                        expect(res.body.err.message).to.match(/.*sufficent.*/);

                        expect(res.body.doc).to.be.undefined;
                        done();
                    });
            });

            it('#Should cashout', function(done){
                let user_doc = {
                    token: userToken,
                    amount: 9000
                };

                chai.request(app.app)
                    .post('/user/cashout')
                    .send(user_doc)
                    .end((res_err, res) => {
                        expect(res).to.have.status(200);
                        expect(res.body).to.be.an('object');

                        expect(res.body.success).to.be.true;

                        expect(res.body.err).to.be.undefined;
                        expect(res.body.doc).to.be.undefined;
                        done();
                    });
            });
        });

        describe('#bet test', function(){
            it('#Should fail: you should be logged in', function(done){
                let user_doc = { };

                chai.request(app.app)
                    .post('/user/bet')
                    .send(user_doc)
                    .end((res_err, res) => {
                        expect(res).to.have.status(401);
                        expect(res.body).to.be.an('object');

                        expect(res.body.success).to.be.false;

                        expect(res.body.err).to.be.an('object');
                        expect(res.body.err.message).to.match(/.*logged.*/);

                        done();
                    });
            });

            it('#Should fail: no amount, id, team_name',function(done){
                let user_doc = {
                    token: userToken
                };

                chai.request(app.app)
                    .post('/user/bet')
                    .send(user_doc)
                    .end((res_err, res) => {
                        expect(res).to.have.status(400);
                        expect(res.body).to.be.an('object');

                        expect(res.body.success).to.be.false;

                        expect(res.body.err).to.be.an('object');
                        expect(res.body.err.amount.message).to.match(/.*empty.*/);
                        expect(res.body.err.team_name.message).to.match(/.*empty.*/);
                        expect(res.body.err.id.message).to.match(/.*empty.*/);

                        expect(res.body.doc).to.be.undefined;
                        done();
                    });
            });

            it('#Should fail: no amount', function(done){
                let user_doc = {
                    token: userToken,
                    id: 'abcdef',
                    team_name: 'man utd'
                };

                chai.request(app.app)
                    .post('/user/bet')
                    .send(user_doc)
                    .end((res_err, res) => {
                        expect(res).to.have.status(400);
                        expect(res.body).to.be.an('object');

                        expect(res.body.success).to.be.false;

                        expect(res.body.err).to.be.an('object');

                        expect(res.body.doc).to.be.undefined;
                        done();
                    });
            });

            it('#Should fail: insufficent amount', function(done){
                let user_doc = {
                    token: userToken,
                    amount: 10000000,
                    id: id,
                    team_name: 'man utd'
                };

                chai.request(app.app)
                    .post('/user/bet')
                    .send(user_doc)
                    .end((res_err, res) => {
                        expect(res).to.have.status(400);
                        expect(res.body).to.be.an('object');

                        expect(res.body.success).to.be.false;

                        expect(res.body.err).to.be.an('object');
                        expect(res.body.err.message).to.match(/.*sufficent.*/);

                        expect(res.body.doc).to.be.undefined;
                        done();
                    });
            });

            it('#Should fail: insufficent amount', function(done){
                let user_doc = {
                    token: userToken,
                    amount: 10000000,
                    id: id,
                    team_name: 'man utd'
                };

                chai.request(app.app)
                    .post('/user/bet')
                    .send(user_doc)
                    .end((res_err, res) => {
                        expect(res).to.have.status(400);
                        expect(res.body).to.be.an('object');

                        expect(res.body.success).to.be.false;

                        expect(res.body.err).to.be.an('object');
                        expect(res.body.err.message).to.match(/.*sufficent.*/);

                        expect(res.body.doc).to.be.undefined;
                        done();
                    });
            });

            it('#Should bet', function(done){
                let user_doc = {
                    token: userToken,
                    amount: 100,
                    id: id,
                    team_name: 'man utd'
                };

                chai.request(app.app)
                    .post('/user/bet')
                    .send(user_doc)
                    .end((res_err, res) => {
                        expect(res).to.have.status(200);
                        expect(res.body).to.be.an('object');

                        expect(res.body.err).to.be.undefined;
                        expect(res.body.doc).to.be.an('object');
                        expect(res.body.doc.bet_amount).to.be.equal(100);
                        expect(res.body.doc.event_id).to.be.equal(id);
                        done();
                    });
            });
        });
    });
});
