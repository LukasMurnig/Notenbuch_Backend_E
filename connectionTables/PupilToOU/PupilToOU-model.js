'use strict'

const Sequelize = require('sequelize');
const sequelize = require('../../start').sequelize;
const PupilTOOU = sequelize.define('PupilToOrganisationalUnit', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    OULabel: {type: Sequelize.STRING},
    PIdentifier:  {type: Sequelize.STRING}
}, {
    tableName: 'PupilToOrganisationalUnit',
    timestamps: false,
    freezeTableName: true
});

module.exports = PupilTOOU;