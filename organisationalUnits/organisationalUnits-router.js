'use strict'

let selectionFields = 'id label from till active owner organisationalUnit';
const express = require('express');
const router = express.Router();
const Period = require('../periods/period-model');
const OrganisationalUnit = require('./organisationalUnit-model');

async function selectById(req, res, next) {
    try {
        let id = req.params.id;
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
        let label = req.params.label;
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


router.post('/', async (req, res) => {
    let payload = req.body;
    if (Object.keys(payload).length != 6) {
        res.status(400).json('Too much or less properties!');
        return;
    }

    if (payload.label == undefined || payload.pupil_group_label == undefined || payload.subject_label == undefined || payload.notes == undefined
        || payload.owner == undefined || payload.period_label == undefined) {
        res.status(400).json('period properties are not allowed to be undefined!');
        return;
    }


    if (typeof (payload.label) != 'string' || typeof (payload.pupil_group_label) != 'string' || typeof (payload.subject_label) != 'string' 
    || typeof (payload.notes) != 'string' || typeof(payload.owner) != 'string' || typeof(payload.period_label) != 'string'){
        res.status(400).json('not typeof string or boolean');
        return;
    }

    try {
        const users = await User.findAll({
            where: {
                username: payload.username
            }
        });
        if(users.length == 0 || users == undefined){
            res.status(400).json('Their is no user with this username in Database');
            return;
        }

        const savedOU = await OrganisationalUnit.create({
            label: payload.label,
            "pupil-group-label": payload.pupil_group_label,
            "subject-label": payload.subject_label,
            notes: payload.notes,
            owner: payload.owner,
            "period-label" : payload.period_label
        });
        res.status(201).json(savedOU);
    } catch (error) {
        console.log(error);
        res.status(400).json('creating organisational Unit did not work!');
    }
});

router.put('/:id', selectById, async (req, res) => {
    let toUpdateOU = req.body;
    //by default you can not iterate mongoose object -
    let compareOU = JSON.parse(JSON.stringify(req.selectedOU));
    //check all properties
    if (Object.keys(compareOU[0]).length != Object.keys(toUpdateOU).length) {
        res.status(400).json('number of properties in object not valid');
        return;
    }
    if (Object.keys(toUpdateOU).some(k => { return compareOU[0][k] == undefined })) {
        res.status(400).json('properties of object do not match');
        return;
    } else {
        //update - now (use the original mongoose-object again)
        for (let key in toUpdateOU) {
            req.selectedOU[key] = toUpdateOU[key];
        }
        try {
           
            const users = await User.findAll({
                where: {
                    username: toUpdateOU.username
                }
            });
            if(users.length == 0 || users == undefined){
                res.status(400).json('Their is no user with this username in Database');
                return;
            }
            const savedOU = await req.selectedOU[0].update({
                label: payload.label,
                "pupil-group-label": payload.pupil_group_label,
                "subject-label": payload.subject_label,
                notes: payload.notes,
                owner: payload.owner,
                "period-level" : payload.period_label
            });
            res.status(200).json(savedOU);
        } catch (error) {
            console.log(error);
            res.status(500).json('something went wrong');
        }
    }
});
router.delete('/:id', selectById, async (req, res) => {
    try {
        const OU = req.selectedOU[0].destroy();
        res.status(204).json('Organisational Unit was deleted successfully');
    } catch (error) {
        res.status(500).json('something went wrong!');
    }
});


module.exports = router;