'use strict';

const fs = require('fs');
checkDatabases(); //Need to check before running the server for the first time

//Check to see if the databases exist. They wont exist if this is the first time running.
function checkDatabases(){
	if(!fs.existsSync('/code/databases')){ //Create the databases if they don't exist
		fs.mkdir('/code/databases', { recursive: true }, (err) => {
			if (err) return;
		});
		var files = ['logs.json','notification.json','pins.json','timer.json','users.json'];
		files.forEach(element => { 
			fs.copyFile('/code/sample-databases/'+element, '/code/databases/'+element, err => {
				if (err) return;
			});
		}); 
	}
}

module.exports = {checkDatabases}