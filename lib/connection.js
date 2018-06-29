const mongoose = require('mongoose');
const config = require('../.env');

let options = {
    reconnectTries: 5,
    reconnectInterval: 100
};
mongoose.connect(config.database.url, options);
