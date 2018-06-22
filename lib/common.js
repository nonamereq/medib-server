const crypto = require('crypto');

/*
 * @description hashs a string value
 * @param string String
 * @return hash String
 */
let hashValue = (string) => {
    let hash = crypto.createHash('sha512');
    hash.update(string);
    return hash.digest('hex');
};

/*
 * @description returns a status code from a given mongoose error
 * @param mongooseErr object
 * @return status int
 */
let getStatusCode = (mongooseErr) => {
    switch(mongooseErr.name){
    case 'CastError':
    case 'ValidatorError':
    case 'ValidationError':
        return 400;
    case 'BulkWriteError':
        if(mongooseErr.code == 11000){
            mongooseErr.message = 'There is already a document with that name';
            return 400;
        }
        else
            return 500;
    case 'MongoError':
        if(mongooseErr.code == 11000){
            mongooseErr.message = 'There is already a document with that name';
            return 400;
        }
        else
            return 500;
    default:
        return 500;
    }
};

let getOnly = (object, mapping) => {
    let required_object = {};
    for(let i in mapping){
        required_object[mapping[i]] = object[mapping[i]];
    }
    return required_object;
};

module.exports = {
    hashValue,
    getStatusCode,
    getOnly
};
