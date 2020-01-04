'use strict';

const express = require('express');
const rpio = require('rpio');
const https = require('https');
const http = require('http');
const fs = require('fs');
checkDatabases(); //Need to check before the rest of the const are created because they use the databases
const favicon = require('express-favicon');
const login = require('./login.js');
const log = require('./log.js');
const pins = require('./pins.js');
const timer = require('./timer.js');
const notification = require('./notification.js');
const crypto = require('crypto');
const helmet = require('helmet');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const bodyParser = require('body-parser');
const owasp = require('owasp-password-strength-test');

const app = express(); //Create app
app.disable('x-powered-by'); //not technically needed because of the use of helmet, but it is recommended

//Check to see if the databases exist. They wont exist if this is the first time running.
function checkDatabases(){
	if(!fs.existsSync('/code/databases')){ //Create the databases if they don't exist
		fs.mkdir('/code/databases', { recursive: true }, (err) => {
			if (err) return;
		});
		var files = ['logs.json','notification.json','pins.json','timer.json','users.json'];
		files.forEach(element => { 
			fs.copyFile('/code/sample-databases/'+element, '/code/databases/'+element, err => {
				if (err) return;
			});
		}); 
	}
}

//Middleware//
app.use(helmet());
app.use(helmet.noCache());
app.use(favicon(__dirname + '/assets/icons/icon-72x72.png'));
app.use(session({
	store: new FileStore,
	secret: 'D0-y0u-think-anyone-can-guess',
	name: 'sessionId',
	resave: true,
	saveUninitialized: false,
	cookie: { 
		secure: true,
		httpOnly: true,
		maxAge: 31536000000
	}
}));
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// Authentication and Authorization Middleware //Also forces https
var auth = function(req, res, next) {
	if(!req.secure) {
    	return res.redirect(['https://', req.get('Host'), req.baseUrl].join(''));
  	}
  	else{
		if (req.session && req.session.admin) //if signed in then continue
			return next();
		else
			return res.redirect('/login'); //redirect to login page
  	}
};


// RPIO PIN Config
// default: 13-close, 19-open, 11-relay
// get pins from database when starting up
var validPins = [3,5,7,8,10,11,12,13,15,16,18,19,21,22,23,24,26,29,31,32,33,35,36,37,38,40];
var openPinNum;
var closePinNum;
var relayPinNum;
var openPin;
var closePin;
var relayPin;

startPins();

function startPins(){
	openPinNum = pins.getOpenPin();
	closePinNum = pins.getClosePin();
	relayPinNum = pins.getRelayPin();
	openPin = process.env.OPEN_PIN || openPinNum;
	closePin = process.env.CLOSE_PIN || closePinNum;
	relayPin = process.env.RELAY_PIN || relayPinNum;

	rpio.open(openPin, rpio.INPUT, rpio.PULL_UP);
	rpio.open(closePin, rpio.INPUT, rpio.PULL_UP);
	rpio.open(relayPin, rpio.OUTPUT, rpio.HIGH);
}

function setPins(open,close,relay){
	pins.setOpenPin(open);
	pins.setClosePin(close);
	pins.setRelayPin(relay);
}

//Endpoints//
app.get('/', auth, function(req, res) {
	var create = false;
	var deleted = false;
	if(req.query.create == 'true'){
		create = true;
	}
	if(req.query.deleted == 'true'){
		deleted = true;
	}
	res.render('index.ejs', {log: log.getLogs().reverse(),create:create,deleted:deleted});
});

app.get('/settings', auth, function(req, res) {
	res.render('settings.ejs');
});

app.get('/settings/pins', auth, function(req, res) {
	res.render('pins.ejs', {open:openPinNum,close:closePinNum,relay:relayPinNum});
});

app.post('/settings/pins', auth, function(req, res){
	var open = parseInt(req.body.open,10)
	var close = parseInt(req.body.close,10)
	var relay = parseInt(req.body.relay,10)
	
	if(validPins.includes(open) && validPins.includes(close) && validPins.includes(relay)){
		setPins(open,close,relay);
		startPins();
		res.render('pins.ejs', {success:true,open:openPinNum,close:closePinNum,relay:relayPinNum});
	}
	else{
		res.render('pins.ejs', {success:false,open:openPinNum,close:closePinNum,relay:relayPinNum});
	}
	
});

