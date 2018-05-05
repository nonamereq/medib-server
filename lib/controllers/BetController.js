const Bet = require('../models/bet');
const Event = require('../models/event');

const PAGE_LIMIT_DEFAULT = 25;

class BetController{
    constructor(user){
        this.user = user;
    }

    hasSufficentAmount(amount){
        return this.user.amount > amount;
    }

    viewEvent(event_id, viewCallback){
        Event.fullEvent(event_id, viewCallback);
    }

    betOn(event_id, which_team, amount, betCallback){
        if(this.hasSufficentAmount(amount)){
            Event.findById(event_id, (err, event_doc) => {
                if(err){
                    betCallback({
                        success: false,
                        err: err
                    });
                }
                else{
                    let bet = new Bet({
                        event_id: event_doc.id,
                        user_id: this.user.id,
                        bet_amount: amount,
                    });

                    if(which_team == 1){
                        bet.team_id = event_doc.team1_id;
                        bet.team_odd = event_doc.team1_odd;
                    }
                    else if(which_team == 2){
                        bet.team_id = event_doc.team2_id;
                        bet.team_odd = event_doc.team2_odd;
                    }
                    else{
                        betCallback({
                            success: false,
                            err: {'team': 'Unknown team specified'}
                        });
                    }

                    bet.save((err, bet) => {
                        if(err){
                            betCallback({
                                success: false,
                                err: err
                            });
                        }
                        else{
                            betCallback({
                                success: true,
                                bet: bet
                            });
                        }
                    });
                }
            });
        }
        betCallback({
            success: false,
            err: { 'amount': 'User does not have a sufficent amount' }
        });
    }

    index(after, limit, indexCallback){
        if(!limit){
            limit = PAGE_LIMIT_DEFAULT;
        }
        if(!after){
            after = Infinity;
        }
        Event.find({_id: {$lte: after}}, {limit: limit}, (err, docs) => {
            if(err){
                indexCallback({
                    success: false,
                    err: err
                });
            }
            else{
                indexCallback({
                    success: true,
                    docs: docs
                });
            }
        });
    }
}

module.exports = BetController;
