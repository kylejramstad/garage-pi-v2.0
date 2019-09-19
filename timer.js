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

module.exports = {getTime,setTime,getOnOff,setOnOff}