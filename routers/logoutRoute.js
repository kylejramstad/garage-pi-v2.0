'use strict';

const express = require('express');
const router = express.Router();

const auth = require('./auth.js');
const controller = require('../controllers/logoutController.js');

router.get('/logout', auth.auth, controller.logout);

module.exports = router;