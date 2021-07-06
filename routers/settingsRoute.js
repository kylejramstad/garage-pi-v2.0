'use strict';

const express = require('express');
const router = express.Router();

const auth = require('./auth.js');
const controller = require('../controllers/settingsController.js');

router.get('/', auth.auth, controller.settings);
router.get('/pins', auth.auth, controller.pinsGet);
router.post('/pins', auth.auth, controller.pinsPost);
router.get('/logs', auth.auth, controller.logsGet);
router.post('/logs', auth.auth, controller.logsPost);
router.get('/assistant', auth.auth, controller.assistantGet);
router.post('/assistant', auth.auth, controller.assistantPost);
router.get('/users', controller.usersGet); //No middleware so first user can create a user
router.post('/users', controller.usersPost); //No middleware so first user can create a user
router.get('/timer', auth.auth, controller.timerGet);
router.post('/timer', auth.auth, controller.timerPost);
router.get('/notification', auth.auth, controller.notificationGet);
router.post('/notification', auth.auth, controller.notificationPost);

module.exports = router;