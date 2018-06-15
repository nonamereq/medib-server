const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    team1_name: {
        type: String,
        required: [ true, 'You have to choose a team'],
    },
    team2_name: {
        type: String,
        required: [ true, 'You have to choose a team'],
    },
    team1_odd: {
        type: Number,
        required: [ true, 'You have to provide an odd'],
    },
    team2_odd: {
        type: Number,
        required: [ true, 'You have to provide an odd'],
    },
    winner_name:{
        type: String,
    },
    closingTime: {
        type: Number,
        required: [ true, 'You have to tell when the event is happening' ],
    },
    createdTime: {
        type: Number,
        required: true,
        default: Date.now()
    }
});

(() => {
    eventSchema.path('closingTime').validate((value) => {
        value = new Date(value);
        let closingTime = value.setMinutes(value.getMinutes() - 5);
        return closingTime > Date.now();
    }, 'The event time must be greater than the current time + 5 minutes');
})();



module.exports = mongoose.model('Event', eventSchema);
