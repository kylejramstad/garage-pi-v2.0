'use strict';

const pinsController = require('./pinsController.js');
const logController = require('./logController.js');
const apiController = require('./apiController.js');
const notificationController = require('./notificationController.js');

const JSONdb = require('simple-json-db');
const db = new JSONdb('./databases/timer.json');

var getTime = function(){
	return db.get('time')
}
var setTime = function(time){
	db.set('time',time)
	db.sync();
}

var getOnOff = function(){
	return db.get('onOff')
}
var setOnOff = function(onOff){
	db.set('onOff',onOff)
	db.sync();
}

const timerGet = function(req, res){
	var number = getTime()/60000
	var onOff = getOnOff();
	res.render('timer.ejs', {time:number,onOffSwitch:onOff});
};

const timerPost = function(req, res){
	var newTimer = parseInt(req.body.time,10);
	var newOnOff;
	if(req.body.onoffswitch == "on"){
		newOnOff = "on";
		if(newTimer >=1 && newTimer <= 1440){
			setTime((newTimer*60000));
			setOnOff(newOnOff);
	
			clearInterval(openCheckInterval);
			openCheck();
	
			res.render('timer.ejs', {success:true,time:newTimer,onOffSwitch:newOnOff});
		}
		else{
			res.render('timer.ejs', {success:false,time:"Minutes",onOffSwitch:newOnOff});
		}
	}
	else{ //switch is off so the number of minutes doesn't need checking
		newOnOff = "off";
		setOnOff(newOnOff);
		
		clearInterval(openCheckInterval);
		openCheck();
		
		res.render('timer.ejs', {success:true,time:"off",onOffSwitch:newOnOff});
	}
};

//Checking for how long the garage has been open//
var interval = 100; //How often to check in milliseconds
var openCheckInterval;
var currentTimer = getTime();
var currentOnOff = getOnOff();
var currentState = pinsController.getState();
openCheck();

function openCheck(){

	currentTimer = getTime();
	currentOnOff = getOnOff();
	currentState = pinsController.getState();

	openCheckInterval = setInterval(function (){
		if(currentState.open && currentTimer <= 0 && currentOnOff == 'on'){
			clearInterval(openCheckInterval);
			logController.addLog("Close","Auto Close");
			apiController.buttonPress();
			if(notificationController.getAuto()  == 'on'){
				notificationController.sendAutoClose((getTime()/60000));
			}
			openCheck();
		} 
		else if(currentState.open && currentTimer > 0 && currentOnOff == 'on'){
			currentTimer -= interval;
		}
		else if(currentState.close){
			currentTimer = getTime();
		}
		currentState = pinsController.getState();	
	},interval);
}


module.exports = {timerGet,timerPost}