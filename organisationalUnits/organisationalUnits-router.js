'use strict'

let selectionFields = 'id label pupil_group_label subject_label notes owner period_label';
const express = require('express');
const router = express.Router();
const deleteRouter = express.Router();
const Period = require('../periods/period-model');
const OrganisationalUnit = require('./organisationalUnit-model');
const User = require('./../users/user-model');
const Sequelize = require('sequelize');
async function selectBy(req, res, next) {
    try {
        let id = req.params.id;
        var OU;
        if(isNaN(id)){
            OU = await OrganisationalUnit.findAll({
                where: {
                    label: id
                }
            }, selectionFields);
        }else{
        OU = await OrganisationalUnit.findAll({
            where: {
                id: id
            }
        }, selectionFields);
        }
        if (OU.length == 0) {
            res.status(400).json('no OrganisationalUnit with this id or label!');
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

router.get('/:id', selectBy, async (req, res) => {
    res.status(200).json(req.selectedOU);
});



router.post('/', async (req, res) => {
    let payload = req.body;
    if (Object.keys(payload).length != 5) {
        res.status(400).json('Too much or less properties!');
        return;
    }

    if (payload.label == undefined || payload.pupil_group_label == undefined || payload.subject_label == undefined || payload.notes == undefined
         || payload.period_label == undefined) {
        res.status(400).json('period properties are not allowed to be undefined!');
        return;
    }


    if (typeof (payload.label) != 'string' || typeof (payload.pupil_group_label) != 'string' || typeof (payload.subject_label) != 'string'
        || typeof (payload.notes) != 'string' || typeof (payload.period_label) != 'string') {
        res.status(400).json('not typeof string or boolean');
        return;
    }

    try {
        const period = await Period.findAll({
            where: {
                label: payload.period_label
            }
        });
        if (period.length == 0 || period == undefined) {
            res.status(400).json('Their is no Period with this label in Database');
            return;
        }
        const savedOU = await OrganisationalUnit.create({
            label: payload.label,
            "pupil_group_label": payload.pupil_group_label,
            "subject_label": payload.subject_label,
            notes: payload.notes,
            owner: req.username,
            "period_label": payload.period_label
        });
        const outoSend = await OrganisationalUnit.findAll({
            where: Sequelize.and({
                label: payload.label,
                owner: req.username,
                "period_label": payload.period_label
            })
        });
        res.status(201).json(outoSend);
    } catch (error) {
        console.log(error);
        res.status(400).json('creating organisational Unit did not work!');
    }
});

router.put('/:id', selectBy, async (req, res) => {
    let payload = req.body;
    let length = Object.keys(payload).length +2;
    let toUpdateOU = {"id": req.params.id, "label": req.body.label, "pupil_group_label": req.body.pupil_group_label, 
    "subject_label": req.body.subject_label, "notes": req.body.notes, "owner": req.username, "period_label": req.body.period_label};
    //by default you can not iterate mongoose object -
    let compareOU = JSON.parse(JSON.stringify(req.selectedOU));
    //check all properties
    if (Object.keys(compareOU[0]).length != length) {
        res.status(400).json('number of properties in object not valid');
        return;
    }
    if (Object.keys(payload).some(k => { return compareOU[0][k] == undefined })) {
        res.status(400).json('properties of object do not match');
        return;
    } else {
        if (toUpdateOU.id == undefined || toUpdateOU.label == undefined || toUpdateOU.pupil_group_label == undefined || 
            toUpdateOU.subject_label == undefined || toUpdateOU.notes == undefined || toUpdateOU.period_label == undefined){
                res.status(400).json('properties does not allowed to be undefined ');
                return;
            }
        //update - now (use the original mongoose-object again)
        for (let key in toUpdateOU) {
            req.selectedOU[key] = toUpdateOU[key];
        }
        try {
            const period = await Period.findAll({
                where: {
                    label: toUpdateOU.period_label
                }
            });
            if (period.length == 0 || period == undefined) {
                res.status(400).json('Their is no Period with this label in Database');
                return;
            }
            const savedOU = await req.selectedOU[0].update({
                label: toUpdateOU.label,
                "pupil_group_label": toUpdateOU.pupil_group_label,
                "subject_label": toUpdateOU.subject_label,
                notes: toUpdateOU.notes
            });
            res.status(200).json(savedOU);
        } catch (error) {
            console.log(error);
            res.status(500).json('something went wrong');
        }
    }
});
router.delete('/:id', selectBy, async (req, res) => {
    try {
        req.selectedOU[0].destroy();
        res.status(204).json('Organisational Unit was deleted successfully');
    } catch (error) {
        res.status(500).json('something went wrong!');
    }
});

deleteRouter.delete('/deleteAll', async (req, res) => {
    try {
            const data = await OrganisationalUnit.findAll({});
            console.log(data);
            for (let i = 0; i < data.length; i++) {
                console.log(data[i]);
                await data[i].destroy();
            }
            res.status(204).json('allOrganisationalUnitsdeleted!');
    } catch (error) {
        res.status(500).json('something went wrong!');
    }
});

module.exports = router;
module.exports.deleteAllOU = deleteRouter;