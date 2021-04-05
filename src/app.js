const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const { toggleDoor, startLoginPolling, getState, resetFeeders } = require('./mauzis/petcare');
const { iniTelegramBot } = require('./telegram/temegram');
require('dotenv').config();
const middlewares = require('./middlewares');
const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
startLoginPolling();
iniTelegramBot();
if (process.env.NODE_ENV === 'production') {
    app.use(morgan('combined', {
        skip: function(req, res) { return res.statusCode < 400 }
    }));
    app.get('/', async(req, res) => {
        res.json(await getState());
    });
} else {
    app.use(morgan('dev'));
    app.get('/', async(req, res) => {
        res.json(await getState());
    });
}

app.get('/door', async(req, res) => {
    res.send(await toggleDoor(req.query.bit));
});

app.get('/status', async(req, res) => {
    res.send(await getState());
});

app.get('/feeders', async(req, res) => {
    res.send(await resetFeeders(req.query.tare));
});

app.get('/feeder', async(req, res) => {
    res.send(await resetFeeder(req.query.tare, device_id));
});

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

module.exports = app;