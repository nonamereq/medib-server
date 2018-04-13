const mongoose = require('mongoose');

const betSchema = new mongoose.Schema({
    event_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    team_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    user_id: {
        type: Number,
        required: true,
    },
    team_odd: {
        type: Number,
        required: true,
    },
    bet_amount:{
        type: Number,
        required: true,
    },
});

module.exports = new mongoose.model('Bet', betSchema);
