'use strict'

const selectionFieldsOU = 'id label pupil_group_label subject_label notes owner period_label';
const selectionFieldsPupil = 'id label pupil_group_label subject_label notes owner mail';
const selectionFields = 'id OULabel PIdentifier';
const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize');
const OrganisationalUnit = require('../../organisationalUnits/organisationalUnit-model');
const Pupil = require('../../pupils/pupil-model');
const PupilTOOrganisationalUnit = require('./PupilToOU-model');

async function selectById(req, res, next){
    let id = req.params.id;
    try{
        if (id == 'deleteAll'){
            deleteAll(req, res);
            return;
        }else{
        let PToOu = await PupilTOOrganisationalUnit.findAll({
            where:{
                id: id
            }
        });
        }
        if(PToOu.length == 0){
            req.status(404).send('No Pupil To Ou with that id!');
            return;
        }

        req.selectedPToOu = PToOu;
        next();
    }catch(error){
        console.log(error);
        res.status(500).send('something went wrong in getPupilOU');
        return;
    }
}
async function getPupilOU(req, res, next){
    let value = req.params.id;
    try{
        const ou = await OrganisationalUnit.findAll({
            where: {
                label: value
            }
        }, selectionFieldsOU);
    
        if( ou.length == 0){
    
        const pupil = await Pupil.findAll({
            where: {
                identifier: value
            }
        }, selectionFieldsPupil);
    
        if(pupil.length == 0){
            res.status(404).send('Their is no Pupil and OrganisationalUnit with that Label/Identifier');
            return;
        }else{
           req.object = pupil;
        }
    }else{
        req.object = ou;
    }
    next();
    }catch(error){
        console.log(error);
        res.status(500).send('something went wrong in getPupilOU');
        return;
    }
}

async function getAllOU(req, res, next){
    let identifier = req.params.identifier;

    const PupilToOU = await PupilTOOrganisationalUnit.findAll({
        where: {
            PIdentifier: identifier
        }
    });

    if(PupilToOU.length == 0){
        res.status(404).send('Their is no OU with that Pupil');
        return;
    }
    var organisationalUnits = [];
    for(let index=0;index < PupilToOU.length; index++){
        let value = PupilToOU[index];
        organisationalUnits[index] = await OrganisationalUnit.findAll({
            where: {
                label: value.OULabel
            }
        });
    }
    req.OU = organisationalUnits;
    next();
}

async function getAllPupil(req, res, next){
    let label = req.params.label;

    const PupilToOU = await PupilTOOrganisationalUnit.findAll({
        where: {
            OULabel: label
        }
    });

    if( PupilToOU.length == 0){
        res.status(404).send('Their is no OrganisationalUnit with this Label');
        return;
    }
    var pupils = [];
    for(let index=0;index < PupilToOU.length; index++){
        let value = PupilToOU[index];
        pupils[index] = await Pupil.findAll({
            where: {
                identifier: value.PIdentifier
            }
        });
    }

    req.Pupil = pupils;
    next();
}

router.get('/:id', getPupilOU, (req, res)=>{
    res.status(200).send(req.object);
});

router.get('/getOUFromPupil/:identifier', getAllOU, (req, res) =>{
    res.status(200).send(req.OU);
});

router.get('/getPupilFromOU/:label', getAllPupil, (req, res)=>{
   res.status(200).send(req.Pupil); 
});

router.post('/addPupilToOU', async (req, res) =>{
    try{
    let payload = req.body;
    
    if (Object.keys(payload).length != 2) {
        res.status(400).json('Too much or less properties!');
        return;
    }

    if(payload.OULabel == undefined || payload.PIdentifier == undefined){
        res.status(400).send('Organisational Label or Pupil Identifier are not allowed to be undefined');
        return;
    }

    if(typeof(payload.OULabel) != 'string' || typeof(payload.PIdentifier) != 'string'){
        res.status(400).send('Organisational Label and Pupil Identifier have to be type of string');
        return;
    }

    const organisationalUnit = await OrganisationalUnit.findAll({
        where: {
            label: payload.OULabel
        }
    }, selectionFieldsOU);

    if( organisationalUnit.length == 0){
        res.status(404).send('Their is no OrganisationalUnit with that Label');
        return;
    }

    const pupil = await Pupil.findAll({
        where: {
            identifier: payload.PIdentifier
        }
    }, selectionFieldsPupil);

    if(pupil.length == 0){
        res.status(404).send('Their is no Pupil with that Identifier');
        return;
    }

    const OuToPupil = await PupilTOOrganisationalUnit.create({
        OULabel: payload.OULabel,
        PIdentifier: payload.PIdentifier
    },selectionFields);

    res.status(200).send('successful to add Pupil to OrganisationalUnit');
    }catch(error){
        console.log(error);
        res.status(500).send('something went wrong by adding Pupil to OU');
        return;
    }
});

router.post('/getIdForOU', async (req, res)=>{
    try{
        let payload = req.body;
        
        if (Object.keys(payload).length != 2) {
            res.status(400).json('Too much or less properties!');
            return;
        }
    
        if(payload.OULabel == undefined || payload.PIdentifier == undefined){
            res.status(400).send('Organisational Label or Pupil Identifier are not allowed to be undefined');
            return;
        }
    
        if(typeof(payload.OULabel) != 'string' || typeof(payload.PIdentifier) != 'string'){
            res.status(400).send('Organisational Label and Pupil Identifier have to be type of string');
            return;
        }
    
        const organisationalUnit = await OrganisationalUnit.findAll({
            where: {
                label: payload.OULabel
            }
        }, selectionFieldsOU);
    
        if( organisationalUnit.length == 0){
            res.status(404).send('Their is no OrganisationalUnit with that Label');
            return;
        }
    
        const pupil = await Pupil.findAll({
            where: {
                identifier: payload.PIdentifier
            }
        }, selectionFieldsPupil);
    
        if(pupil.length == 0){
            res.status(404).send('Their is no Pupil with that Identifier');
            return;
        }
    
        const OuToPupil = await PupilTOOrganisationalUnit.findAll({
            where: Sequelize.and({
                OULabel: payload.OULabel,
                PIdentifier: payload.PIdentifier
            })
        },selectionFields);
        
        res.status(200).json(OuToPupil[0]);
        }catch(error){
            console.log(error);
            res.status(500).send('something went wrong by adding Pupil to OU');
            return;
        }
});

router.delete('/:id', selectById, async (req, res) =>{
    try{
    req.selectedPToOu[0].destroy();
    res.status(204).send('Pupil To OU was deleted successfully!');
    }catch(error){
        console.log(error);
        res.status(500).send('something went wrong in delete Pupil To Ou!');
    }
});

async function deleteAll(req, res){
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
}

module.exports = router;