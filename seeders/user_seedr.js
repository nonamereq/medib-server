const User = require('../lib/models/user');

(new User({
    name: 'mock',
    password: '123456',
    email: 'mock1abel@abel.com',
    amount: 400
})).save();

(new User({
    name: 'mock2',
    password: '123456',
    email: 'mock2@abel.com',
    amount: 400
})).save();

(new User({
    name: 'mock3',
    password: '123456',
    email: 'mock3@abel.com',
    amount: 400
})).save();

(new User({
    name: 'admin',
    password: '123456',
    email: 'mock4@abel.com',
    isAdmin: true
})).save();

