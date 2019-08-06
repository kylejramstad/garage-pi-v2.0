const crypto = require('crypto');
const JSONdb = require('simple-json-db');
const db = new JSONdb('./databases/users.json');

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
	}
}

var changeUser = function(user,pass){
	addUser(user,pass);
}

module.exports = {addUser,getUser,isFirst,deleteUser,changeUser, genRandomString}