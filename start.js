'use strict'
const hostname = 'localhost';
const port = process.env.PORT || 8840;
const express = require('express');
var fs = require("fs");
const app = express();
const bearerToken = require('express-bearer-token');
const cors = require('cors');
const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('notenbuch', 'notenbuch', '&test12', {
    host: 'den1.mssql7.gear.host',
    dialect: 'mssql',
    logging: false
});

connectdatabase();

async function connectdatabase() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
        defaultSetup();
    } catch (error) {
        errorSetup(error);
    }
}

function errorSetup(error) {

    app.use('*', (req, res) => {
        res.status(500).send('something went wrong. Inform the administrator');
    });

    app.listen(port, function () {
        console.error(`Failure: Notenbuch is up and running on ${hostname}:${port}, but there were problems during the start up: ` + error);
    });
}

function defaultSetup() {

    const bodyParser = require('body-parser');
    const userRouter = require('./users/user-router');
    const deleteUserRouter = require('./users/user-router').deleteAllUser;
    const deletePeriodRouter = require('./periods/period-router').deleteAllPeriod;
    const deleteAllOURouter = require('./organisationalUnits/organisationalUnits-router').deleteAllOU;
    const deleteAllPupilRouter = require('./pupils/pupil-router').deleteAllPupil;
    const loginRouter = require('./login/login-router').router;
    const authenticate = require('./login/login-router').authenticate;
    const periodRouter = require('./periods/period-router');
    const ouRouter = require('./organisationalUnits/organisationalUnits-router');
    const pupilRouter = require('./pupils/pupil-router');
    app.use(bodyParser.json());
    app.use(bearerToken());
    app.use(cors());
    app.use('/api/user', deleteUserRouter);
    app.use('/api/period',deletePeriodRouter);
    app.use('/api/organisationalUnit',deleteAllOURouter);
    app.use('/api/pupil',deleteAllPupilRouter);
    app.use('/api/user', userRouter);
    //app.use('/api',loginRouter);
    //app.use(authenticate);
    app.use('/api/period', periodRouter);
    app.use('/api/organisationalUnit', ouRouter);
    app.use('/api/pupil', pupilRouter);
    app.listen(port, function () {
        console.log(`Success: Chat Web Application is up and running on ${hostname}:${port}.`)
    });
}

module.exports = { sequelize };