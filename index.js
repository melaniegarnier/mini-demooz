/*

TO RUN
node index.js -h // display help

TODO
- dbInit() improvements : check the name of the key (for collections)
- Map objects
- UNIT TESTS : assert module

QUESTIONS
- pass the dbName in command line or in conf file ?

*/


const commander = require('commander');
const events = require('events');
const express = require('express');
const jsonfile = require('jsonfile');
const util = require('util');

const logger = require('./lib/logger').logger;
const mg = require('./lib/mongo');

const app = express();
const emitter = new events.EventEmitter();
var conf, init;

/***** mongoDB variables *****/
var dbName = 'db-name-default'; // database default name if not specified in the config file
var db; // database object from MongoClient (./lib/mongo.js module)
var usersCol, productsCol, testCol, ownCol; // collections


/***** functions *****/

/*
* Read a JSON file and parse, synchronously
*/
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
* Check the inexistence of the database @name or exit (2)
* Initialize the database with @name (3)
* Init the collections according to init dict (4)
* Insert the documents from each key of the init dict (5)
*/
async function dbInit (name = dbName) {
	logger.log('INFO', 'you asked for the database initilization');
	logger.log('INFO', 'the name of your database will be : ' + name);

	await mg.connect(conf.mongoVar.url) // (1)
	
	let dbList = await mg.listDbs();
	if (dbList.databases.find((elem) => { elem.city === name; })) { // (2)
		logger.log('ERROR', `The database ${name} exists already -> exit`);
		process.exit();
	}

	db = mg.getDb(name); // (3)
	for (let key in init) {
		mg.getCol(name, key) // (4)
		await mg.insertMany(name, key, init[key]); // (5)
	}
}


/***** main *****/
commander
	.option('-c, --conf <string>', 'Path to the config JSON file.', 
		(val) => { conf = readJsonSync(val); })
	.option('-i, --init <string>', 'Path to the JSON file to init the database, optional.',
		(val) => { init = readJsonSync(val); })
	.parse(process.argv);


if (!conf) {
	logger.log('CRITICAL', 'no config file specified !');
	process.exit();
}
if (!conf.mongoVar || !conf.mongoVar.url) {
	logger.log('CRITICAL', 'no url specified in the config file !');
	process.exit();	
}
if (init) {
	dbInit(conf.mongoVar.dbName)
	.then(() => {
		// go !!!
	})
	.catch((err) => {
		logger.log('ERROR', `in the initilization of the database : ${err}`);
		console.log(err)
		process.exit();
	});
}



app.listen(3344);

