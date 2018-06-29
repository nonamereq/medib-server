const mongoose = require('mongoose');
const common = require('../common');

// Todo: use a hash or encryption on the password
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [ true, 'User name must not be empty'],
        unique: true
    },
    password: {
        type: String,
        required: [ true, 'Password must not be empty'],
    },
    email: {
        type: String,
        required: [ true, 'Email must not be empty'],
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


(() => {
    userSchema.path('name').validate((value) => {
        return value.length >= 4;
    }, 'User name must be greater than or equal to 4 characters');

    userSchema.path('name').validate((value) => {
        return value.match(/^[a-zA-Z_]\w*$/);
    }, 'User name must only include alphanumeric characters');

    userSchema.path('password').validate((value) =>  {
        return value.length >= 6;
    }, 'Password must be greater than or equal to 6 characters');

    userSchema.path('amount').validate((value) => {
        return value >= 0;
    }, 'Amount must be greater than or equal to 0');

    userSchema.path('email').validate((value) => {
        let regexp = /^[a-zA-Z0-9!#$%&'*/=?^_\-+`{|}~]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9]+$/;
        return value.match(regexp);
    }, 'Invalid email');
})();

userSchema.pre('save', function(next){
    if (this.isModified('password') || this.isNew) {
        let password = common.hashValue(this.password);
        this.password = password;
    }
    next();
});

userSchema.method('comparePassword', function(password){
    return common.hashValue(String(password)) == this.password;
});

module.exports = mongoose.model('User', userSchema);
