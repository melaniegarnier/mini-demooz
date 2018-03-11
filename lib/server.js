
const jsonfile = require('jsonfile');

const logger = require('./logger').logger;
const mg = require('./mongo');

var conf;

/***** mongoDB variables *****/
var dbDefaultName = 'db-name-default'; // database default name if not specified in the config file
var db; // database object from MongoClient (./lib/mongo.js module)
const possibleType = ['user', 'product']; // type of http requests we can have


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
* Start the back-end with the config dict @confDic and start connection with mongoDB
*/
async function start (confDic) {
	if (typeof confDic == 'undefined') {
		logger.log('CRITICAL', 'no config file specified ! -> exit');
		process.exit();
	}
	if (!confDic.mongoVar || !confDic.mongoVar.url) {
		logger.log('CRITICAL', 'no url specified in the config file !');
		process.exit();	
	}
	conf = confDic;
	await mg.connect(conf.mongoVar.url);
}

/*
* Connect to mongoDB (1)
* Check the inexistence of the database @dbName or exit (2)
* Initialize the database with @dbName (3)
* Init the collections according to the @init dict (4)
* Insert the documents from each key of the @init dict (5)
*/
async function dbInit (init, dbName = dbDefaultName) {
	logger.log('INFO', 'you asked for the database initilization');
	logger.log('INFO', 'the name of your database will be : ' + dbName);

	await mg.connect(conf.mongoVar.url) // (1)
	
	let dbList = await mg.listDbs();
	if (dbList.databases.find((elem) => { return elem.name == dbName; })) { // (2)
		logger.log('ERROR', `The database ${dbName} exists already -> exit`);
		process.exit();
	}

	db = mg.getDb(dbName); // (3)
	for (let key in init) {
		mg.getCol(dbName, key) // (4)
		await mg.insertMany(dbName, key, init[key]); // (5)
	}
}

/*
* Search in the collection @colName of the database @dbName all the documents
*/
async function dbSearch (dbName = dbDefaultName, colName, query = {}) {
	logger.log('INFO', `search in ${dbName} database, ${colName} collection the query : ${query}`);
	let res = await mg.find(dbName, colName, query);
	return res;
}

/*
* According to a type of request (@reqType), search in the collection @relationCol
* every document that contain @nameReq. Return in a JSON the @contraryType and the
* results that have the key @contraryType. If error, return the cause.
* (1) find the @contraryType by looking the index of the @reqType in the possibleType array
* (2) ask for all doc of the @relationCol collection matching the JSON { @keySearch : @nameReq }
* (3) if the result array contains something : make a JSON with it
* (4) else : check the existence of @nameKey in the @reqType collection
*
* EXAMPLE : searchRelation('minidem', 'own', 'product', 'iPhone_X')
* -> looking for users (contraryType) that own (relationCol) the product (reqType) 'iPhone_X' (nameReq)
*/
async function searchRelation (dbName = dbDefaultName, relationCol, reqType, nameReq) {
	let res; // results to be sent
	let contraryType; // contrary to reqType, see (1)

	let i = possibleType.indexOf(reqType); // (1)
	switch (i) {
		case -1:
			logger.log('ERROR', `@reqType ${reqType} not recognized !`);
			res = { 'error' : `${reqType} not recognized` };
			break;
		case 0:
			contraryType = possibleType[1];
			logger.log('DEBUG', `@reqType = ${reqType}, @contraryType = ${contraryType}`);
			break;
		case 1:
			contraryType = possibleType[0];
			logger.log('DEBUG', `@reqType = ${reqType}, @contraryType = ${contraryType}`);
			break;
	}

	// (2)
	let keySearch = '_id.' + reqType; // key for the db request
	let result = await dbSearch(dbName, relationCol, {[keySearch]: nameReq});

	if (result.length) { // (3)
		logger.log('SUCCESS', `results found for request /${reqType}/${nameReq}`);
		result = result.map((val) => val._id[contraryType] ); // take only the contraryType values
		res = {
			type: [contraryType],
			[contraryType] : result
		};

	} else { // (4)
		let checkNameExist = await dbSearch(dbName, reqType, {'_id': nameReq});

		if (checkNameExist.length) {
			logger.log('INFO', `no ${contraryType} for the ${reqType} ${nameReq}`);
			res = {
				type: [contraryType],
				[contraryType] : []
			};
		} else {
			logger.log('WARNING', `no ${reqType} named ${nameReq} found`);
			res = { 'error': 'not found' };
		}
	}
	return res;
}


module.exports = {
	readJsonSync: readJsonSync,
	start: start,
	dbInit: dbInit,
	searchRelation: searchRelation
}
