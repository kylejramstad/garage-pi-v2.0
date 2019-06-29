'use strict';

const express = require('express');
const rpio = require('rpio');
const https = require('https');
const fs = require('fs')
const favicon = require('express-favicon');
const login = require('./login.js');
const log = require('./log.js');
const crypto = require('crypto');
const helmet = require('helmet')
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const bodyParser = require('body-parser');
const owasp = require('owasp-password-strength-test');


const app = express();

//Middleware//
app.use(favicon(__dirname + '/assets/icons/icon-72x72.png'));
app.use(helmet.noCache())
app.use(session({
	store: new FileStore,
    secret: 'D0-y0u-think-anyone-can-guess',
    resave: true,
    saveUninitialized: false,
    cookie: { maxAge: 31536000000 }
}));
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies


// Authentication and Authorization Middleware
var auth = function(req, res, next) {
  if (req.session && req.session.admin) //if signed in then continue
    return next();
  else
    return res.redirect('/login'); //redirect to login page
};


// RPIO PIN Config
// default: 13-close, 19-open, 11-relay
const openPin = process.env.OPEN_PIN || 19;
const closePin = process.env.CLOSE_PIN || 13;
const relayPin = process.env.RELAY_PIN || 11;

rpio.open(openPin, rpio.INPUT, rpio.PULL_UP);
rpio.open(closePin, rpio.INPUT, rpio.PULL_UP);
rpio.open(relayPin, rpio.OUTPUT, rpio.HIGH);


//Endpoints
app.get('/', auth, function(req, res) {
	var create = false;
	var deleted = false;
	if(req.query.create == 'true'){
		create = true;
	}
	if(req.query.deleted == 'true'){
		deleted = true;
	}
    res.render('index.ejs', {log: log.getLogs(),create:create,deleted:deleted});
});

app.get('/settings', auth, function(req, res) {
    res.render('settings.ejs');
});

app.get('/settings/cert', auth, function(req, res) {
    res.render('certDownload.ejs');
});

app.get('/settings/cert/download', auth, function(req, res){
  	const file = __dirname + '/ssl/server.cer';
  	res.download(file,'certificate.cer');
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
       	var hash = crypto.pbkdf2Sync(password, salt+username, 1000, 64, `sha512`).toString(`hex`);
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
	res.render('logs.ejs');
});

app.post('/settings/logs', auth, function(req, res){
	var number = parseInt(req.body.number, 10);
	
	if(!(number < 0 || number > 1000)){
		log.setSize(number);
		res.render('logs.ejs', {success: true});
	}
	else{
		res.render('logs.ejs', {error: true});
	}
});

app.get('/settings/assistant', auth, function(req, res){
	res.render('assistant.ejs');
});

app.post('/settings/assistant', auth, function(req, res){
	var username = "assistant";
	var password = login.genRandomString(15);
	login.addUser(username,password);
	res.render('assistant.ejs', {username: username, password: password});
});

app.get('/settings/users', function(req, res){ //does not use the auth() middleware so we can check for first login as well
	if ((req.session && req.session.admin) || login.isFirst()){ // If logged in or first time user
		if(req.query.type == 'create'){
			res.render('userCreate.ejs');
		}
		else if(req.query.type == 'delete'){
			res.render('userDelete.ejs');
		}
		else if(req.query.type == 'change'){
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
		if(req.query.type == 'create'){
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
		else if(req.query.type == 'delete'){
			var username1 = req.body.username1;
        	var username2 = req.body.username2;
        	if(login.getUser(username) && username1 == username2 && username1 != req.session.user && username2 != req.session.user && username1 != "first"){
        		login.deleteUser(username1);
            	res.redirect('/?deleted=true');
        	}
        	else{
        		res.render('userDelete.ejs', {error: true});
        	}
		}
		else if(req.query.type == 'change'){
			var username = req.session.user;
			var passwordOriginal = req.body.passwordOriginal;
			var passwordNew1 = req.body.passwordNew1;
			var passwordNew2 = req.body.passwordNew2;
			
	       	var salt = login.getUser(username).salt;
    	   	var hashCheck = crypto.pbkdf2Sync(passwordOriginal, salt+username, 1000, 64, `sha512`).toString(`hex`);

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
	    var hash = crypto.pbkdf2Sync(password, salt+username, 1000, 64, `sha512`).toString(`hex`);
	    if(login.getUser(username).hash == hash && ((req.query.open && !rpio.read(closePin))||(req.query.close && !rpio.read(openPin)))){
			
			log.addLog(username);
	
	        rpio.write(relayPin, rpio.LOW);
	        setTimeout(function() {
	            rpio.write(relayPin, rpio.HIGH);
	            res.send('done');
	        }, 1000);
	
	    }
	}
});


//API calls
app.get('/status', auth, function(req, res) { //For the react components to read the GPIO PINS
  res.send(JSON.stringify(getState()));
});

function getState() {
  return {
    open: !rpio.read(openPin),
    close: !rpio.read(closePin)
  }
}

app.get('/relay', auth, function(req, res) {   //Open or Close garage with the relay
   	var username = req.session.user;
   	
   	log.addLog(username);

  	// Simulate a button press
  	rpio.write(relayPin, rpio.LOW);
  	setTimeout(function() {
    	rpio.write(relayPin, rpio.HIGH);
    	res.send('done');
  	}, 1000);
});

//give pages access to the assets folder for JS and CSS files
app.use('/assets', express.static('assets'))

//To catch all false routes and redirect them back to the home page
app.use(function(req, res, next){
    res.status(404).redirect('/');
});

//Start App with HTTPS
https.createServer({
  key: fs.readFileSync('ssl/server.key'),
  cert: fs.readFileSync('ssl/server.cer')
}, app).listen(443, () => {
  console.log('Listening...')
})