const mongoose = require('mongoose');
const Team = require('team');

const eventSchema = new mongoose.Schema({
    team1_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    team2_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    team1_odd: {
        type: Number,
        required: true,
    },
    team2_odd: {
        type: Number,
        required: true,
    },
    winner_id:{
        type: mongoose.Schema.Types.ObjectId,
    },
    finished:{
        type: Boolean,
        default: false,
        required: true,
    }
});

//This forms a static method on the schema
//see https://mongoosejs.com/docs/api.html under Schema.static
eventSchema.static('fullEvent', (event_id, callback) => {
    this.findById(event_id, (err, event_doc) => {
        if(err){
            callback({
                success:false,
                err: err
            });
        }
        else{
            Team.findById(event_doc.team1_id, (err, team) => {
                if(err){
                    callback({
                        success: false,
                        err: err
                    });
                }
                else{
                    event_doc.team1_name = team.name;
                    Team.findById(event_doc.team2_id, (err, team) => {
                        if(err){
                            callback({
                                success: false,
                                err: err
                            });
                        }
                        else{
                            event_doc.team2_name = team.name;
                            callback({
                                success: true,
                                event_doc: event_doc
                            });
                        }
                    });
                }
            });
        }
    });
});

module.exports = new mongoose.model('Event', eventSchema);
