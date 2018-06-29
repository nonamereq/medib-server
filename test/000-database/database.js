/* globals describe, it, after, before */
const mongoose = require('mongoose');
const expect = require('chai').expect;
const sinon = require('sinon');

const Event = require('../../lib/models/event');
const Bet   = require('../../lib/models/bet');

const common = require('../../lib/common');

let User;

//Complete path testing

describe('All database tests', function(){
    before(function(done){
        if(mongoose.connection.readyState == 0 || mongoose.connection.readyState == 3){
            let url = 'mongodb://localhost/mocha_test_db';
            mongoose.connect(url, (err) => {
                if(err){
                    done(err);
                }
                else{
                    done();
                }
            });
        }
    });

    after(function(done){
        mongoose.connection.dropDatabase((err) => {
            mongoose.connection.close();
            done();
        });
    });

    describe('Database crud operations', function(){
        before(function(done){
            User = mongoose.model('xUser', new mongoose.Schema({
                name: {
                    type: String,
                    required: true,
                    unique: true
                },
                password: {
                    type: String,
                    required: true,
                },
                email: {
                    type: String,
                    required: true,
                    unique: true
                },
                amount: {
                    type: Number,
                    required: true,
                    default: 0
                },
            }));
            done();
        });

        describe('#connection', function(){
            it('should return true which means it is  connected to database', function(done){
                let connection = mongoose.connection;
                expect(connection.readyState).to.equal(1);
                done();
            });
        });

        describe('#database.save: Saving a User', function(){
            it('Saves a user to a database', function(done){
                let user = new User({
                    name: 'mocha_test',
                    password: 'mocha_test_password',
                    email: 'mocha_test@mocha.com',
                });
                user.save((err) => {
                    if(err == null){
                        expect(user.isNew).to.equal(false);
                        done();
                    }
                    else{
                        done(err);
                    }
                });
            });

            it('Saves a user already in database', function(done){
                let user = new User({
                    name: 'mocha_test',
                    password: 'mocha_test_pass',
                    email: 'mocha_test@mocha.org',
                });
                user.save((err) => {
                    if(err){
                        expect(err.code).to.equal(11000);
                    }
                    done();
                });
            });
        });

        describe('#database.find: Finding a User', function(){
            it('finds a user', function(done){
                User.findOne({name: 'mocha_test'}, (err, doc) => {
                    expect(doc.amount).to.equal(0);
                    done();
                });
            });

            it('doesn\'t find a user', function(done){
                User.findOne({name:'a'}, (err, doc) => {
                    expect(doc).to.equal(null);
                    done();
                });
            });

            it('finds a user using $or operator', function(done){
                let user2 = new User({
                    name: 'mocha_test2',
                    password: 'mocha_test_password',
                    email: 'mocha_test2@mocha.com',
                    amount: 500
                });
                user2.save((err) => {
                    if(err == null)
                        User.find({ $or: [ {name: 'mocha_test2'}, {amount: 0} ] }, (err, docs) => {
                            if(err == null && docs){
                                expect(docs.length).to.equal(2);
                                done();
                            }
                        });
                });
            });
        });

        describe('#database.update: Updating a User',  function(){
            it('Updates a user amount', function(done){
                User.updateOne({name: 'mocha_test'}, { amount: 500}, (err, raw) => {
                    if(raw != null){
                        User.findOne({name: 'mocha_test'}, 'amount', (err, doc) => {
                            if(err == null && doc != null){
                                expect(doc.amount).to.equal(500);
                                done();
                            }
                        });
                    }
                });
            });
            it('Updates a user amount by using increment', function(done){
                User.updateOne({name: 'mocha_test'}, { $inc: { amount: 500 }}, (err, raw) => {
                    if(raw != null){
                        User.findOne({name: 'mocha_test'}, 'amount', (err, doc) => {
                            if(err == null && doc != null){
                                expect(doc.amount).to.equal(1000);
                                done();
                            }
                        });
                    }
                });
            });

            it('Updates two documents', function(done){
                User.update({ $or: [ {name: 'mocha_test2'}, {amount: 1000} ] }, {$inc: {amount: 100}}, { multi: true }, (err, docs) => {
                    if(err == null && docs){
                        expect(docs.nModified).to.equal(2);
                        done();
                    }
                });
            });
        });
    });

    describe('Model test cases', function(){
        before(function(done){
            User = require('../../lib/models/user');
            done();
        });
        describe('#mongooseModels tests', function(){
            describe('#User model tests', function(){
                describe('#User validator tests', function(){
                    it('#User.validators: should return a required validation error', function(done){
                        let u = new User();
                        u.save((err) => {
                            expect(err.name).to.equal('ValidationError');
                            expect(err.errors).to.have.property('email');
                            expect(err.errors).to.have.property('name');
                            expect(err.errors).to.have.property('password');
                            expect(err.errors.name.message).to.equal('User name must not be empty');
                            done();
                        });
                    });

                    it('#User.validators: should return an invalid email error', function(done){
                        let u = new User({
                            name: 'mocka_test',
                            email: 'm$%@@.com',
                            password: 'password',
                        });
                        u.save((err) => {
                            expect(err.errors.email.message).to.equal('Invalid email');
                            done();
                        });
                    });
                    it('#User.validators: should return user name must be greater than 4 characters', function(done) {
                        let u = new User({
                            name: 'moc',
                            password: 'password',
                        });
                        u.save((err) => {
                            expect(err.errors.name.message).to.equal('User name must be greater than or equal to 4 characters');
                            done();
                        });
                    });
                    it('#User.validators: should return user name must be alphanumeric characters', function(done) {
                        let u = new User({
                            name: 'moc$Aadaf',
                            password: 'password',
                        });
                        u.save((err) => {
                            expect(err.errors.name.message).to.equal('User name must only include alphanumeric characters');
                            done();
                        });
                    });
                    it('#User.validators: should return password must be greater than 6 characters', function(done) {
                        let u = new User({
                            name: 'moc',
                            password: 'pass',
                        });
                        u.save((err) => {
                            expect(err.errors.password.message).to.equal('Password must be greater than or equal to 6 characters');
                            done();
                        });
                    });
                    it('#User.validators: should return amount must be greater than 0', function(done) {
                        let u = new User({
                            amount: -100
                        });
                        u.save((err) => {
                            expect(err.errors.amount.message).to.equal('Amount must be greater than or equal to 0');
                            done();
                        });
                    });
                });

                describe('#User.pre("save"): should save', function(){
                    before(() => {
                        sinon.stub(common, 'hashValue').withArgs('password').returns('password2');
                    });
                    after(() => {
                        common.hashValue.restore();
                    });
                    it('#User.pre("save"): should save', function(done){
                        let u = new User({
                            name: 'mock_test',
                            email: 'mock@m.com',
                            password: 'password'
                        });

                        u.save((err, doc) => {
                            expect(doc.password).to.equal('password2');
                            done();
                        });
                    });
                });

                describe('#User.comparePassword: test', function(){
                    before(function(){
                        let stub = sinon.stub(common, 'hashValue');
                        stub.withArgs('password').returns('password2');
                        stub.withArgs('123456').returns('124');
                    });
                    after(function(){
                        common.hashValue.restore();
                    });
                    it('#User.comparePassword: test', function(){
                        let user = new User({
                            password: 'password2'
                        });

                        expect(user.comparePassword('password')).to.be.true;
                        expect(user.comparePassword('123456')).to.be.false;
                    });
                });

            });

            describe('#Event model tests', function() {
                describe('#Event.validator test', function(){
                    it('#Event.validator: should not save the event', function(done){
                        let event_obj = new Event({
                            team1_name: 'team1',
                            team2_name: 'team2',
                            team1_odd: 1.5,
                            team2_odd: 2,
                            closingTime: Date.now()
                        });
                        event_obj.save((err) => {
                            expect(err.errors.closingTime.message).to.equal('The event time must be greater than the current time + 5 minutes');
                            done();
                        });
                    });
                });
            });

            describe('#Bet model tests',function(){
                it('#Bet: validator should fail', function(done){
                    let bet = new Bet({});
                    bet.save((err) => {
                        expect(err.name).to.equal('ValidationError');
                        expect(err.errors).to.have.property('event_id');
                        expect(err.errors).to.have.property('team_name');
                        expect(err.errors).to.have.property('user_id');
                        expect(err.errors).to.have.property('bet_amount');
                        expect(err.errors.event_id.message).to.equal('You have to choose an event');
                        done();
                    });
                });
                it('#Bet: validator should fail', function(done){
                    let bet = new Bet({
                        bet_amount: -100
                    });
                    bet.save((err) => {
                        expect(err.errors).to.have.property('bet_amount');
                        expect(err.errors.bet_amount.message).to.equal('Bet amount must be greater than 0');
                        done();
                    });
                });
            });
        });
    });
});


