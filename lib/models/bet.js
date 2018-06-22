const mongoose = require('mongoose');

const betSchema = new mongoose.Schema({
    event_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'You have to choose an event'],
    },
    team_name: {
        type: String,
        required: [ true, 'You have to choose a team'],
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: [ true, 'User must be logged in'],
    },
    team_odd: {
        type: Number,
        required: true
    },
    bet_amount:{
        type: Number,
        required: [ true, 'You have to provide an amount']
    },
    paid: {
        type: Boolean,
        default: false
    }
});

(() => {
    betSchema.path('bet_amount').validate((value) => {
        return value > 0;
    }, 'Bet amount must be greater than 0');
});

module.exports = mongoose.model('Bet', betSchema);
