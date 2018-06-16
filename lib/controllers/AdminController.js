const Event = require('../models/event');
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

    date.setHours(date.getHours() - 2);
    return date.getTime();
};

class AdminController{
    constructor(user){
        this.user = user;
    }

    /*
     * @description adds an event
     * @param event_detail object
     * @param postCallback function
     */

    postEvent(event_detail, postCallback){
        let date = adjustDate(event_detail.date);
        if(isNaN(date)){
            return postCallback({
                success: false,
                status: 401,
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
    updateEvent(event_id, event_detail, updateCallback){
        let date = adjustDate(event_detail.date);
        if(isNaN(date)){
            return updateCallback({
                success: false,
                status: 401,
                err: { message: 'Invalid date' }
            });
        }
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
}

module.exports = AdminController;
