'use strict'

const Sequelize = require('sequelize');
const sequelize = require('../start').sequelize;
const OrganisationalUnit = sequelize.define('OrganisationalUnit', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    label: { type: Sequelize.STRING, unique: true },
    "pupil-group-label": { type: Sequelize.STRING },
    "subject-label": { type: Sequelize.STRING },
    notes: { type: Sequelize.STRING },
    owner: { type: Sequelize.STRING },
    "period-label": {type: Sequelize.STRING},
}, {
    tableName: 'OrganisationalUnit',
    timestamps: false,
    freezeTableName: true
});

module.exports = OrganisationalUnit;