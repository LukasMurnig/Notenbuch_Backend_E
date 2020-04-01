'use strict'

const Sequelize = require('sequelize');
const sequelize = require('../start').sequelize;
const period = sequelize.define('period', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        unique: true
    },
    label: {type: Sequelize.STRING, unique: true},
    from: {type: Sequelize.STRING},
    till: {type: Sequelize.STRING},
    active: {type: Sequelize.STRING},
}, {
    tableName: 'period',
	timestamps: false,
	freezeTableName: true
});

module.exports = period;