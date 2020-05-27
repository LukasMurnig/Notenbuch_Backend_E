'use strict'

let selectionFields = 'id label record_group_label subject_label notes owner record_label';
const express = require('express');
const router = express.Router();
const deleteRouter = express.Router();
const Record = require('../records/record-model');
const Sequelize = require('sequelize');
async function selectBy(req, res, next) {
    try {
        let id = req.params.id;
        var record;
        
        record = await record.findAll({
            where: {
                id: id
            }
        }, selectionFields);
        
        if (record.length == 0) {
            res.status(400).json('no record with this id!');
            return;
        }
        req.selectedrecord = record;
    } catch (error) {
        console.log(error);
        res.status(500).json('something went wrong');
        return;
    }
    next();
}

router.get('/', async (req, res) => {
    try {
        const records = await record.findAll({}, selectionFields);
        res.status(200).json(records);
    } catch (error) {
        res.status(500).json('something went wrong!' + error);
    }
});

router.get('/:id', selectBy, async (req, res) => {
    res.status(200).json(req.selectedrecord);
});

router.post('/', async (req, res) => {
    let payload = req.body;
    if (Object.keys(payload).length != 5) {
        res.status(400).json('Too much or less properties!');
        return;
    }

    if (payload.value == undefined || payload.date == undefined || payload.created == undefined || payload.modified == undefined
        || payload.comment == undefined) {
        res.status(400).json('record properties are not allowed to be undefined!');
        return;
    }


    if (typeof (payload.value) != 'string' || typeof (payload.date) != 'string' || typeof (payload.created) != 'string'
        || typeof (payload.modified) != 'string' || typeof (payload.comment) != 'string') {
        res.status(400).json('not typeof string or boolean');
        return;
    }

    if (new Date(payload.date) == "Invalid Date" || isNaN(new Date(payload.date))){
        res.status(400).json('date are not valid for Date type');
            return;
    }
    if (new Date(payload.created) == "Invalid Date" || isNaN(new Date(payload.created))){
        res.status(400).json('created are not valid for Date type');
            return;
    }
    if (new Date(payload.modified) == "Invalid Date" || isNaN(new Date(payload.modified))){
        res.status(400).json('modified are not valid for Date type');
            return;
    }

    try {
        
        const savedrecord = await record.create({
            value: payload.value,
            date: new Date(payload.date),
            created: payload.created,
            modified: payload.modified,
            comment: payload.comment
        });
        const recordtoSend = await record.findAll({
            where: Sequelize.and({
                value: payload.value
            })
        });
        res.status(201).json(recordtoSend);
    } catch (error) {
        console.log(error);
        res.status(400).json('creating record did not work!');
    }
});

router.put('/:id', selectBy, async (req, res) => {
    let payload = req.body;
    let length = Object.keys(payload).length +1;
    let toUpdaterecord = {"id": req.params.id, "value": req.body.value, "date": req.body.date, "created": req.body.created,
    "modified": req.body.modified,"comment": req.body.comment};
    //by default you can not iterate mongoose object -
    let comparerecord = JSON.parse(JSON.stringify(req.selectedrecord));
    //check all properties
    if (Object.keys(comparerecord[0]).length != length) {
        res.status(400).json('number of properties in object not valid');
        return;
    }
    if (Object.keys(payload).some(k => { return comparerecord[0][k] == undefined })) {
        res.status(400).json('properties of object do not match');
        return;
    } else {
        if (toUpdaterecord.id == undefined || toUpdaterecord.value == undefined || toUpdaterecord.date == undefined ||
            toUpdaterecord.created == undefined || toUpdaterecord.modified == undefined || toUpdaterecord.comment == undefined){
                res.status(400).json('properties are do not allowed to be undefined');
                return;
            }
        //update - now (use the original mongoose-object again)
        for (let key in toUpdaterecord) {
            req.selectedrecord[key] = toUpdaterecord[key];
        }
        try {
            
            const savedrecord = await req.selectedrecord[0].update({
                value: toUpdaterecord.value,
                date: toUpdaterecord.date,
                created: toUpdaterecord.created,
                modified: toUpdaterecord.modified,
                comment: toUpdaterecord.comment
            });
            res.status(200).json(savedrecord);
        } catch (error) {
            console.log(error);
            res.status(500).json('something went wrong');
        }
    }
});


router.delete('/:id', selectBy, async (req, res) => {
    try {
        req.selectedrecord[0].destroy();
        res.status(204).json('record was deleted successfully');
    } catch (error) {
        res.status(400).json('something went wrong!');
    }
});

deleteRouter.delete('/deleteAll', async (req, res) => {
    try {
            const data = await record.findAll({});
            for (let i = 0; i < data.length; i++) {
                await data[i].destroy();
            }
            res.status(204).json('allrecordsdeleted!');
    } catch (error) {
        res.status(500).json('something went wrong!');
    }
});

module.exports = router;
module.exports.deleteAllrecord = deleteRouter;