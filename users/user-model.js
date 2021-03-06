'use strict'

const Sequelize = require('sequelize');
const sequelize = require('../start').sequelize;
const user = sequelize.define('user', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        unique: true
    },
    firstname: {type: Sequelize.STRING},
    lastname: {type: Sequelize.STRING},
    username: {type: Sequelize.STRING, unique: true},
    password: {type: Sequelize.STRING},
    email: {type: Sequelize.STRING, unique: true},
}, {
    tableName: 'User',
	timestamps: false,
	freezeTableName: true
});

module.exports = user;