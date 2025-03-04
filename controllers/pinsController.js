const JSONdb = require('simple-json-db');
const db = new JSONdb('./databases/pins.json');
const gpiox = require("@iiot2k/gpiox");

const pinsGet = function(req, res) {
	openPinNum = getOpenPin();
	closePinNum = getClosePin();
	relayPinNum = getRelayPin();
	res.render('pins.ejs', {open:openPinNum,close:closePinNum,relay:relayPinNum});
};

//Physical Pins to GPIO Pins
//GPIOX uses GPIO Pins and Garage-Pi uses physical pins
const pins = {
    3:2,
	5:3,
	7:4,
	8:14,
	10:15,
	11:17,
	12:18,
	13:27,
	15:22,
	16:23,
	18:24,
	19:10,
	21:9,
	22:25,
	23:11,
	24:8,
	26:7,
	29:5,
	31:6,
	32:12,
	33:13,
	35:19,
	36:16,
	37:26,
	38:20,
	40:21
};

const pinsPost = function(req, res){
	var open = parseInt(req.body.open,10)
	var close = parseInt(req.body.close,10)
	var relay = parseInt(req.body.relay,10)
	
	if(open in pins && close in pins && relay in pins){
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

	gpiox.init_gpio(pins[openPin], gpiox.GPIO_MODE_INPUT_PULLUP, 1);
	gpiox.init_gpio(pins[closePin], gpiox.GPIO_MODE_INPUT_PULLUP, 1);
	gpiox.init_gpio(pins[relayPin], gpiox.GPIO_MODE_OUTPUT, 1);
}

function writePin(pin, value){
	gpiox.set_gpio(pins[pin], value);
}

function setPins(open,close,relay){
	setOpenPin(open);
	setClosePin(close);
	setRelayPin(relay);
}

function getState() {
  return {
	open: gpiox.get_gpio(pins[openPin]),
	close: gpiox.get_gpio(pins[closePin])
  }
}

module.exports = {pinsGet,pinsPost,getState,getRelayPin,writePin}