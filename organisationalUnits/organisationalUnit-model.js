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
    "pupil_group_label": { type: Sequelize.STRING },
    "subject_label": { type: Sequelize.STRING },
    from: {type: Sequelize.STRING},
    till: {type: Sequelize.STRING},
    day: {type: Sequelize.STRING},
    notes: { type: Sequelize.STRING },
    owner: { type: Sequelize.STRING },
    "period_label": {type: Sequelize.STRING},
}, {
    tableName: 'OrganisationalUnit',
    timestamps: false,
    freezeTableName: true
});

module.exports = OrganisationalUnit;