app.get('/login',function(req, res){ //does not use the auth() middleware because users seeing this page are most likely not signed in anyway
	if (req.session && req.session.admin){ //Already signed in. Go to main page
		res.redirect('/');
	}
	else{ //Not signed in
		if(login.isFirst()){ //First time going to the site. Go to create the first user
			res.redirect('/settings/users?type=create');
		}
		else{
			if(req.query.logout == 'true'){ //Just got sent to the login page because user logged out
				res.render('login.ejs', {logout: true});
			}
			else{
				res.render('login.ejs'); //User needs to login
			}
		}
	}
});

app.post('/login', function(req, res) { //Check if username exists then if password matches to the username, otherwise show error to user
	var username = req.body.username;
	if(login.getUser(username)){
		//Username exists
		var password = req.body.password;
		var salt = login.getUser(username).salt;
		var hash = crypto.pbkdf2Sync(password, salt+username, 100000, 64, `sha512`).toString(`hex`);
		if(login.getUser(username).hash == hash){
			//Correct Password
			req.session.user = username; 
			req.session.admin = true;
			req.session.save();
			res.redirect('/');
		}
		else{
			//Password wrong
			res.render('login.ejs', {error: true});
		}
	}
	else{
		//Username does not exist
		res.render('login.ejs', {error: true});
	}
});

app.get('/settings/logs', auth, function(req, res){
	res.render('logs.ejs', {size: log.getSize()});
});

app.post('/settings/logs', auth, function(req, res){
	if(typeof req.body.number !== "undefined"){
		var number = parseInt(req.body.number, 10);
		if(!(number < 0 || number > 1000)){
			log.setSize(number);
			res.render('logs.ejs', {success: true,size: log.getSize()});
		}
		else{
			res.render('logs.ejs', {error: true,size: log.getSize()});
		}
	}
	else{
		log.resetLogs();
		res.render('logs.ejs', {reset: true,size: log.getSize()});
	}
});

app.get('/settings/assistant', auth, function(req, res){
	res.render('assistant.ejs');
});

app.post('/settings/assistant', auth, function(req, res){
	var username = "assistant";
	if(req.query.deleted === 'true'){
		login.deleteUser(username);
		res.render('assistant.ejs', {deleted: true});
	}
	else if(req.query.create === 'true'){ //only other option is to create
		var password = login.genRandomString(15);
		login.addUser(username,password);
		res.render('assistant.ejs', {username: username, password: password});
	}
	else{
		res.render('assistant.ejs');
	}
});


app.get('/settings/users', function(req, res){ //does not use the auth() middleware so we can check for first login as well
	if ((req.session && req.session.admin) || login.isFirst()){ // If logged in or first time user
		if(req.query.type === 'create'){
			res.render('userCreate.ejs');
		}
		else if(req.query.type === 'delete'){
			res.render('userDelete.ejs');
		}
		else if(req.query.type === 'change'){
			res.render('userChange.ejs');
		}
		else{
			res.redirect('/'); //logged in user when to /users without any query
		}
	}
	else{
		res.redirect('/login'); // not signed in or first time user
	}
});

