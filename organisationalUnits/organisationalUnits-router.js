'use strict'

let selectionFields = 'id label pupil_group_label subject_label from till notes owner period_label';
const express = require('express');
const router = express.Router();
const deleteRouter = express.Router();
const Period = require('../periods/period-model');
const OrganisationalUnit = require('./organisationalUnit-model');
const User = require('./../users/user-model');
const Sequelize = require('sequelize');
const days = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];
async function selectBy(req, res, next) {
    try {
        let id = req.params.id;
        var OU;
        if (isNaN(id)) {
            OU = await OrganisationalUnit.findAll({
                where: {
                    label: id
                }
            }, selectionFields);
        } else {
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
    if (Object.keys(payload).length != 8) {
        res.status(400).json('Too much or less properties!');
        return;
    }

    if (payload.label == undefined || payload.pupil_group_label == undefined || payload.subject_label == undefined ||
        payload.from == undefined || payload.till == undefined ||
        payload.day == undefined || payload.notes == undefined || payload.period_label == undefined) {
        res.status(400).json('period properties are not allowed to be undefined!');
        return;
    }


    if (typeof (payload.label) != 'string' || typeof (payload.pupil_group_label) != 'string' || typeof (payload.subject_label) != 'string'
        || typeof (payload.from) != 'string' || typeof (payload.till) != 'string' || 
        typeof(payload.day) != 'string' || typeof (payload.notes) != 'string' || typeof (payload.period_label) != 'string') {
        res.status(400).json('not typeof string or boolean');
        return;
    }

    let success = checkvalidFromTill(payload.from, payload.till);

    if (success == false) {
        res.status(400).json('from is not allowed to be greater than till');
        return;
    }

    if(!days.includes(payload.day)){
        res.status(400).json('Is not the day');
        return;
    }

    const ous = await OrganisationalUnit.findAll({
        where: {
            day: payload.day,
        }
    },selectionFields);
    
    for(let indx=0; indx < ous.length; indx++){
       let success = checkvalidDayFromTill(payload.from, payload.till, ous[indx].from, ous[indx].till);

       if(success == false){
           res.status(400).json('Their is already an OU on this day with that time!');
           return;
       }
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
            from: payload.from,
            till: payload.till,
            day: payload.day,
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
    let length = Object.keys(payload).length + 2;
    let toUpdateOU = {
        "id": req.params.id, "label": req.body.label, "pupil_group_label": req.body.pupil_group_label,
        "subject_label": req.body.subject_label, "from": req.body.from, "till": req.body.till, "day": req.body.day,
         "notes": req.body.notes, "owner": req.username, "period_label": req.body.period_label
    };
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
            toUpdateOU.subject_label == undefined || toUpdateOU.from == undefined || toUpdateOU.till == undefined ||
            toUpdateOU.day == undefined || toUpdateOU.notes == undefined || toUpdateOU.period_label == undefined) {
            res.status(400).json('properties does not allowed to be undefined ');
            return;
        }
        //update - now (use the original mongoose-object again)
        for (let key in toUpdateOU) {
            req.selectedOU[key] = toUpdateOU[key];
        }
        let success = checkvalidFromTill(toUpdateOU.from, toUpdateOU.till);

        if (success == false) {
            res.status(400).json('from is not allowed to be greater than till');
            return;
        }

        if(!days.includes(payload.day)){
            res.status(400).json('Is not the day');
            return;
        }
    
        const ous = await OrganisationalUnit.findAll({
            where: {
                day: payload.day,
            }
        },selectionFields);
        
        for(let indx=0; indx < ous.length; indx++){
           let success = checkvalidDayFromTill(payload.from, payload.till, ous[indx].from, ous[indx].till);
    
           if(success == false){
               res.status(400).json('Their is already an OU on this day with that time!');
               return;
           }
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
                from: toUpdateOU.from,
                till: toUpdateOU.till,
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

function checkvalidFromTill(from, till) {
    let hourFrom = parseInt(from.split(':')[0]);
    let minuteFrom = parseInt(from.split(':')[1]);
    let hourTill = parseInt(till.split(':')[0]);
    let minuteTill = parseInt(till.split(':')[1]);

    if (hourFrom > hourTill) {
        return false;
    } else if (hourFrom == hourTill) {
        if (minuteFrom >= minuteTill) {
            return false;
        }
    }
    return true;
}

function checkvalidDayFromTill(fromCreate, tillCreate, FromDB, TillDB){
    let hourfromCreate = parseInt(fromCreate.split(':')[0]);
    let minutefromCreate = parseInt(fromCreate.split(':')[1]);
    let hourtillCreate = parseInt(tillCreate.split(':')[0]);
    let minutetillCreate = parseInt(tillCreate.split(':')[1]);
    let hourfromDB = parseInt(FromDB.split(':')[0]);
    let minutefromDB = parseInt(FromDB.split(':')[1]);
    let hourtillDB = parseInt(TillDB.split(':')[0]);
    let minutetillDB = parseInt(TillDB.split(':')[1]);

    if(hourfromCreate < hourfromDB && hourtillCreate > hourfromDB ){
        return false;
    }

    if(hourfromCreate > hourfromDB && hourtillDB > hourfromCreate){
        return false;
    }

    if(hourfromCreate == hourtillDB){
        if(minutefromCreate < minutetillDB){
            return false;
        }
    }

    if(hourtillCreate == hourfromDB){
        if(minutefromDB < minutetillCreate){
            return false;
        }
    }
    return true;
}

module.exports = router;
module.exports.deleteAllOU = deleteRouter;