'use strict';

const pinsController = require('./pinsController.js');
const logController = require('./logController.js');
const assistantController = require('./assistantController.js');
const usersController = require('./usersController.js');
const timerController = require('./timerController.js');
const notificationController = require('./notificationController.js');

const settings = function(req, res) {
	res.render('settings.ejs', {version:process.env.npm_package_version});
};

const usersGet = usersController.usersGet;
const usersPost = usersController.usersPost;

const assistantGet = assistantController.assistantGet;
const assistantPost = assistantController.assistantPost;

const logsGet = logController.logsGet;
const logsPost = logController.logsPost;

const timerGet = timerController.timerGet;
const timerPost = timerController.timerPost;

const pinsGet = pinsController.pinsGet;
const pinsPost = pinsController.pinsPost;

const notificationGet = notificationController.notificationGet;
const notificationPost = notificationController.notificationPost;

module.exports = {settings,pinsGet,pinsPost,logsGet,logsPost,assistantGet,assistantPost,usersGet,usersPost,timerGet,timerPost,notificationGet,notificationPost};