app.post('/settings/users', function(req, res){ //Create the user from the form then redirect the user
	if ((req.session && req.session.admin) || login.isFirst()){ // If logged in or first time user
		if(req.query.type === 'create'){
			var username = req.body.username;
			if(!login.getUser(username) && username != "first" ){ //Create new user as long as the user doesn't exist 
				var password = req.body.password;  
				var password2 = req.body.password2;				  
				var result = owasp.test(password);
				if(password == password2){ //must match
					if(result.strong){ //user made a strong password
						login.addUser(username,password);
						res.redirect('/?create=true');
					}
					else{ //user made a weak password. Reload the page and show the requirements they didn't meet
						res.render('userCreate.ejs', {errors: result.errors});
					}
				}
				else{//did not match
					res.render('userCreate.ejs', {errors: ["Passwords Must Match"]});
				}
			}
			else{ //User already exists
				res.render('userCreate.ejs', {exists: true});
			}
		}
		else if(req.query.type === 'delete'){
			var username1 = req.body.username1;
			var username2 = req.body.username2;
			if(login.getUser(username) && username1 == username2 && username1 != req.session.user && username2 != req.session.user && username1 != "first"){

				res.redirect('/?deleted=true');
			}
			else{
				res.render('userDelete.ejs', {error: true});
			}
		}
		else if(req.query.type === 'change'){
			var username = req.session.user;
			var passwordOriginal = req.body.passwordOriginal;
			var passwordNew1 = req.body.passwordNew1;
			var passwordNew2 = req.body.passwordNew2;
			
			var salt = login.getUser(username).salt;
			var hashCheck = crypto.pbkdf2Sync(passwordOriginal, salt+username, 100000, 64, `sha512`).toString(`hex`);

			if(login.getUser(username).hash == hashCheck && passwordNew1 == passwordNew2){ //Create new user as long as the user doesn't exist					
				var result = owasp.test(passwordNew1);
				if(result.strong){ //user made a strong password
					login.changeUser(username,passwordNew1);
					res.redirect('/?change=true');
				}
				else{ //user made a weak password. Reload the page and show the requirements they didn't meet
					res.render('userChange.ejs', {errors: result.errors});
				}
			}
			else{
				res.render('userChange.ejs', {error: true});
			}
		}
		else{
			res.redirect('/'); //logged in user when to /users without any query
		}
	}
	else{
		res.redirect('/login'); // not signed in or first time user
	}
});
 
app.get('/logout', auth, function (req, res) { // Logout by destroying the session 
  req.session.destroy();
  res.redirect('/login?logout=true')
});

