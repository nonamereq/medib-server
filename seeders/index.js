const mongoose = require('mongoose');
require('../lib/connection');

mongoose.connection.dropDatabase(() => {});

require('./user_seedr');
require('./event_seedr');

setTimeout(() => {
    require('./bet_seeder');
}, 2000);

setTimeout(() => {
    console.log('finished');
}, 1000);
