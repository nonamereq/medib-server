const express = require('express');

const BetController = require('../controllers/BetController');
const Auth = require('../auth/user');
const Middleware = require('./middlewares');

let router = express.Router();

router.get('/index', (req, res) => {
    BetController.index(req.query.after, req.query.limit, (obj) => {
        if(req.user && obj.success){
            // res.set('user', Auth.generateToken(user_doc.doc)); //set the header
            obj.token = Auth.generateToken(req.user);
        }
        res.status(obj.status).json(obj);
    });
});

router.get('/view', (req, res) => {
    BetController.viewEvent(req.query.id, (event_doc) => {
        if(req.user && event_doc.success){
            // res.set('user', Auth.generateToken(user_doc.doc)); //set the header
            event_doc.token = Auth.generateToken(req.user);
        }
        res.status(200).json(event_doc);
    });
});
//make event_id id
router.post('/bet', [Auth.loginRequired, Middleware.validateRequest(['id', 'which_team', 'amount']), Middleware.validateAmount], (req, res) => {
    req.body.event_id = req.body.id;
    let user = new BetController(req.user);
    user.betOn(req.body.event_id, req.body.which_team, req.body.amount, (doc) => {
        if(req.user && doc.success){
            // res.set('user', Auth.generateToken(user_doc.doc)); //set the header
            doc.token = Auth.generateToken(req.user);
        }
        res.status(200).json(doc);
    });
});

router.post('/cashout', [Auth.loginRequired, Middleware.validateRequest(['amount']), Middleware.validateAmount], (req, res) => {
    let user = new BetController(req.user);
    user.cashOut(req.body.amount, (doc) => {
        if(req.user && doc.success){
            // res.set('user', Auth.generateToken(user_doc.doc)); //set the header
            doc.token = Auth.generateToken(req.user);
        }
        res.status(200).json(doc);
    });
});

router.post('/updateBalance', [Auth.loginRequired, Middleware.validateRequest(['amount']), Middleware.validateAmount], (req, res) => {
    let user = new BetController(req.user);
    user.addAmount(req.body.amount, (doc) => {
        if(req.user && doc.success){
            // res.set('user', Auth.generateToken(user_doc.doc)); //set the header
            doc.token = Auth.generateToken(req.user);
        }
        res.status(200).json(doc);
    });
});

module.exports = router;
