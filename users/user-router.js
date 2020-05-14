'use strict'

let selectionFields = 'id firstname lastname username password email';
const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const deleteRouter = express.Router();
const createRouter = express.Router();
const User = require('./../users/user-model');
const Sequelize = require('sequelize');
const serverPk = require('../certs/serverSecret').PrivateKey;
const salt = require('../certs/serverSecret').Salt;
const key = crypto.scryptSync(serverPk, salt, 24);
const algorithm = 'aes-192-cbc';
const ivlength = 16;
const iv = crypto.randomBytes(ivlength);

async function selectBy(req, res, next) {
    try {
        let id = req.params.id
        var user;
        if(isNaN(id)){
            user = await User.findAll({
                where: {
                    username: id
                }
            }, selectionFields);
        }else{
        user = await User.findAll({
            where: {
                id: id
            }
        }, selectionFields);
        }
        if (user.length == 0 || user == undefined){
            res.status(400).json('No user with this id or username!');
            return;
        }
        req.selectedUser = user;
    } catch (error) {
        console.log(error);
        res.status(500).send('something went wrong');
    }
    next();
}

router.get('/' ,async (req, res) => {
    try {
        const users = await User.findAll({}, selectionFields);
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json('something went wrong!' + error);
    }
});

router.get('/:id', selectBy, async (req, res) => {
    res.status(200).json(req.selectedUser);
});

createRouter.post('/', async (req, res) => {
    let payload = req.body;
    if (Object.keys(payload).length != 5) {
        res.status(400).json('Too much or less properties!');
        return;
    }

    if (payload.firstname == undefined || payload.lastname == undefined ||
        payload.username == undefined || payload.password == undefined || payload.email == undefined) {
        res.status(400).json('User properties are not allowed to be undefined!');
        return;
    }


    if (typeof (payload.firstname) != 'string' || typeof (payload.lastname) != 'string' ||
        typeof (payload.username) != 'string' || typeof (payload.password) != 'string' || typeof (payload.email) != 'string') {
        res.status(400).json('not typeof string');
        return;
    }

    let usernameDatenbank = payload.username;
    let password = crypto.createHash('sha256').update(payload.password).digest('base64');
    payload.password = password;

    try {
        const user = await User.findAll({
            where: {
                username: usernameDatenbank
            }
        }, selectionFields);
        if (user.length > 0) {
            res.status(400).send('User already exists');
            return;
        }
        const savedUser = await User.create({
            firstname: payload.firstname,
            lastname: payload.lastname,
            username: payload.username,
            password: payload.password,
            email: payload.email
        }, selectionFields);
        res.status(201).json(savedUser);
    } catch (error) {
        console.error(error);
        res.status(400).json('creating user did not work!' + error);
    }
});

createRouter.post('/changePassword', async (req, res) => {
    let payload = req.body;
    if (Object.keys(payload).length != 3) {
        res.status(400).json('Too much or less properties!');
        return;
    }

    if (payload.username == undefined || payload.oldPassword == undefined || payload.newPassword == undefined) {
        res.status(400).json('User properties are not allowed to be undefined!');
        return;
    }


    if (typeof (payload.username) != 'string' || typeof (payload.oldPassword) != 'string' || typeof (payload.newPassword) != 'string') {
        res.status(400).json('not typeof string');
        return;
    }

    let oldpassword = crypto.createHash('sha256').update(payload.oldPassword).digest('base64');
    payload.oldPassword = oldpassword;
    try {
        const user = await User.findAll({
            where: Sequelize.and({
                username: payload.username,
                password: payload.oldPassword
            })
        }, selectionFields);
        if (user.length != 1) {
            res.status(404).json('No user with these credential are found!');
            return;
        }
        let newPassword = crypto.createHash('sha256').update(payload.newPassword).digest('base64');
        const savedUser = await user[0].update({
            password: newPassword
        });
        res.status(200).json(savedUser);
    } catch (error) {
        console.error(error);
        res.status(400).json('creating user did not work!');
    }
});
createRouter.put('/:id', selectBy, async (req, res) => {
    let toUpdateUser = req.body;
    //by default you can not iterate mongoose object -
    if (req.selectedUser.length == 0) {
        res.status(400).json('no user with this id!');
        return;
    }
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
                password: toUpdateUser.password,
                email: toUpdateUser.email
            });
            res.status(200).json(savedUser);
        } catch (error) {
            console.log(error);
            res.status(500).json('something went wrong');
        }
    }
});

router.delete('/:id', selectBy, async (req, res) => {
    try {
        const user = req.selectedUser[0].destroy();
        res.status(204).json('User was deleted successfully');
    } catch (error) {
        res.status(500).json('something went wrong!');
    }
});

deleteRouter.delete('/deleteAll', async (req, res) => {
    try {
            const data = await User.findAll({});
            console.log(data);
            for (let i = 0; i < data.length; i++) {
                console.log(data[i]);
                await data[i].destroy();
            }
            res.status(204).json('allUserdeleted!');
    } catch (error) {
        res.status(500).json('something went wrong!');
    }
});
module.exports = router;
module.exports.deleteAllUser = deleteRouter;
module.exports.createUser = createRouter;