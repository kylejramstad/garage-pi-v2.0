'use strict';

const express = require('express');
const router = express.Router();

const auth = require('./auth.js');
const controller = require('../controllers/apiController.js');

//API calls//
router.get('/status', auth.auth, controller.status);
router.get('/logs', auth.auth, controller.logs);
router.get('/relay', auth.auth, controller.relay);
router.get('/assistant', controller.assistant);

module.exports = router;