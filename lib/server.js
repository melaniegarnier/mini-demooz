
const jsonfile = require('jsonfile');

const logger = require('./logger').logger;
const mg = require('./mongo');

var conf;

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
		logger.log('ERROR', `while parsing the jsonfile ${path} : `);
		console.log(err);
		process.exit();
	}
}

/*
* Start the back-end with the config dict @confDic
*/
function start (confDic) {
	if (typeof confDic == 'undefined') {
		logger.log('CRITICAL', 'no config file specified ! -> exit');
		process.exit();
	}
	if (!confDic.mongoVar || !confDic.mongoVar.url) {
		logger.log('CRITICAL', 'no url specified in the config file !');
		process.exit();	
	}
	conf = confDic;
}

/*
* Connect to mongoDB (1)
* Check the inexistence of the database @name or exit (2)
* Initialize the database with @name (3)
* Init the collections according to the @init dict (4)
* Insert the documents from each key of the @init dict (5)
*/
async function dbInit (init, name = dbName) {
	logger.log('INFO', 'you asked for the database initilization');
	logger.log('INFO', 'the name of your database will be : ' + name);

	await mg.connect(conf.mongoVar.url) // (1)
	
	let dbList = await mg.listDbs();
	if (dbList.databases.find((elem) => { return elem.name == name; })) { // (2)
		logger.log('ERROR', `The database ${name} exists already -> exit`);
		process.exit();
	}

	db = mg.getDb(name); // (3)
	for (let key in init) {
		mg.getCol(name, key) // (4)
		await mg.insertMany(name, key, init[key]); // (5)
	}
}

/*
* Test function, to run some things and test them
*/
function test () {
	logger.log('INFO', 'Test function is beginning');
	
	logger.log('INFO', 'Test function is ending');
}



module.exports = {
	readJsonSync: readJsonSync,
	start: start,
	dbInit: dbInit,
	test: test
}
