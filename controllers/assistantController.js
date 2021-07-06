'use strict';

const loginController = require('./loginController.js');

const assistantGet = function(req, res){
	res.render('assistant.ejs');
};

const assistantPost = function(req, res){
	var username = "assistant";
	if(req.query.deleted === 'true'){
		loginController.deleteUser(username);
		res.render('assistant.ejs', {deleted: true});
	}
	else if(req.query.create === 'true'){ //only other option is to create
		var password = loginController.genRandomString(15);
		loginController.addUser(username,password);
		res.render('assistant.ejs', {username: username, password: password});
	}
	else{
		res.render('assistant.ejs');
	}
};

module.exports = {assistantGet,assistantPost}