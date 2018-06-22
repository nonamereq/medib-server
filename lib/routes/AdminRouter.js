const express = require('express');

const AdminController = require('../controllers/AdminController');
const UserController = require('../controllers/UserController');
const BetController = require('../controllers/BetController');
const Auth = require('../auth/user');
const Middleware = require('./middlewares');

let router = express.Router();
router.use(['/postEvent', '/editEvent', '/assignWinner'], [Auth.loginRequired, Auth.adminRequired]);

router.use('/signup', (req, res, next) => {
    if(req.ip != '::1' && req.ip != '127.0.0.1'){
        res.status(403).json({
            success: false,
            err: {message: 'You have no business here' }
        });
    }
    next();
});

router.post('/postEvent', Middleware.validateRequest(['team1_name', 'team2_name', 'team1_odd', 'team2_odd', 'date']), (req, res) => {
    AdminController.postEvent(req.body, (obj) => {
        if(req.user && obj.success){
            // res.set('user', Auth.generateToken(user_doc.doc)); //set the header
            obj.token = Auth.generateToken(req.user);
        }
        res.status(obj.status).json(obj);
    });
});

router.post('/signup', Middleware.validateRequest(['name', 'password', 'email']), (req, res) => {
    req.body.isAdmin = true;
    UserController.signup(req.body, (signup_doc) => {
        res.status(200).json(signup_doc);
    });
});

router.post('/editEvent', Middleware.validateRequest(['id', 'team1_odd', 'team2_odd', 'date']), (req, res) => {
    req.body.event_id = req.body.id;
    AdminController.updateEvent(req.body.event_id, req.body, (obj) => {
        if(req.user && obj.success){
            // res.set('user', Auth.generateToken(user_doc.doc)); //set the header
            obj.token = Auth.generateToken(req.user);
        }
        res.status(obj.status).json(obj);
    });
});

router.post('/assignWinner', Middleware.validateRequest(['id', 'which_team']), (req, res) =>{
    AdminController.assignWinner(req.body.id, req.body.which_team, (obj) => {
        if(req.user && obj.success){
            // res.set('user', Auth.generateToken(user_doc.doc)); //set the header
            obj.token = Auth.generateToken(req.user);
        }
        res.status(obj.status).json(obj);
    });
});

router.get('/finishedEvents', (req, res) => {
    BetController.index(req.query.after, req.query.limit, (obj) => {
        if(req.user && obj.success){
            // res.set('user', Auth.generateToken(user_doc.doc)); //set the header
            obj.token = Auth.generateToken(req.user);
        }
        res.status(obj.status).json(obj);
    }, true);
});


module.exports = router;
