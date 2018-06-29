/* globals describe, it */

const expect = require('chai').expect;

const common = require('../lib/common');

describe('#common module testing', function(){
    describe('#common.hashValue tests', function() {
        it('#common.hashValue: should return the correct hashvalue', function() {
            // this value can be found by executing sha512sum
            expect(common.hashValue('software testing is hard')).to.equal('0b671514a3db6d5d35f954cf599e65dcdaaf3bdee5ea08828b85600394e84800bd6c817e269e9706b6d00bece56cf0b5e01476416000f3dedbd0c6f7664868cd');
        });
    });

    describe('#common.getStatusCode tests', function() {
        it('#common.getStatusCode: should return a 500', function() {
            expect(common.getStatusCode({})).to.equal(500);
            expect(common.getStatusCode({
                name: 'MongoError'
            })).to.equal(500);
            expect(common.getStatusCode({
                name: 'BulkWriteError'
            })).to.equal(500);
            expect(common.getStatusCode({
                name: 'jkafjkdakdf'
            })).to.equal(500);
        });

        it('#common.getStatusCode: should modify the objects message', function() {
            let object = {
                name: 'MongoError',
                code: 11000,
                message: 'Duplicate key error',
            };

            expect(common.getStatusCode(object)).to.equal(400);
            expect(object.message).to.equal('There is already a document with that name');

            object = {
                name: 'BulkWriteError',
                code: 11000,
                message: 'Duplicate key error',
            };

            expect(common.getStatusCode(object)).to.equal(400);
            expect(object.message).to.equal('There is already a document with that name');

        });
        it('#common.getStatusCode: should return a 400', function(){
            expect(common.getStatusCode({
                name: 'CastError'
            })).to.equal(400);
            expect(common.getStatusCode({
                name: 'ValidatorError'
            })).to.equal(400);
            expect(common.getStatusCode({
                name: 'ValidationError'
            })).to.equal(400);
        });
    });

    describe('#common.getOnly tests', function() {
        it('#common.getOnly: should return a modified object', function(){
            let object = {
                _id: '51e45f78f',
                name: 'haile',
                email: 'h@medib.com',
                isAdmin: false,
                amount: 10000
            };

            let modifiedObject = common.getOnly(object, ['name', 'email', 'isAdmin']);

            expect(modifiedObject).to.be.a('object');
            expect(modifiedObject).to.not.have.property('amount');
        });
    });
});
