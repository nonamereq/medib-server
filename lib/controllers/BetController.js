const Bet = require('../models/bet');
const Event = require('../models/event');
const User = require('../models/user');
const common = require('../common');

const PAGE_LIMIT_DEFAULT = 7;

class BetController{
    constructor(user){
        this.user = user;
    }

    /*
     * @description Checks if the user has enough amount to bet
     * @param amount Number
     * @return boolean
     */
    hasSufficentAmount(amount){
        return this.user.amount > amount;
    }

    /*
     * @description Gets an event from an event Id
     * @param event_id Object Id
     * @param viewCallback function
     * @return None
     */
    static viewEvent(event_id, viewCallback){
        Event.findById(event_id, 'team1_name team2_name team1_odd team2_odd closingTime', (err, event_doc) => {
            if(err){
                viewCallback({
                    success:false,
                    status: common.getStatusCode(err),
                    err: err
                });
            }
            else if(event_doc == null){
                viewCallback({
                    success: false,
                    status: 200,
                    err: { message: 'No such event' }
                });
            }
            else{
                let after_5_minutes = Date.now() + (5*60*1000);
                if(event_doc.closingTime < after_5_minutes){
                    viewCallback({
                        success: false,
                        status: 200,
                        err: { message: 'No such event' }
                    });
                }
                else{
                    viewCallback({
                        success: true,
                        status: 200,
                        doc: event_doc
                    });
                }
            }
        });
    }

    /*
     * @description Substructs a user's account by the specified amount and returns the user
     * @param amount
     * @param userCallback function
     * return none
     */
    substructAmount(amount, userCallback){
        User.updateOne({ _id: this.user['_id']}, { amount: this.user.amount - amount }, (err) => {
            if(err){
                userCallback({
                    success: false,
                    status: common.getStatusCode(err),
                    err: err
                });
            }
            else
                userCallback({
                    success: true,
                    status: 200
                });
        });
    }

    substructAmountName(amount, userCallback){
        User.updateOne({ name: this.user['name']}, { amount: this.user.amount - amount }, (err) => {
            if(err){
                userCallback({
                    success: false,
                    status: common.getStatusCode(err),
                    err: err
                });
            }
            else{
                userCallback({
                    success: true,
                    status: 200
                });
            }
        });
    }

    /*
     * @description Adds a user's account by the specified amount and returns the user
     * @param amount
     * @param userCallback function
     * return none
     */
    addAmount(amount, userCallback){
        User.updateOne({_id: this.user['_id']}, { $inc: { amount: Number(amount)}} , (err) => {
            if(err){
                userCallback({
                    success: false,
                    status: common.getStatusCode(err),
                    err: err
                });
            }
            else
                userCallback({
                    success: true,
                    status: 200
                });
        });
    }

    addAmountName(amount, userCallback){
        User.updateOne({name: this.user['name']}, { $inc: { amount: Number(amount)}} , (err) => {
            if(err){
                userCallback({
                    success: false,
                    status: common.getStatusCode(err),
                    err: err
                });
            }
            else
                userCallback({
                    success: true,
                    status: 200
                });
        });
    }

    /*
     * @description Bets on an event
     * @param event_id Object Id
     * @param which_team Number(1 or 2)
     * @param amount Number
     * @param betCallback function
     * @return none
     */
    betOn(event_id, which_team, amount, betCallback){
        if(this.hasSufficentAmount(amount)){
            Event.findById(event_id, (err, event_doc) => {
                if(err){
                    betCallback({
                        success: false,
                        status: common.getStatusCode(err),
                        err: err
                    });
                }
                else if(event_doc == null){
                    betCallback({
                        success: false,
                        status: 200,
                        err: { 'event': 'No event found'}
                    });
                }
                else{
                    let team_odd = 0;

                    if(which_team == event_doc.team1_name)
                        team_odd = event_doc.team1_odd;
                    else if(which_team == event_doc.team2_name)
                        team_odd = event_doc.team2_odd;
                    else
                        return betCallback({
                            success: false,
                            status: 200,
                            err: { message: 'You have to choose a correct team.'}
                        });

                    let bet = new Bet({
                        event_id: event_doc.id,
                        team_name: which_team,
                        user_id: this.user['_id'],
                        team_odd: team_odd,
                        bet_amount: amount,
                    });

                    this.substructAmount(amount, (doc) => {
                        if(doc.success){
                            bet.save((err, bet) => {
                                if(err){
                                    betCallback({
                                        success: false,
                                        status: common.getStatusCode(err),
                                        err: err
                                    });
                                    this.addAmount(amount);
                                }
                                else{
                                    betCallback({
                                        success: true,
                                        doc: bet
                                    });
                                }
                            });
                        }
                        else
                            betCallback(doc);
                    });
                }
            });
        }
        else
            betCallback({
                success: false,
                err: { 'message': 'User does not have a sufficent amount' }
            });
    }

    /*
     * @description Cash out
     * @param amount
     * @return none
     */
    cashOut(amount, cashOutCallback){
        if(this.hasSufficentAmount(amount)){
            this.substructAmount(amount, cashOutCallback);
        }
        else
            cashOutCallback({
                success: false,
                err: { 'amount': 'User does not have a sufficent amount' }
            });
    }

    cashOutName(amount, cashOutCallback){
        if(this.hasSufficentAmount(amount)){
            this.substructAmountName(amount, cashOutCallback);
        }
        else
            cashOutCallback({
                success: false,
                err: { 'amount': 'User does not have a sufficent amount' }
            });
    }

    /*
     * @description Gets an index of events to show
     * @param after Object Id(for paging)
     * @param limit Number(for paging)
     * @param indexCallback function
     * @return none
     */
    static index(after, limit, indexCallback, finished){
        if(!limit){
            limit = PAGE_LIMIT_DEFAULT;
        }
        if(!after || after == 0){
            after = Date.now();
        }

        let closingTime_query = { $gte: Date.now() };
        if(finished)
            closingTime_query = { $lt: (Date.now() + (5*60*1000)) };

        Event.find({ createdTime: { $lte: after}, closingTime: closingTime_query}, 'team1_name team2_name team1_odd team2_odd createdTime closingTime', { limit: limit, sort: { createdTime: -1 } } , (err, docs) => {
            if(err){
                indexCallback({
                    success: false,
                    status: common.getStatusCode(err),
                    err: err
                });
            }
            else{
                indexCallback({
                    success: true,
                    status: 200,
                    doc: docs
                });
            }
        });
    }
}

module.exports = BetController;
