'use strict'

const Sequelize = require('sequelize');
const sequelize = require('../start').sequelize;
const Pupil = sequelize.define('Pupil', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    identifier: { type: Sequelize.STRING, unique: true },
    birthdt: { type: Sequelize.DATE },
    firstname: { type: Sequelize.STRING },
    lastname: { type: Sequelize.STRING },
    notes: {type: Sequelize.STRING},
    mail: { type: Sequelize.STRING, unique: true },
}, {
    tableName: 'pupil',
    timestamps: false,
    freezeTableName: true
});

module.exports = Pupil;