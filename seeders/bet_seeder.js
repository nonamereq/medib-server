const Bet = require('../lib/models/bet');
const Event = require('../lib/models/event');
const User = require('../lib/models/user');

Event.findOne({team1_name: 'team13'}, 'team1_name team2_name team2_odd team1_odd', (err, doc) => {
    if(err == null && doc){
        User.findOne({name: 'mock'}, (user_err, user_doc) => {
            if(user_err == null && user_doc){
                (new Bet({
                    event_id: doc['_id'],
                    user_id: user_doc['_id'],
                    team_name: doc.team2_name,
                    team_odd: doc.team2_odd,
                    bet_amount: 200
                })).save((err) => {if(err) console.log(err.name, err.message); });
            }
        });
        User.findOne({name: 'mock2'}, (user_err, user_doc) => {
            if(user_err == null && user_doc){
                (new Bet({
                    event_id: doc['_id'],
                    user_id: user_doc['_id'],
                    team_name: doc.team1_name,
                    team_odd: doc.team1_odd,
                    bet_amount: 200
                })).save((err) => {if(err) console.log(err.name, err.message); });
            }
        });
    }
});

Event.findOne({team1_name: 'team112'}, 'team1_name team2_name team2_odd team1_odd', (err, doc) => {
    if(err == null && doc){
        User.findOne({name: 'mock'}, (user_err, user_doc) => {
            if(user_err == null && user_doc){
                (new Bet({
                    event_id: doc['_id'],
                    team_name: doc.team2_name,
                    team_odd: doc.team2_odd,
                    user_id: user_doc['_id'],
                    bet_amount: 200
                })).save((err) => {if(err) console.log(err.name, err.message); });
            }
        });
        User.findOne({name: 'mock1'}, (user_err, user_doc) => {
            if(user_err == null && user_doc){
                (new Bet({
                    event_id: doc['_id'],
                    user_id: user_doc['_id'],
                    team_name: doc.team1_name,
                    team_odd: doc.team1_odd,
                    bet_amount: 200
                })).save((err) => {if(err) console.log(err.name, err.message); });
            }
        });
    }
});
