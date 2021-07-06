'use strict';

const express = require('express');
const router = express.Router();

const auth = require('./auth.js');
const controller = require('../controllers/indexController.js');

router.get('/', auth.auth, controller.index);

module.exports = router;