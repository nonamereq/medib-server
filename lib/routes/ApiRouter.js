const express = require('express');

const UserController = require('../controllers/UserController');
const Middleware = require('./middlewares');
const Auth = require('../auth/user');

let router = express.Router();

router.use('/signup', (req, res, next) => {
    UserController.userExists(req.body.name, (obj) => {
        if(obj.success && obj.exists){
            obj.err = { message: 'User already exists' };
        }
        else if(obj.exists == false){
            return next();
        }
        res.status(obj.status).json(obj);
    });
});

//this can be used if we use ajax(xmlhttprequest)
router.get('/userexists', Middleware.xmlHttpRequestOnly, (req, res) => {
    UserController.userExists(req.query.name, (obj) => {
        if(obj.success && obj.exists){
            obj.err = { message: 'User already exists' };
        }

        res.status(obj.status).json(obj);
    });
});

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
