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
    name: {type: Sequelize.STRING, unique: true},
}, {
    tableName: 'period',
	timestamps: false,
	freezeTableName: true
});

module.exports = period;