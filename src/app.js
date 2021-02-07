const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const { toggleDoor, startLoginPolling, getState } = require('./mauzis/petcare');
const { iniTelegramBot } = require('./telegram/temegram');
require('dotenv').config();
const middlewares = require('./middlewares');
const app = express();

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.json());
startLoginPolling();
iniTelegramBot();
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(__dirname + '/public/'));
    app.get(/.*!/, (req, res) =>
        res.sendFile(__dirname + './public/index.html'));
} else {
    app.get('/', (req, res) => {
        res.json({
            message: "Developer mode 🐱‍👤"
        });
    });
}

app.get('/door', async(req, res) => {
    res.send(await toggleDoor(req.query.bit));
});

app.get('/status', async(req, res) => {
    res.send(await getState());
});

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

module.exports = app;