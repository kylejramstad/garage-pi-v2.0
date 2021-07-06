'use strict';

const loginController = require('./loginController.js');

const crypto = require('crypto');
const owasp = require('owasp-password-strength-test');

const usersGet = function(req, res){ //does not use the auth() middleware so we can check for first login as well
	if ((req.session && req.session.admin) || loginController.isFirst()){ // If logged in or first time user
		if(req.query.type === 'create'){
			if (req.session.csrf === undefined){
				req.session.csrf = crypto.randomBytes(100).toString('base64');
			}
			res.render('userCreate.ejs', {csrf_token:req.session.csrf});
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
};

const usersPost = function(req, res){ //Create the user from the form then redirect the user
	if ((req.session && req.session.admin) || loginController.isFirst()){ // If logged in or first time user
		if(req.query.type === 'create'){
			if(req.body.csrf !== req.session.csrf || !req.body.csrf){
				if (req.session.csrf === undefined){
							req.session.csrf = crypto.randomBytes(100).toString('base64');
				}
				res.render('userCreate.ejs', {csrf_token:req.session.csrf,errors: ["CSRF Tokens Do Not Match"]});
			}
			else{
				var username = req.body.username;
				if(!loginController.getUser(username) && username != "first" ){ //Create new user as long as the user doesn't exist 
					var password = req.body.password;  
					var password2 = req.body.password2;				  
					var result = owasp.test(password);
					if(password == password2){ //must match
						if(result.strong){ //user made a strong password
							loginController.addUser(username,password);
							res.redirect('/?create=true');
						}
						else{ //user made a weak password. Reload the page and show the requirements they didn't meet
							if (req.session.csrf === undefined){
								req.session.csrf = crypto.randomBytes(100).toString('base64');
							}
							res.render('userCreate.ejs', {csrf_token:req.session.csrf,errors: result.errors});
						}
					}
					else{//did not match
						if (req.session.csrf === undefined){
							req.session.csrf = crypto.randomBytes(100).toString('base64');
						}
						res.render('userCreate.ejs', {csrf_token:req.session.csrf,errors: ["Passwords Must Match"]});
					}
				}
				else{ //User already exists
					if (req.session.csrf === undefined){
						req.session.csrf = crypto.randomBytes(100).toString('base64');
					}
					res.render('userCreate.ejs', {csrf_token:req.session.csrf,exists: true});
				}
			}
		}
		else if(req.query.type === 'delete'){
			var username1 = req.body.username1;
			var username2 = req.body.username2;
			
			if(username1 === username2 && username1 != req.session.user){
				if(loginController.deleteUser(username1)){
					res.redirect('/?deleted=true');
				}else{
					res.render('userDelete.ejs', {error: true});
				}
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
			
			var salt = loginController.getUser(username).salt;
			var hashCheck = crypto.pbkdf2Sync(passwordOriginal, salt+username, 100000, 64, `sha512`).toString(`hex`);

			if(loginController.getUser(username).hash == hashCheck && passwordNew1 == passwordNew2){ //Create new user as long as the user doesn't exist					
				var result = owasp.test(passwordNew1);
				if(result.strong){ //user made a strong password
					loginController.changeUser(username,passwordNew1);
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
};

module.exports = {usersGet,usersPost}