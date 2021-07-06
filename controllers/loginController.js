'use strict';

const crypto = require('crypto');
const JSONdb = require('simple-json-db');
const db = new JSONdb('./databases//users.json');

const loginGet = function(req, res){ //does not use the auth() middleware because users seeing this page are most likely not signed in anyway
	if (req.session && req.session.admin){ //Already signed in. Go to main page
		res.redirect('/');
	}
	else{ //Not signed in
		if(isFirst()){ //First time going to the site. Go to create the first user
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
};

const loginPost = function(req, res) { //Check if username exists then if password matches to the username, otherwise show error to user
	var username = req.body.username;
	if(getUser(username)){
		//Username exists
		var password = req.body.password;
		var salt = getUser(username).salt;
		var hash = crypto.pbkdf2Sync(password, salt+username, 100000, 64, `sha512`).toString(`hex`);
		if(getUser(username).hash == hash){
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
}

var genRandomString = function(length){
	return crypto.randomBytes(Math.ceil(length/2))
			.toString('hex') /** convert to hexadecimal format */
			.slice(0,length);	/** return required number of characters */
};

var addUser = function(user,pass) {
	if(user != "first"){
		const username = user;
		const password = pass;
		const salt_gen = genRandomString(64);
		const hash_gen = crypto.pbkdf2Sync(password, salt_gen+username, 100000, 64, `sha512`).toString(`hex`);
	
		db.set(username,{salt:salt_gen,hash:hash_gen});
		if(db.get('first')){
			db.set('first',false);
		}
		db.sync();
	}
}

var getUser = function(user){
  if(user != "first"){
	return db.get(user);
  }
	return false;
}

var isFirst = function(){
	return db.get('first')
}

var deleteUser = function(user){
	if(db.has(user) && user != "first"){
		db.delete(user);	
		return true;
	}else{
		return false;
	}
}

var changeUser = function(user,pass){
	addUser(user,pass);
}


module.exports = {loginGet, loginPost, addUser,getUser,isFirst,deleteUser,changeUser, genRandomString}