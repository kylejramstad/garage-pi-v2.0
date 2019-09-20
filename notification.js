const https = require('https')
const JSONdb = require('simple-json-db');
const db = new JSONdb('./databases/notification.json');

var sendAutoClose = function(time){
	var data = JSON.stringify({
	  value1: time
	})
	
	var key = db.get('key');
	
	var newPath = '/trigger/Auto_Close/with/key/'+key;
	var options = {
	  hostname: 'maker.ifttt.com',
	  port: 443,
	  path: newPath,
	  method: 'POST',
	  headers: {
		'Content-Type': 'application/json',
		'Content-Length': data.length
	  }
	}
	
	var req = https.request(options, (res) => {
		console.log(`statusCode: ${res.statusCode}`)
		res.on('data', (d) => {
			process.stdout.write(d)
		  })
	})
	
	req.on('error', (error) => {
	  console.error(error)
	})

	req.write(data)
	req.end()	
};

var sendOpenClose = function(openClose, user){
	var data = JSON.stringify({
	  value1: user,
	  value2: openClose
	})
	
	var key = db.get('key');
	
	var newPath = '/trigger/Open_Close/with/key/'+key;
	var options = {
	  hostname: 'maker.ifttt.com',
	  port: 443,
	  path: newPath,
	  method: 'POST',
	  headers: {
		'Content-Type': 'application/json',
		'Content-Length': data.length
	  }
	}
	
	var req = https.request(options, (res) => {
		console.log(`statusCode: ${res.statusCode}`)
		res.on('data', (d) => {
			process.stdout.write(d)
		  })
	})
	
	req.on('error', (error) => {
	  console.error(error)
	})

	req.write(data)
	req.end()	
};

var setIFTTTKey = function(key){
	db.set('key',key);
	db.sync();
}

var getIFTTTKey = function(key){
	return db.get('key');
}

var setAuto = function(onOff){
	db.set('auto',onOff);
	db.sync();
}

var setOpenClose = function(onOff){
	db.set('openClose',onOff);
	db.sync();
}

var setButton = function(onOff){
	db.set('button',onOff);
	db.sync();
}

var getAuto = function(onOff){
	return db.get('auto');
}

var getOpenClose = function(onOff){
	return db.get('openClose');
}

var getButton = function(onOff){
	return db.get('button');
}

module.exports = {sendAutoClose,sendOpenClose,setIFTTTKey,getIFTTTKey,setAuto,setOpenClose,setButton,getAuto,getOpenClose,getButton}