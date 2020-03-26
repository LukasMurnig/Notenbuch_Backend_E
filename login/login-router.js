'use strict'

let selectionFields = '_id firstname lastname username password state';
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

router.post('/login', (req, res, next) => {
    res.status(201).json('Everything fine');
});

module.exports = router;