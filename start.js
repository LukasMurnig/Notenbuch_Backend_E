'use strict'
const hostname = 'notenbuch.htl-vil';
const port = 8840;
const express = require('express');
const app = express();
const bearerToken = require('express-bearer-token');
const cors = require('cors');
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('NotenbuchDB', 'test', 'test',{
    //host: 'localhost',
    port: 8443,
    dialect: 'mssql',
    logging: false
});

connectdatabase();

async function connectdatabase() {
    try {
        await sequelize.authenticate();
        //drop database
        await sequelize.sync({ force: true });
        console.log('Former database was dropped!');
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

    app.listen(port, hostname, function () {
        console.error(`Failure: Notenbuch is up and running on ${hostname}:${port}, but there were problems during the start up: `+error);
    });
}

function defaultSetup() {
    const bodyParser = require('body-parser');
    const userRouter = require('./users/user-router');
    const loginRouter = require('./login/login-router');
    const periodRouter = require('./login/period-router');
    app.use(bodyParser.json());
    app.use(bearerToken());
    app.use(cors());
    app.use('/api/user', userRouter);
    app.use('/api', loginRouter);
    app.use('/api/period', periodRouter);
    app.listen(port, hostname, function () {
        console.log(`Success: Chat Web Application is up and running on ${hostname}:${port}.`)
    });
}

module.exports = {sequelize};