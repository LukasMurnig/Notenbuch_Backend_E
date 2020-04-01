'use strict'

let selectionFields = '';
const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const period = require('./../periods/period-model');
const serverPk = require('../certs/serverSecret').PrivateKey;
const salt = require('../certs/serverSecret').Salt;
const key = crypto.scryptSync(serverPk, salt, 24);
const algorithm = 'aes-192-cbc';
const ivlength = 16;
const iv = crypto.randomBytes(ivlength);

async function selectById(req, res, next) {
    try {
        let id = req.params.id
        const period = await period.findAll({
            where: {
                id: id
            }
        }, selectionFields);
        req.selectedperiod = period;
    } catch (error) {
        console.log(error);
        res.status(500).send('something went wrong');
    }
    next();
}

router.get('/', async (req, res) => {
    try {
        const periods = await period.findAll({}, selectionFields);
        res.status(200).json(periods);
    } catch (error) {
        res.status(500).json('something went wrong!' + error);
    }
});

router.get('/:id', selectById, async (req, res) => {
    res.status(200).json(req.selectedperiod);
});

router.post('/', async (req, res) => {
    let payload = req.body;
    if (Object.keys(payload).length != 4) {
        res.status(400).json('Too much or less properties!');
        return;
    }

    if (payload.label == undefined  || payload.from == undefined || payload.till == undefined || payload.active == undefined) {
        res.status(400).json('period properties are not allowed to be undefined!');
        return;
    }


    if (typeof (payload.label) != 'string' || typeof (payload.from) != 'string'  || typeof (payload.till) != 'string' ||  typeof (payload.active) != 'boolean' ) {
        res.status(400).json('not typeof string');
        return;
    }
    try {
        const savedperiod = await period.create({
            label: payload.label,
            from: payload.from,
            till: payload.till,
            active: payload.active
        });
        res.status(201).json(savedperiod);
    } catch (error) {
        res.status(400).json('creating period did not work!');
    }
});

router.put('/:id', selectById, async (req, res) => {
    let toUpdateperiod = req.body;
    //by default you can not iterate mongoose object -
    let compareperiod = JSON.parse(JSON.stringify(req.selectedperiod));
    //check all properties
    if (Object.keys(compareperiod[0]).length != Object.keys(toUpdateperiod).length) {
        res.status(400).send('number of properties in object not valid');
        return;
    } 
    if (Object.keys(toUpdateperiod).some(k => { return compareperiod[0][k] == undefined })) {
        res.status(400).send('properties of object do not match');
        return;
    } else {
        //update - now (use the original mongoose-object again)
        for (let key in toUpdateperiod) {
            req.selectedperiod[key] = toUpdateperiod[key];
        }
        try {
            if (req.selectedperiod.password != undefined) {
                let key = crypto.createHash('sha256').update(req.selectedperiod.password).digest('base64');
                req.selectedperiod.password = key;
            }
            const savedperiod = await req.selectedperiod[0].update({
                label: toUpdateperiod.label,
                from: toUpdateperiod.from,
                till: toUpdateperiod.till,
                active: toUpdateperiod.active
            });
            res.status(200).json(savedperiod);
        } catch (error) {
            console.log(error);
            res.status(500).json('something went wrong');
        }
    }
});

router.delete('/:id', selectById, async (req, res) => {
    try {
        const period = req.selectedperiod[0].destroy();
        res.status(204).json('period was deleted successfully');
    } catch (error) {
        res.status(400).json('something went wrong!');
    }
});
module.exports = router;