'use strict'

let selectionFields = 'id label pupil_group_label subject_label notes owner pupil_label';
const express = require('express');
const router = express.Router();
const deleteRouter = express.Router();
const Pupil = require('../pupils/pupil-model');
const OrganisationalUnit = require('../organisationalUnits/organisationalUnit-model');
const Sequelize = require('sequelize');
async function selectBy(req, res, next) {
    try {
        let id = req.params.id;
        var pupil;
        if(isNaN(id)){
            pupil = await Pupil.findAll({
                where: {
                    identifier: id
                }
            }, selectionFields);
        }else{
        pupil = await Pupil.findAll({
            where: {
                id: id
            }
        }, selectionFields);
        }
        if (pupil.length == 0) {
            res.status(400).json('no pupil with this id or identifier!');
            return;
        }
        req.selectedPupil = pupil;
    } catch (error) {
        console.log(error);
        res.status(500).json('something went wrong');
        return;
    }
    next();
}

router.get('/', async (req, res) => {
    try {
        const pupils = await Pupil.findAll({}, selectionFields);
        res.status(200).json(pupils);
    } catch (error) {
        res.status(500).json('something went wrong!' + error);
    }
});

router.get('/:id', selectBy, async (req, res) => {
    res.status(200).json(req.selectedPupil);
});

router.post('/', async (req, res) => {
    let payload = req.body;
    if (Object.keys(payload).length != 6) {
        res.status(400).json('Too much or less properties!');
        return;
    }

    if (payload.identifier == undefined || payload.birthdt == undefined || payload.firstname == undefined || payload.lastname == undefined
        || payload.notes == undefined || payload.mail == undefined) {
        res.status(400).json('pupil properties are not allowed to be undefined!');
        return;
    }


    if (typeof (payload.identifier) != 'string' || typeof (payload.birthdt) != 'string' || typeof (payload.firstname) != 'string'
        || typeof (payload.lastname) != 'string' || typeof (payload.notes) != 'string' || typeof (payload.mail) != 'string') {
        res.status(400).json('not typeof string or boolean');
        return;
    }

    if (new Date(payload.birthdt) == "Invalid Date" || isNaN(new Date(payload.birthdt))){
        res.status(400).json('birthdt are not valid for Date type');
            return;
    }

    try {
        
        const savedPupil = await Pupil.create({
            identifier: payload.identifier,
            birthdt: new Date(payload.birthdt),
            firstname: payload.firstname,
            lastname: payload.lastname,
            notes: payload.notes,
            mail: payload.mail
        });
        const pupiltoSend = await Pupil.findAll({
            where: Sequelize.and({
                identifier: payload.identifier,
                mail: payload.mail
            })
        });
        res.status(201).json(pupiltoSend);
    } catch (error) {
        console.log(error);
        res.status(400).json('creating Pupil did not work!');
    }
});

router.put('/:id', selectBy, async (req, res) => {
    let payload = req.body;
    let length = Object.keys(payload).length +1;
    let toUpdatepupil = {"id": req.params.id, "identifier": req.body.identifier, "birthdt": req.body.birthdt, "firstname": req.body.firstname,
    "lastname": req.body.lastname,"notes": req.body.notes, "mail": req.body.mail};
    //by default you can not iterate mongoose object -
    let comparepupil = JSON.parse(JSON.stringify(req.selectedPupil));
    //check all properties
    if (Object.keys(comparepupil[0]).length != length) {
        res.status(400).json('number of properties in object not valid');
        return;
    }
    if (Object.keys(payload).some(k => { return comparepupil[0][k] == undefined })) {
        res.status(400).json('properties of object do not match');
        return;
    } else {
        if (toUpdatepupil.id == undefined || toUpdatepupil.identifier == undefined || toUpdatepupil.birthdt == undefined ||
            toUpdatepupil.firstname == undefined || toUpdatepupil.lastname == undefined || toUpdatepupil.notes == undefined || toUpdatepupil.mail == undefined){
                res.status(400).json('properties are do not allowed to be undefined');
                return;
            }
        //update - now (use the original mongoose-object again)
        for (let key in toUpdatepupil) {
            req.selectedPupil[key] = toUpdatepupil[key];
        }
        try {
            
            const savedpupil = await req.selectedPupil[0].update({
                identifier: toUpdatepupil.identifier,
                birthdt: toUpdatepupil.birthdt,
                firstname: toUpdatepupil.firstname,
                lastname: toUpdatepupil.lastname,
                notes: toUpdatepupil.notes,
                mail: toUpdatepupil.mail
            });
            res.status(200).json(savedpupil);
        } catch (error) {
            console.log(error);
            res.status(500).json('something went wrong');
        }
    }
});


router.delete('/:id', selectBy, async (req, res) => {
    try {
        req.selectedPupil[0].destroy();
        res.status(204).json('pupil was deleted successfully');
    } catch (error) {
        res.status(400).json('something went wrong!');
    }
});

deleteRouter.delete('/deleteAll', async (req, res) => {
    try {
            const data = await Pupil.findAll({});
            for (let i = 0; i < data.length; i++) {
                await data[i].destroy();
            }
            res.status(204).json('allPupilsdeleted!');
    } catch (error) {
        res.status(500).json('something went wrong!');
    }
});

module.exports = router;
module.exports.deleteAllPupil = deleteRouter;