'use strict';

const pinsController = require('./pinsController.js');
const log = require('./logController.js');
const notificationController = require('./notificationController.js');
const gpiox = require("@iiot2k/gpiox");
const loginController = require('./loginController.js');
const crypto = require('crypto');

const status = function (req, res){
	res.writeHead(200, {
		Connection: 'keep-alive',
		'Content-Encoding': 'none',
		'Cache-Control': 'no-cache',
		'Content-Type': 'text/event-stream',
  	});
	
	var startStatus = pinsController.getState();
	var data = {"garageState":startStatus};
	res.write('data: '+ JSON.stringify(data)+'\n\n');

	var interval = setInterval(function(){
		var newStatus = pinsController.getState();
		if(JSON.stringify(startStatus) != JSON.stringify(newStatus)){
			var data = {"garageState":newStatus};
			res.write('data: '+ JSON.stringify(data)+'\n\n');
			startStatus = pinsController.getState();
		}
	},100);
        
    res.on('close', () => {
	    clearInterval(interval);
		res.write("event: closedConnection\n");
		res.write("data: ");
		res.write("\n\n");
		res.end();
    });
};

const logs = function (req, res){
	res.writeHead(200, {
		Connection: 'keep-alive',
		'Content-Encoding': 'none',
		'Cache-Control': 'no-cache',
		'Content-Type': 'text/event-stream',
  	});

	var startData = {rows:log.getLogs().reverse()};
	res.write('data: '+ JSON.stringify(startData)+'\n\n');
	
	var interval = setInterval(function(){
		var newData = {rows:log.getLogs().reverse()};
		if(JSON.stringify(startData) != JSON.stringify(newData)){
			res.write('data: '+ JSON.stringify(newData)+'\n\n');
			startData = {rows:log.getLogs().reverse()};
		}
	},100);
        
    res.on('close', () => {
    	clearInterval(interval)
		res.write("event: closedConnection\n");
		res.write("data: ");
		res.write("\n\n");
		res.end();
    });
};

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
	pinsController.writePin(pinsController.getRelayPin(), 0);
	setTimeout(function() {
		pinsController.writePin(pinsController.getRelayPin(), 1);
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
	},500);
}

const assistant = function(req, res) { //Google Assistant API Call. Used with IFTTT
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
	res.end();
}

module.exports = {status, logs, relay, assistant, buttonPress};