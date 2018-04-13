const mongoose = require('mongoose');

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


module.exports = new mongoose.model('Event', eventSchema);
