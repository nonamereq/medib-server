const mongoose = require('mongoose');


// Todo: use a hash or encryption on the password
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    amount: {
        type: Number,
        required: true,
        default: 0
    },
    isAdmin: {
        type: Boolean,
        required: true,
        default: false,
    }
});


module.exports = new mongoose.model('User', userSchema);
