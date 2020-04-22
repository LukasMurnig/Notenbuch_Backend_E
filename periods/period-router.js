'use strict'

let selectionFields = 'id label from till active';
const express = require('express');
const router = express.Router();
const Period = require('./../periods/period-model');

async function selectById(req, res, next) {
    try {
        let id = req.params.id
        const period = await Period.findAll({
            where: {
                id: id
            }
        }, selectionFields);
        if(period.length==0){
            res.status(400).json('no period with this id!');
            return;
        }
        req.selectedperiod = period;
    } catch (error) {
        console.log(error);
        res.status(500).json('something went wrong');
    }
    next();
}

router.get('/', async (req, res) => {
    try {
        const periods = await Period.findAll({}, selectionFields);
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

    if (payload.label == undefined || payload.from == undefined || payload.till == undefined || payload.active == undefined) {
        res.status(400).json('period properties are not allowed to be undefined!');
        return;
    }


    if (typeof (payload.label) != 'string' || typeof (payload.from) != 'string' || typeof (payload.till) != 'string' || typeof (payload.active) != 'boolean') {
        res.status(400).json('not typeof string or boolean');
        return;
    }

    if (new Date(payload.from) == "Invalid Date" || isNaN(new Date(payload.from)) ||
        new Date(payload.till) == "Invalid Date" || isNaN(new Date(payload.till))) {
        res.status(400).json('from or till are not valid for Date type');
        return;
    }
    try {
        const savedperiod = await Period.create({
            label: payload.label,
            from: new Date(payload.from),
            till: new Date(payload.till),
            active: payload.active
        });
        res.status(201).json(savedperiod);
    } catch (error) {
        console.log(error);
        res.status(400).json('creating period did not work!');
    }
});

router.put('/:id', selectById, async (req, res) => {
    let toUpdateperiod = req.body;
    //by default you can not iterate mongoose object -
    let compareperiod = JSON.parse(JSON.stringify(req.selectedperiod));
    //check all properties
    if (Object.keys(compareperiod[0]).length != Object.keys(toUpdateperiod).length) {
        res.status(400).json('number of properties in object not valid');
        return;
    }
    if (Object.keys(toUpdateperiod).some(k => { return compareperiod[0][k] == undefined })) {
        res.status(400).json('properties of object do not match');
        return;
    } else {
        //update - now (use the original mongoose-object again)
        for (let key in toUpdateperiod) {
            req.selectedperiod[key] = toUpdateperiod[key];
        }
        try {
            if (new Date(toUpdateperiod.from) == "Invalid Date" || isNaN(new Date(toUpdateperiod.from)) ||
                new Date(toUpdateperiod.till) == "Invalid Date" || isNaN(new Date(toUpdateperiod.till))) {
                res.status(400).json('from or till are not valid for Date type');
                return;
            }
            const savedperiod = await req.selectedperiod[0].update({
                label: toUpdateperiod.label,
                from: new Date(toUpdateperiod.from),
                till: new Date(toUpdateperiod.till),
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