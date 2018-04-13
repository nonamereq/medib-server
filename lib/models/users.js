const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    }
});


module.exports = new mongoose.model('User', userSchema);
