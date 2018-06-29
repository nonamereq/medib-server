const Event = require('../models/event');
const Bet = require('../models/bet');
const User = require('../models/user');
const common = require('../common');


/*
 * @description adjusts date for returning closing time
 * @param dateString String
 * @return date Date
 */
let adjustDate = (dateString) => {
    let date = new Date(dateString);
    if(isNaN(date.getTime()))
        date = new Date(parseInt(dateString));

    date.setMinutes(date.getMinutes() - 5);
    if(date.getTime() < 0)
        return NaN;
    return date.getTime();
};

class AdminController{
    /*
     * @description adds an event
     * @param event_detail object
     * @param postCallback function
     */

    static postEvent(event_detail, postCallback){
        let date = adjustDate(event_detail.date);
        if(isNaN(date)){
            return postCallback({
                success: false,
                status: 400,
                err: { message: 'Invalid date' }
            });
        }
        event_detail.closingTime = date;
        let new_event = new Event(event_detail);
        new_event.save((err, saved_event) => {
            if(err){
                postCallback({
                    success: false,
                    status: common.getStatusCode(err),
                    err: err
                });
            }
            else{
                postCallback({
                    success: true,
                    status: 200,
                    doc: saved_event
                });
            }
        });
    }

    /*
     * @description updates an event
     * @param event_detail object
     * @param updateCallback function
     */

    //maybe we will search for teams us before before updating
    static updateEvent(event_id, event_detail, updateCallback){
        let date = adjustDate(event_detail.date);

        if(isNaN(date)){
            delete event_detail.closingTime;
        }
        else
            event_detail.closingTime = date;

        Event.findByIdAndUpdate(event_id, event_detail, { runValidators: true }, (err, raw) => { 
            if(err){
                updateCallback({
                    success: false,
                    status: common.getStatusCode(err),
                    err: err
                });
            }
            else if(raw == null){
                updateCallback({
                    success: false,
                    status: 200,
                    err: { message: 'No such event' }
                });
            }
            else{
                updateCallback({
                    success: true,
                    status: 200,
                    doc: raw
                });
            }
        });
    }

    /*
     * @description update bets (pay winners their money)
     * @param event_id ObjectId
     * @param winner_team String
     */
    static updateBets(event_id, winner_team){
        Bet.update({event_id: event_id, paid: false, team_name: { $ne: winner_team} }, {paid: true}, {multi: true}, () => {} );

        Bet.find({event_id: event_id, paid: false, team_name: winner_team }, 'team_odd user_id bet_amount', (err, bet_docs) => {
            if(bet_docs != null && bet_docs.length > 0){
                for(let index in bet_docs){
                    let current_bet = bet_docs[index];
                    let new_amount = current_bet.team_odd * current_bet.bet_amount;
                    User.updateOne({_id: current_bet.user_id }, { $inc: {amount: new_amount} }, (err) => {
                        if(err == null){
                            Bet.updateOne({_id: current_bet['_id']}, {paid: true}, () => {} );
                        }
                    });
                }
            }
        });
    }

    /*
     * @descripiton assign a winner
     * @param event_id string
     * @param which_team string
     */
    static assignWinner(event_id, winner_team, updateCallback){
        Event.updateOne({_id: event_id, closingTime: {$lt: Date.now()},
            $or: [ { team1_name: winner_team }, { team2_name: winner_team} ]
        }, { winner_name: winner_team }, (err, doc) => {
            if(err){
                updateCallback({
                    success: false,
                    status: common.getStatusCode(err),
                    err: err
                });
            }
            else if(doc == null){
                updateCallback({
                    success: false,
                    status: 200,
                    err: { message: 'No such event' }
                });
            }
            else if(doc.nModified == 0){
                updateCallback({
                    success: false,
                    status: 200,
                    err: { message: 'No such event' }
                });
            }
            else{
                AdminController.updateBets(event_id, winner_team);
                updateCallback({
                    success: true,
                    status: 200,
                    doc: doc
                });
            }
        });
    }
}


/*//Builtin tests
const expect = require('chai').expect;
describe('#adjustDate: tests', function(){
    it('#adjustDate: should return NaN', function(){
        expect(adjustDate('akjdffadsf')).to.be.NaN;
        expect(adjustDate(-10000)).to.be.NaN;
    });

    it('#adjustDate: should return a correct value', function(){
        expect(adjustDate(1529489752443)).to.equal(1529489752443 - (5 * 60 * 1000));
        expect(adjustDate('1529489752443')).to.equal(1529489752443 - (5 * 60 * 1000));
        expect(adjustDate('Jun-20-2018')).to.equal((new Date('Jun-20-2018')).getTime() - (5*60*1000));
    });
});*/

module.exports = AdminController;
