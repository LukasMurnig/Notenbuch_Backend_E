'use strict'

let selectionFields = 'label from till active owner organisationalUnit';
const express = require('express');
const router = express.Router();
const deleteRouter = express.Router();
const Period = require('./../periods/period-model');
const User = require('./../users/user-model');
const Sequelize = require('sequelize');
const OrganisationalUnit = require('./../organisationalUnits/organisationalUnit-model');

async function selectBy(req, res, next) {
    try {
        let value = req.params.id
        var period;
        if (isNaN(value)) {
            if (value == 'getActivePeriod') {
                period = await Period.findAll({
                    where: {
                        active: true
                    }
                }, selectionFields);
            } else {
                period = await Period.findAll({
                    where: {
                        label: value
                    }
                }, selectionFields);
            }
        } else {
            period = await Period.findAll({
                where: {
                    id: value
                }
            }, selectionFields);
        }
        if (period.length == 0) {
            res.status(400).json('no period with this id or label!');
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

router.get('/:id', selectBy, async (req, res) => {
    res.status(200).json(req.selectedperiod);
});

router.post('/', async (req, res) => {
    let payload = req.body;
    if (Object.keys(payload).length != 4) {
        res.status(400).json('Too much or less properties!');
        return;
    }

    if (payload.label == undefined || payload.from == undefined || payload.till == undefined || payload.active == undefined
    ) {
        res.status(400).json('period properties are not allowed to be undefined!');
        return;
    }


    if (typeof (payload.label) != 'string' || typeof (payload.from) != 'string' || typeof (payload.till) != 'string'
        || typeof (payload.active) != 'boolean') {
        res.status(400).json('not typeof string or boolean');
        return;
    }
    if (payload.active == true) {
        const period = await Period.findAll({
            where: {
                active: payload.active
            }
        }, selectionFields);
        if (period.length != 0 || period == undefined) {
            res.status(400).json('Their is allready an active Period!');
            return;
        }
    }
    try {
        if (new Date(payload.from) == "Invalid Date" || isNaN(new Date(payload.from)) ||
            new Date(payload.till) == "Invalid Date" || isNaN(new Date(payload.till))) {
            res.status(400).json('from or till are not valid for Date type');
            return;
        }
        const savedperiod = await Period.create({
            label: payload.label,
            from: new Date(payload.from),
            till: new Date(payload.till),
            active: payload.active,
            owner: req.username
        });
        const periodtoSend = await Period.findAll({
            where: Sequelize.and({
                label: payload.label,
                owner: req.username
            })
        });
        res.status(201).json(periodtoSend);
    } catch (error) {
        console.log(error);
        res.status(400).json('creating period did not work!');
    }
});

router.put('/activatePeriod/:id', selectBy, async(req, res)=> {
    let compareperiod = JSON.parse(JSON.stringify(req.selectedperiod));
    const period = await Period.findAll({
        where: {
            active: toUpdateperiod.active
        }
    }, selectionFields);
    period[0].update({
        active: false
    });
    const savedperiod = await req.selectedperiod[0].update({
        active: true
    });

    res.status(200).json(savedperiod);
});

router.put('/:id', selectBy, async (req, res) => {
    let payload = req.body;
    let length = Object.keys(payload).length +2;
    let toUpdateperiod = {
        "id": req.params.id, "label": req.body.label, "from": req.body.from, "till": req.body.till,
        "active": req.body.active, "owner": req.username
    };
    //by default you can not iterate mongoose object -
    let compareperiod = JSON.parse(JSON.stringify(req.selectedperiod));
    //check all properties
    if (length!= Object.keys(req.selectedperiod[0]).length) {
        res.status(400).json('number of properties in object not valid');
        return;
    }
    if (Object.keys(payload).some(k => { return compareperiod[0][k] == undefined })) {
        res.status(400).json('properties of object do not match');
        return;
    } else {
        if (toUpdateperiod.id == undefined || toUpdateperiod.label == undefined || toUpdateperiod.from == undefined ||
            toUpdateperiod.till == undefined || toUpdateperiod.active == undefined){
                res.status(400).json('properties are not allowed to be undefined');
                return;
            }
        //update - now (use the original mongoose-object again)
        for (let key in toUpdateperiod) {
            req.selectedperiod[key] = toUpdateperiod[key];
        }
        try {
            if (toUpdateperiod.active == true) {
                const period = await Period.findAll({
                    where: {
                        active: toUpdateperiod.active
                    }
                }, selectionFields);
                period[0].update({
                    label: period.label,
                    from: new Date(period.from),
                    till: new Date(period.till),
                    active: false
                });
            }
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

router.delete('/:id', selectBy, async (req, res) => {
    try {
        const period = req.selectedperiod[0];
        const OU = await OrganisationalUnit.findAll({
            where: {
                "period_label": req.selectedperiod[0].label
            }
        });
        req.selectedOU = OU;
        for (let indx = 0; indx < req.selectedOU.length; indx++) {
            req.selectedOU[indx].destroy();
        }
        req.selectedperiod[0].destroy();
        res.status(204).json('period was deleted successfully');
    } catch (error) {
        res.status(400).json('something went wrong!');
    }
});
deleteRouter.delete('/deleteAll', async (req, res) => {
    try {
        const data = await Period.findAll({});
        console.log(data);
        for (let i = 0; i < data.length; i++) {
            console.log(data[i]);
            await data[i].destroy();
        }
        res.status(204).json('allPeriodsdeleted!');
    } catch (error) {
        res.status(500).json('something went wrong!');
    }
});

module.exports = router;
module.exports.deleteAllPeriod = deleteRouter;