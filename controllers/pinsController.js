const JSONdb = require('simple-json-db');
const db = new JSONdb('./databases/pins.json');
const rpio = require('rpio');

const pinsGet = function(req, res) {
	openPinNum = getOpenPin();
	closePinNum = getClosePin();
	relayPinNum = getRelayPin();
	res.render('pins.ejs', {open:openPinNum,close:closePinNum,relay:relayPinNum});
};

const pinsPost = function(req, res){
	var open = parseInt(req.body.open,10)
	var close = parseInt(req.body.close,10)
	var relay = parseInt(req.body.relay,10)
	
	var validPins = [3,5,7,8,10,11,12,13,15,16,18,19,21,22,23,24,26,29,31,32,33,35,36,37,38,40];
	
	if(validPins.includes(open) && validPins.includes(close) && validPins.includes(relay)){
		setPins(open,close,relay);
		startPins();
		res.render('pins.ejs', {success:true,open:openPinNum,close:closePinNum,relay:relayPinNum});
	}
	else{
		res.render('pins.ejs', {success:false,open:openPinNum,close:closePinNum,relay:relayPinNum});
	}
};

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

// default: 13-close, 19-open, 11-relay
var openPinNum = getOpenPin();
var closePinNum = getClosePin();
var relayPinNum = getRelayPin();
var openPin;
var closePin;
var relayPin;

startPins();

function startPins(){
	openPinNum = getOpenPin();
	closePinNum = getClosePin();
	relayPinNum = getRelayPin();
	openPin = process.env.OPEN_PIN || openPinNum;
	closePin = process.env.CLOSE_PIN || closePinNum;
	relayPin = process.env.RELAY_PIN || relayPinNum;
		
	rpio.open(openPin, rpio.INPUT, rpio.PULL_UP);
	rpio.open(closePin, rpio.INPUT, rpio.PULL_UP);
	rpio.open(relayPin, rpio.OUTPUT, rpio.HIGH);
}

function setPins(open,close,relay){
	setOpenPin(open);
	setClosePin(close);
	setRelayPin(relay);
}

function getState() {
  return {
	open: !rpio.read(openPin),
	close: !rpio.read(closePin)
  }
}

module.exports = {pinsGet,pinsPost,getState,getRelayPin}