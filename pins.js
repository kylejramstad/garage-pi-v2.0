const JSONdb = require('simple-json-db');
const db = new JSONdb('./databases/pins.json');

var getOpenPin = function(){
	return db.get('open')
}
var getClosePin = function(){
	return db.get('close')
}
var getRelayPin = function(){
	return db.get('relay')
}

var setOpenPin = function(pin){
	db.set('open',pin)
	db.sync();
}
var setClosePin = function(pin){
	db.set('close',pin)
	db.sync();
}
var setRelayPin = function(pin){
	db.set('relay',pin)
	db.sync();
}

module.exports = {getOpenPin,getClosePin,getRelayPin,setOpenPin,setClosePin,setRelayPin}