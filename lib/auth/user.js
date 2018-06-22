const jwt = require('jsonwebtoken');

const env = require('../../.env');
const User = require('../models/user');
const common = require('../common');

/*
 * @description generates token
 * @param userInfo object
 * @return token String
 */
let generateToken = (userInfo) => {
    //let token = jwt.sign(userInfo , env.auth.secret, { expiresIn: '1h' }); // 1 hour
    let token = jwt.sign(userInfo , env.auth.secret);
    return token;
};

/*
 * @description decodes a token string
 * @param token String
 * @return object
 */
let decodeToken = (token) => {
    let decodedData;
    try{
        decodedData = jwt.verify(token , env.auth.secret);
    }
    catch(err){
        decodedData = {};
    }
    return decodedData;
};

/*
 * @description a middleware for express that requires user to log in
 * @param req express req object
 * @param res express res object
 * @param next function
 * @return none
 */
let loginRequired = (req, res, next) => {
    let token = req.body.token;

    if(token != null && token != ''){
        let user = decodeToken(token);
        User.findById(user['_id'], 'name email amount isAdmin', (err, docs) => {
            if(err){
                let stat = common.getStatusCode(err);
                res.status(stat).json({
                    success: false,
                    status: stat,
                    err: err
                });
            }
            else if(docs == null){
                res.status(401).json({
                    success: false,
                    status: 401,
                    err: { msg: 'User must be logged in' },
                    redirectTo: '/'
                });
            }
            else{
                let user = docs.toObject();
                delete user.password;
                delete user.email;
                req.user = user;
                next();
            }
        });
    }
    else{
        res.status(401).json({
            success: false,
            status: 401,
            err: { message: 'You need to log in' },
            redirectTo: '/'
        });
    }
};

/*
 * @description a middleware for express that requires user to be admin call after loginRequired
 * @param req express req object
 * @param res express res object
 * @param next function
 * @return none
 */
let adminRequired = (req, res, next) => {
    if(req.user.isAdmin)
        next();
    else
        res.status(401).json({
            success: false,
            status: 403,
            err: { message: 'You have to be admin' },
            redirectTo: '/'
        });
};

module.exports = {
    generateToken,
    decodeToken,
    loginRequired,
    adminRequired
};

