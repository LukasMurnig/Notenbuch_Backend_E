'use strict'

let selectionFields = 'id label pupil_group_label subject_label notes owner pupil_label';
const express = require('express');
const router = express.Router();
const Pupil = require('../pupils/pupil-model');
const OrganisationalUnit = require('./organisationalUnit-model');

router.get('/', async (req, res) => {
    try {
        const pupils = await Pupil.findAll({}, selectionFields);
        res.status(200).json(pupils);
    } catch (error) {
        res.status(500).json('something went wrong!' + error);
    }
});

router.get('/:id', selectById, async (req, res) => {
    res.status(200).json(req.selectedpupil);
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

    try {
        
        const savedPupil = await OrganisationalUnit.create({
            identifier: payload.identifier,
            birthdt: new Date(payload.birthdt),
            firstname: payload.firstname,
            lastname: payload.lastname,
            notes: payload.notes,
            mail: payload.mail
        });
        res.status(201).json(savedPupil);
    } catch (error) {
        console.log(error);
        res.status(400).json('creating organisational Unit did not work!');
    }
});


router.delete('/:id', selectById, async (req, res) => {
    try {
        req.selectedpupil[0].destroy();
        res.status(204).json('pupil was deleted successfully');
    } catch (error) {
        res.status(400).json('something went wrong!');
    }
});
