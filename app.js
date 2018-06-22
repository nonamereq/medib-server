const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const AdminRouter = require('./lib/routes/AdminRouter');
const ApiRouter = require('./lib/routes/ApiRouter');
const UserRouter = require('./lib/routes/UserRouter');

require('./lib/connection');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(morgan('tiny'));
// --------------------Control which can access our web port----------------------
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PATCH,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept,Authorization');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

// ----------------------Routes---------------------
app.use('/api', ApiRouter);
app.use('/user', UserRouter);
app.use('/admin', AdminRouter);

app.listen(3000, () => global.console.log('magic happens at 3000'));
