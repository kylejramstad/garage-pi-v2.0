const JSONdb = require('simple-json-db');
const db = new JSONdb('./databases/logs.json');
const crypto = require("crypto");

var addLog = function(user) {
	var username = user;
	var id = crypto.randomBytes(20).toString('hex'); //Makes a random event id so that we have unique entries in our log
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
	
	db.set(id,[username,date,time]);
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
      result.push(database[i]);
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

module.exports = {addLog,getLogs,setSize}