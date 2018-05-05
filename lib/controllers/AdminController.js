const Event = require('../models/event');
const Team = require('../models/team');

class AdminController{
    constructor(user){
        this.user = user;
        //don't think this is gonna work
        //if user is not admin delete the object after creating it
        if(!this.user.isAdmin())
            delete this;
    }
    viewEvent(event_id, viewCallback){
        Event.fullEvent(event_id, viewCallback);
    }

    //maybe this function can be a little easier for testing and reading
    postEvent(event_detail, postCallback){
        let createTeam = (name, callback) => {
            let team = new Team({
                name: name
            });
            team.save(callback);
        };

        let createEvent = (event_detail, team1_id, team2_id, callback) => {
            event_detail.team1_id = team1_id;
            event_detail.team2_id = team2_id;
            let new_event = new Event(event_detail);
            new_event.save(callback);
        };

        let savedEventCallback = (err, saved_event) => {
            if(err){
                postCallback({
                    success: false,
                    err: err
                });
            }
            else{
                postCallback({
                    success: true,
                    saved_event: saved_event
                });
            }
        };

        Team.findOne({name: event_detail.team1_name}, (err, team1_doc) => {
            if(err){
                createTeam(event_detail.team1_name, (err, team1_doc) => {
                    if(err){
                        postCallback({
                            success: false,
                            err: err
                        });
                    }
                    else{
                        Team.findOne({name: event_detail.team2_name}, (err, team2_doc) => {
                            if(err){
                                createTeam(event_detail.team2_name, (err, team2_doc) => {
                                    if(err){
                                        postCallback({
                                            success: false,
                                            err: err
                                        });
                                    }
                                    else{
                                        createEvent(event_detail, team1_doc.id, team2_doc.id, savedEventCallback);
                                    }
                                });
                            }
                            else{
                                createEvent(event_detail, team1_doc.id, team2_doc.id, savedEventCallback);
                            }
                        });
                    }
                });
            }
            else{
                Team.findOne({name: event_detail.team2_name}, (err, team2_doc) => {
                    if(err){
                        createTeam(event_detail.team2_name, (err, team2_doc) => {
                            if(err){
                                postCallback({
                                    success: false,
                                    err: err
                                });
                            }
                            else{
                                createEvent(event_detail, team1_doc.id, team2_doc.id, savedEventCallback);
                            }
                        });
                    }
                    else{
                        createEvent(event_detail, team1_doc.id, team2_doc.id, savedEventCallback);
                    }
                });
            }
        });
    }

    //maybe we will search for teams us before before updating
    updateEvent(event_id, event_detail, updateCallback){
        Event.findByIdAndUpdate(event_id, event_detail, (err, raw) => { 
            if(err){
                updateCallback({
                    success: false,
                    err: err
                });
            }
            else{
                updateCallback({
                    success: true,
                    raw: raw
                });
            }
        });
    }
}

module.exports = AdminController;
