'use strict';

const JSONdb = require('simple-json-db');
const db = new JSONdb('/code/databases/logs.json');
const crypto = require("crypto");

const logsGet = function(req, res){
	res.render('logs.ejs', {size: getSize()});
};

const logsPost = function(req, res){
	if(typeof req.body.number !== "undefined"){
		var number = parseInt(req.body.number, 10);
		if(!(number < 0 || number > 1000)){
			setSize(number);
			res.render('logs.ejs', {success: true,size: getSize()});
		}
		else{
			res.render('logs.ejs', {error: true,size: getSize()});
		}
	}
	else{
		resetLogs();
		res.render('logs.ejs', {reset: true,size: getSize()});
	}
};

var addLog = function(open,user) {
	var id = crypto.randomBytes(20).toString('hex'); //Makes a random event id so that we have unique entries in our log and the table can properly update when buttons are pressed
	var today = new Date();
	var date = (today.getMonth()+1)+'-'+today.getDate()+'-'+today.getFullYear();
	
	var hours = today.getHours();
	var minutes = today.getMinutes();
	var seconds = today.getSeconds();
	
	if(hours < 10)
		hours = "0"+hours;
	if(minutes < 10)
		minutes = "0"+minutes;
	if(seconds < 10)
		seconds = "0"+seconds;
	
	var time = hours + ":" + minutes + ":" + seconds;
	
	db.set(id,[open,user,date,time]);
	db.sync();
	adjustLog();
}

var adjustLog = function(){
	var size = getSize();
	var database = db.JSON();
	var ids = []

	for(var k in database){
		if(k != "size")
			ids.push(k);	
	}

	while (ids.length >= size+1){
		db.delete(ids[0]); //delete the oldest entries until we have our size
		ids.shift();
	}
	db.sync();
}


var getLogs = function(){
  var database = db.JSON();
  var result = []

  for(var i in database){
	if(i != "size")
		result.push([i,database[i]]);
  }
  return result;
}

var setSize = function(size){
	db.set("size",size);
	db.sync();
	adjustLog();
}

var getSize = function(){
	return db.get("size");
}

var resetLogs = function(){
	var size = getSize();
	setSize(0); //deletes all logs
	setSize(size); //resets size back to what it was
}

module.exports = {logsGet,logsPost,addLog,getLogs}