/*

TO RUN
node index.js -h // display help

TODO
- create db with dbName IF DOES NOT EXIST
- insertMany() call in dbInit() must be called in mongo.js
- Map objects
- UNIT TESTS : assert module

QUESTIONS
- pass the dbName in command line or in conf file ?
- no need anymore the mongo.js > createCol() method ?

*/


const commander = require('commander');
const events = require('events');
const express = require('express');
const jsonfile = require('jsonfile');
const util = require('util');

const logger = require('./lib/logger').logger;
const mg = require('./lib/mongo');

const emitter = new events.EventEmitter();
var conf, init;
var dbName = 'db-name-default';
var db, usersCol, productsCol, testCol, ownCol;


function readJsonSync (path) {
	try {
		return jsonfile.readFileSync(path);
	} catch (err) {
		logger.log('WARNING', `while parsing the jsonfile ${path} : ${err}`);
		return null;
	}
}


/*
* Connect to mongoDB (1)
* Initialize the database with @name (2)
* Create the collections according to init dict (3)
* Insert the documents from each key of the init dict (4)
*/
function dbInit (name = dbName) {
	logger.log('INFO', 'your asked for the database initilization');
	logger.log('INFO', 'the name of your database will be : ' + name);

	mg.connect(conf.mongoVar.url) // (1)
	.then((val) => {
		db = mg.getDb(name); // (2)
		for (let key in init) {
			mg.getCol(name, key) // (3)
			.insertMany(init[key], function (err,res) { // (4)
				if (err) throw err;
				console.log(res)
			})
		}
	})
	.catch((err) => {
		logger.log('CRITICAL', `failed to connect to database ${name} : ${err}`);
		process.exit();
	});
}

commander
	.option('-c, --conf <string>', 'Path to the config JSON file.', (val) => { conf = readJsonSync(val); })
	.option('-i, --init <string>', 'Path to the JSON file to init the database, optional.', (val) => { init = readJsonSync(val); })
	.parse(process.argv);


if (!conf) {
	logger.log('CRITICAL', 'no config file specified !');
	process.exit();
}
if (!conf.mongoVar.url) {
	logger.log('CRITICAL', 'no url specified in the config file !');
	process.exit();	
}
if (init) {
	dbInit(conf.mongoVar.dbName);
}



//express.listen(3333);

