'use strict'

const Sequelize = require('sequelize');
const sequelize = require('../start').sequelize;
const Period = sequelize.define('period', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    label: { type: Sequelize.STRING, unique: true },
    from: { type: Sequelize.DATE },
    till: { type: Sequelize.DATE },
    active: { type: "BIT" },
    owner: {type: Sequelize.STRING},
}, {
    tableName: 'period',
    timestamps: false,
    freezeTableName: true
});

module.exports = Period;