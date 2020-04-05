'use strict'

let selectionFields = 'id firstname lastname username password';
const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const User = require('./../users/user-model');
const serverPk = require('../certs/serverSecret').PrivateKey;
const salt = require('../certs/serverSecret').Salt;
const key = crypto.scryptSync(serverPk, salt, 24);
const algorithm = 'aes-192-cbc';
const ivlength = 16;
const iv = crypto.randomBytes(ivlength);

async function selectById(req, res, next) {
    try {
        let id = req.params.id
        const user = await User.findAll({
            where: {
                id: id
            }
        }, selectionFields);
        req.selectedUser = user;
    } catch (error) {
        console.log(error);
        res.status(500).send('something went wrong');
    }
    next();
}

router.get('/', authenticate, async (req, res) => {
    try {
        const users = await User.findAll({}, selectionFields);
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json('something went wrong!' + error);
    }
});

router.get('/:id', authenticate, selectById, async (req, res) => {
    res.status(200).json(req.selectedUser);
});

router.post('/', async (req, res) => {
    let payload = req.body;
    if (Object.keys(payload).length != 5) {
        res.status(400).json('Too much or less properties!');
        return;
    }

    if (payload.id == undefined || payload.firstname == undefined || payload.lastname == undefined ||
        payload.username == undefined || payload.password == undefined) {
        res.status(400).json('User properties are not allowed to be undefined!');
        return;
    }


    if (typeof (payload.id) != 'string' || typeof (payload.firstname) != 'string' || typeof (payload.lastname) != 'string' ||
        typeof (payload.username) != 'string' || typeof (payload.password) != 'string') {
        res.status(400).json('not typeof string');
        return;
    }

    if (isNaN(payload.id)) {
        res.status(400).json('id is not a number');
        return;
    }
    payload.id = parseInt(payload.id);
    let password = crypto.createHash('sha256').update(payload.password).digest('base64');
    payload.password = password;
    try {
        const savedUser = await User.create({
            id: payload.id,
            firstname: payload.firstname,
            lastname: payload.lastname,
            username: payload.username,
            password: payload.password
        });
        res.status(201).json(savedUser);
    } catch (error) {
        res.status(400).json('creating user did not work!'+error);
    }
});

router.put('/:id', authenticate, selectById, async (req, res) => {
    let toUpdateUser = req.body;
    //by default you can not iterate mongoose object -
    let compareUser = JSON.parse(JSON.stringify(req.selectedUser));
    //check all properties
    if (Object.keys(compareUser[0]).length != Object.keys(toUpdateUser).length) {
        res.status(400).send('number of properties in object not valid');
        return;
    } 
    if (Object.keys(toUpdateUser).some(k => { return compareUser[0][k] == undefined })) {
        res.status(400).send('properties of object do not match');
        return;
    } else {
        //update - now (use the original mongoose-object again)
        for (let key in toUpdateUser) {
            req.selectedUser[key] = toUpdateUser[key];
        }
        try {
            if (req.selectedUser.password != undefined) {
                let key = crypto.createHash('sha256').update(req.selectedUser.password).digest('base64');
                req.selectedUser.password = key;
            }
            const savedUser = await req.selectedUser[0].update({
                firstname: toUpdateUser.firstname,
                lastname: toUpdateUser.lastname,
                password: toUpdateUser.password
            });
            res.status(200).json(savedUser);
        } catch (error) {
            console.log(error);
            res.status(500).json('something went wrong');
        }
    }
});

function authenticate(req, res, next) {
    let token = req.token;
    if (token == undefined) {
        res.status(401).send('you are not authorised');
        return;
    }
    try {
        let mykey = crypto.createDecipheriv(algorithm, key, iv);
        var mystr = mykey.update(token, 'hex', 'utf8')
        mystr += mykey.final('utf8');
        let obj = JSON.parse(mystr);
        if (obj.expire < Date.now()) {
            res.header('WWW-Authenticate', 'Basic realm="Access expired", charset="UTF-8"');
            res.status(401).send('you are not authorised');
            return;
        }
    } catch (error) {
        res.status(401).send('you are not authorised');
        return;
    }
    req.user = mystr;
    next();
}

router.delete('/:id', authenticate, selectById, async (req, res) => {
    try {
        const user = req.selectedUser[0].destroy();
        res.status(204).json('User was deleted successfully');
    } catch (error) {
        res.status(400).json('something went wrong!');
    }
});
module.exports = router;