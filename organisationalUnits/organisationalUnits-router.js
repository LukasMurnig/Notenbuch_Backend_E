'use strict'

let selectionFields = 'id label from till active owner organisationalUnit';
const express = require('express');
const router = express.Router();
const Period = require('../periods/period-model');
const OrganisationalUnit = require('./organisationalUnit-model');

async function selectById(req, res, next) {
    try {
        let id = req.params.id
        const OU = await OrganisationalUnit.findAll({
            where: {
                id: id
            }
        }, selectionFields);
        if(OU.length==0){
            res.status(400).json('no OrganisationalUnit with this id!');
            return;
        }
        req.selectedOU = OU;
    } catch (error) {
        console.log(error);
        res.status(500).json('something went wrong');
    }
    next();
}

async function selectByLabel(req, res, next) {
    try {
        let label = req.params.label
        const OU = await OrganisationalUnit.findAll({
            where: {
                label: label
            }
        }, selectionFields);
        if(OU.length==0){
            res.status(400).json('no OrganisationalUnit with this id!');
            return;
        }
        req.selectedOU = OU;
    } catch (error) {
        console.log(error);
        res.status(500).json('something went wrong');
    }
    next();
}


router.get('/', async (req, res) => {
    try {
        const organisationalUnits = await OrganisationalUnit.findAll({}, selectionFields);
        res.status(200).json(organisationalUnits);
    } catch (error) {
        res.status(500).json('something went wrong!' + error);
    }
});

router.get('/:id', selectById, async (req, res) => {
    res.status(200).json(req.selectedOU);
});

router.get('/:label', selectByLabel, async (req, res) => {
    res.status(200).json(req.selectedOU);
});
module.exports = router;