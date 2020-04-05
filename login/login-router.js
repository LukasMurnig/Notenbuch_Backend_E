'use strict'

let selectionFields = '_id firstname lastname username password state';
const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const User = require('./../users/user-model');
const Sequelize = require('sequelize');
const serverPk = require('../certs/serverSecret').PrivateKey;
const salt = require('../certs/serverSecret').Salt;
const key = crypto.scryptSync(serverPk, salt, 24);
const algorithm = 'aes-192-cbc';
const ivlength = 16;
const iv = crypto.randomBytes(ivlength);

router.post('/login', async (req, res, next) => {
    let payload = req.body;
    if (Object.keys(payload).length != 2) {
        res.status(401).send('you are not authorised');
        return;
    }
    if (payload.username == undefined || payload.password == undefined) {
        res.status(401).send('you are not authorised');
        return;
    }

    if (typeof (payload.username) != 'string' || typeof (payload.password) != 'string') {
        res.status(401).send('you are not authorised');
        return;
    }
    let usernameDatenbank = payload.username;
    let passwordDatenbank = crypto.createHash('sha256').update(payload.password).digest('base64');
    try {
        const user = await User.findAll({
            where: Sequelize.and({
                username: usernameDatenbank,
                password: passwordDatenbank
            })
        }, selectionFields);
        if (user.length != 1) {
            res.status(401).send('you are not authorised');
            return;
        }
        let temp = {
            "id": user[0].id,
            "username": user[0].username,
            "expire": Date.now() + 300000
        };
        let token = generateToken(JSON.stringify(temp));
        res.status(200).send({ 'token': token });
    } catch (error) {
        console.log(error);
        res.status(401).send('you are not authorised');
        return;
    }
});

router.get('/whoamI', (req, res) => {
    res.status(200).send(req.user);
})
function generateToken(userstring) {
    //to do: improve later
    let mykey = crypto.createCipheriv(algorithm, key, iv);
    let mystr = mykey.update(userstring, 'utf8', 'hex');
    mystr += mykey.final('hex');
    let token = mystr;
    return token;
}

module.exports = router;