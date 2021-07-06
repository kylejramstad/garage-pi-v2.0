'use strict';

const bodyParser = require('body-parser');
const crypto = require('crypto');
const express = require('express');
const favicon = require('express-favicon');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const fs = require('fs');
const helmet = require('helmet');
const https = require('https');
const http = require('http');
const nocache = require("nocache");

const databaseController = require('./controllers/databaseController.js');

const api = require('./routers/apiRoute.js');
const index = require('./routers/indexRoute.js');
const login = require('./routers/loginRoute.js');
const loginController = require('./controllers/loginController.js');
const logout = require('./routers/logoutRoute.js');
const settings = require('./routers/settingsRoute.js');

//Create app
const app = express(); 
app.disable('x-powered-by'); //not technically needed because of the use of helmet, but it is recommended

//Middleware//
app.use(helmet());
app.use(nocache());
app.use(favicon(__dirname + '/assets/icons/icon-72x72.png'));
app.use(session({
	store: new FileStore,
	secret: loginController.genRandomString(15),
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

//API Calls//
app.use('/', api);

//User Endpoints//
app.use('/', index);
app.use('/', login);
app.use('/', logout);
app.use('/settings', settings);

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
  console.log('Version: ' + process.env.npm_package_version);
});