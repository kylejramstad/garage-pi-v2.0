'use strict';

const path = require('path');
const fs = require('fs');

function getScripts(){
	var startPath = "/code/assets";
	var filter = "bundle.js"
    var results = [];

    if (!fs.existsSync(startPath)){
        //console.log("no dir ",startPath);
        return;
    }

    var files=fs.readdirSync(startPath);
    for(var i=0;i<files.length;i++){
        var filename=path.join(startPath,files[i]);
        var stat = fs.lstatSync(filename);
        if (stat.isDirectory()){
            //results = results.concat(findFilesInDir(filename,filter)); //recurse
        }
        else if (filename.indexOf(filter)>=0) {
            //console.log('-- found: ',filename);
            filename = filename.slice(5);
            results.push(filename);
        }
    }
    return results;
}

const index = function(req, res) {
	var create = false;
	var deleted = false;
	if(req.query.create == 'true'){
		create = true;
	}
	if(req.query.deleted == 'true'){
		deleted = true;
	}
	res.render('index.ejs', {scripts: getScripts(),create:create,deleted:deleted});
}

module.exports = {index};