app.get('/assistant', function(req, res) { //Google Assistant API Call. Used with IFTTT
	var username = req.query.username;
	if(login.getUser(username)){
		var password = req.query.password;
		var salt = login.getUser(username).salt;
		var hash = crypto.pbkdf2Sync(password, salt+username, 100000, 64, `sha512`).toString(`hex`);
		if(login.getUser(username).hash == hash && ((req.query.open && getState().close)||(req.query.close && getState().open))){
			
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
});

app.get('/settings/timer', auth, function(req, res){
	var number = timer.getTime()/60000
	var onOff = timer.getOnOff();
	res.render('timer.ejs', {time:number,onOffSwitch:onOff});
});

app.post('/settings/timer', auth, function(req, res){
	var newTimer = parseInt(req.body.time,10);
	var newOnOff;
	if(req.body.onoffswitch == "on"){
		newOnOff = "on";
		if(newTimer >=1 && newTimer <= 1440){
			timer.setTime((newTimer*60000));
			timer.setOnOff(newOnOff);
	
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
		timer.setOnOff(newOnOff);
		
		clearInterval(openCheckInterval);
		openCheck();
		
		res.render('timer.ejs', {success:true,time:"off",onOffSwitch:newOnOff});
	}
});

var autoOnOff = notification.getAuto();
var userOnOff = notification.getOpenClose();
var buttonOnOff = notification.getButton();
var iftttKey = notification.getIFTTTKey();

app.get('/settings/notification', auth, function(req, res){
	autoOnOff = notification.getAuto();
	userOnOff = notification.getOpenClose();
	buttonOnOff = notification.getButton();
	iftttKey = notification.getIFTTTKey()
	
	res.render('notification.ejs', {autoCloseSwitch:autoOnOff,userCloseSwitch:userOnOff,buttonCloseSwitch:buttonOnOff,key:iftttKey});
});

app.post('/settings/notification', auth, function(req, res){
	if(req.body.autoClose == "on"){
		autoOnOff = "on";
	}
	else{ //switch is off
		autoOnOff = "off";
	}
	if(req.body.userClose == "on"){
		userOnOff = "on";
	}
	else{ //switch is off
		userOnOff = "off";	
	}
	if(req.body.buttonClose == "on"){
		buttonOnOff = "on";
	}
	else{ //switch is off
		buttonOnOff = "off";
	}
	
	iftttKey = req.body.key;
	
	notification.setIFTTTKey(iftttKey);
	notification.setAuto(autoOnOff);
	notification.setOpenClose(userOnOff);
	notification.setButton(buttonOnOff);

	res.render('notification.ejs', {success:true,autoCloseSwitch:autoOnOff,userCloseSwitch:userOnOff,buttonCloseSwitch:buttonOnOff,key:iftttKey});
});

//API calls//
app.get('/status', auth, function(req, res) { //For the react components to read the GPIO PINS
  res.send(JSON.stringify(getState()));
});

app.get('/relay', auth, function(req, res) {   //Open or Close garage with the relay
	var username = req.session.user;
	if(getState().open){
		log.addLog("Close",username);
		if(userOnOff == 'on'){
				notification.sendOpenClose("closed",username);
		}
	}
	else if(getState().close){
		log.addLog("Open",username);
		if(userOnOff == 'on'){
				notification.sendOpenClose("opened",username);
		}
	}
	else{
		log.addLog("",username); //just in case the garage was half open/close, we still want to log this
		if(userOnOff == 'on'){
				notification.sendOpenClose("opened/closed",username);
		}
	}
	buttonPress();
	res.end();
});

function getState() {
  return {
	open: !rpio.read(openPin),
	close: !rpio.read(closePin)
  }
}

function buttonPress(){
	clearInterval(check); //Stop checking for button because this was not a button push
	rpio.write(relayPin, rpio.LOW);
	setTimeout(function() {
		rpio.write(relayPin, rpio.HIGH);
		buttonCheck(); //Start checking again
	}, 1000);
}

//Check for when a person using their garage's physical button to open the garage//
var check;
buttonCheck();

function buttonCheck(){
	var startState = getState();
	var newState = getState();
	check = setInterval(function (){
		newState = getState();
		if(startState.open && !newState.open){
			log.addLog("Close",'Button Push');
			if(buttonOnOff == 'on'){
				notification.sendOpenClose("closed","Someone");
			}			
		}
		else if(startState.close && !newState.close){
			log.addLog("Open",'Button Push');
			if(buttonOnOff == 'on'){
				notification.sendOpenClose("opened","Someone");
			}
		}
		startState = getState();
	},100);
}

//Checking for how long the garage has been open//
var interval = 100; //How often to check in milliseconds
var openCheckInterval;
var currentTimer = timer.getTime();
var currentOnOff = timer.getOnOff();
var currentState = getState();
openCheck();

function openCheck(){
	currentTimer = timer.getTime();
	currentOnOff = timer.getOnOff();
	currentState = getState();

	openCheckInterval = setInterval(function (){
		if(currentState.open && currentTimer <= 0 && currentOnOff == 'on'){
			clearInterval(openCheckInterval);
			log.addLog("Close","Auto Close");
			buttonPress();
			if(autoOnOff  == 'on'){
				notification.sendAutoClose((timer.getTime()/60000));
			}
			openCheck();
		} 
		else if(currentState.open && currentTimer > 0 && currentOnOff == 'on'){
			currentTimer -= interval;
		}
		else if(currentState.close){
			currentTimer = timer.getTime();
		}
		currentState = getState();	
	},interval);
}

//Start the app and server//
app.use('/assets', express.static('assets')); //give pages access to the assets folder for JS and CSS files
app.use(express.static(__dirname + '/tls', { dotfiles: 'allow' } )); //Allows for CertBot to do automatic authentication

//To catch all false routes and redirect them back to the home page
app.use(function(req, res, next){
	res.status(404).redirect('/');
});

//Start HTTP App
http.createServer(app).listen(80, () => {
  console.log('Listening...');
});

//Start App with HTTPS
https.createServer({
  key: fs.readFileSync('tls/privkey.pem'),
  cert: fs.readFileSync('tls/fullchain.pem')
}, app).listen(443, () => {
  console.log('Listening...');
});
