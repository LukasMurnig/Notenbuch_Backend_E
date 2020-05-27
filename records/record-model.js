'use strict'

const Sequelize = require('sequelize');
const sequelize = require('../start').sequelize;
const Record = sequelize.define('Record', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    value: { type: Sequelize.STRING, unique: true },
    date: { type: Sequelize.DATE },
    created: { type: Sequelize.DATE },
    modified: { type: Sequelize.DATE },
    comment: {type: Sequelize.STRING},
}, {
    tableName: 'record',
    timestamps: false,
    freezeTableName: true
});

module.exports = Record;