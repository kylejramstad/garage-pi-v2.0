'use strict';

const pinsController = require('./pinsController.js');
const log = require('./logController.js');
const notificationController = require('./notificationController.js');
const rpio = require('rpio');
const loginController = require('./loginController.js');
const crypto = require('crypto');

const status = function(req, res) { //For the react components to read the GPIO PINS
  res.send(JSON.stringify(pinsController.getState()));
}

const logs = function(req, res) { //For the react components to read the logs
  res.send(JSON.stringify(log.getLogs().reverse()));
}

var userOnOff = notificationController.getOpenClose();
var buttonOnOff = notificationController.getButton();

const relay = function(req, res) {   //Open or Close garage with the relay
	userOnOff = notificationController.getOpenClose();
	buttonOnOff = notificationController.getButton();
	
	var username = req.session.user;
	if(pinsController.getState().open){
		log.addLog("Close",username);
		if(userOnOff == 'on'){
				notificationController.sendOpenClose("closed",username);
		}
	}
	else if(pinsController.getState().close){
		log.addLog("Open",username);
		if(userOnOff == 'on'){
				notificationController.sendOpenClose("opened",username);
		}
	}
	else{
		log.addLog("",username); //just in case the garage was half open/close, we still want to log this
		if(userOnOff == 'on'){
				notificationController.sendOpenClose("opened/closed",username);
		}
	}
	buttonPress();
	res.end();
}

function buttonPress(){
	clearInterval(check); //Stop checking for button because this was not a button push
	rpio.write(pinsController.getRelayPin(), rpio.LOW);
	setTimeout(function() {
		rpio.write(pinsController.getRelayPin(), rpio.HIGH);
		buttonCheck(); //Start checking again
	}, 1000);
}

//Check for when a person using their garage's physical button to open the garage//
var check;
buttonCheck();

function buttonCheck(){
	userOnOff = notificationController.getOpenClose();
	buttonOnOff = notificationController.getButton();

	var startState = pinsController.getState();
	var newState = pinsController.getState();
	check = setInterval(function (){
		newState = pinsController.getState();
		if(startState.open && !newState.open){
			log.addLog("Close",'Button Push');
			if(buttonOnOff == 'on'){
				notificationController.sendOpenClose("closed","Someone");
			}			
		}
		else if(startState.close && !newState.close){
			log.addLog("Open",'Button Push');
			if(buttonOnOff == 'on'){
				notificationController.sendOpenClose("opened","Someone");
			}
		}
		startState = pinsController.getState();
	},100);
}

const assistant = function(req, res) { //Google Assistant API Call. Used with IFTTT
	var createdAt = req.query.time; //Get time the command was created at
	createdAt = createdAt.replace(",", "");
	createdAt = createdAt.replace("at", "\b");
	createdAt = createdAt.slice(0, -2) + " " + createdAt.slice(-2);
	var date = new Date(createdAt);
	var minutes = date.getMinutes();
	
	if (minutes == new Date().getMinutes()){
		var username = req.query.username;
		if(loginController.getUser(username)){
			var password = req.query.password;
			var salt = loginController.getUser(username).salt;
			var hash = crypto.pbkdf2Sync(password, salt+username, 100000, 64, `sha512`).toString(`hex`);
			if(loginController.getUser(username).hash == hash && ((req.query.open && pinsController.getState().close)||(req.query.close && pinsController.getState().open))){
			
				if(req.query.close){
					log.addLog("Close",username);	
				}
				else if(req.query.open){
					log.addLog("Open",username);	
				}
	
				buttonPress();
			}
		}
	}
	res.end();
}

module.exports = {status, logs, relay, assistant, buttonPress};