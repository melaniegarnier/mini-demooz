
const JSON = require('JSON')
const jsonfile = require('jsonfile');
const util = require('util');

const logger = require('./logger').logger;
const mg = require('./mongo');

var conf;

/***** mongoDB variables *****/
const dbDefaultName = 'db-name-default'; // database default name if not specified in the config file
var dbName = ''; // name of the db we will use all along the program
const objTypeArray = ['user', 'product']; // type of object requests we can have
const relationArray = ['own', 'test'] // type of relations


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
	dbName = conf.mongoVar ? (conf.mongoVar.dbName ? conf.mongoVar.dbName : dbDefaultName) : dbDefaultName;
	await mg.connect(conf.mongoVar.url);
}

/*
* Connect to mongoDB (1)
* Check the inexistence of the database @dbName or exit (2)
* Initialize the database with @dbName (3)
* Init the collections according to the @init dict (4)
* Insert the documents from each key of the @init dict (5)
*/
async function dbInit (init) {
	logger.log('INFO', 'you asked for the database initilization');
	logger.log('INFO', 'the name of your database will be : ' + dbName);

	await mg.connect(conf.mongoVar.url) // (1)
	
	let dbExists = await doesDbExist(); // (2)
	if (dbExists) {
		logger.log('ERROR', `The database ${dbName} already exists -> exit`);
		process.exit();
	}

	mg.getDb(dbName); // (3)
	for (let key in init) {
		mg.getCol(dbName, key) // (4)
		await mg.insertMany(dbName, key, init[key]); // (5)
	}
}

/*
* Check if the database @myDbName exists or not by listing all the databases
* and checking if any of them is named @myDbName. Return a boolean.
*/
async function doesDbExist (myDbName = dbName) {
	let dbList = await mg.listDbs();
	if (dbList.databases.find( (elem) => { return elem.name == myDbName; }) ) {
		return true;
	}
	return false;
}

/*
* Find the @contraryObj by looking the index of the @objType in the objTypeArray array
*/
function findContraryObj (objType) {
	let i = objTypeArray.indexOf(objType);
	switch (i) {
		case -1:
			logger.log('ERROR', `@objType ${objType} not recognized !`);
			return null;
		case 0:
			logger.log('DEBUG', `@objType = ${objType}, @contraryObj = ${objTypeArray[1]}`);
			return objTypeArray[1];
		case 1:
			logger.log('DEBUG', `@objType = ${objType}, @contraryObj = ${objTypeArray[0]}`);
			return objTypeArray[0];
	}
}

/*
* According to a type of request (@objType), search in the collection (@relationCol)
* every document that contain @nameReq. Return in a JSON the @contraryObj and the
* results that have the key @contraryObj. If error, return the cause.
* (1) find the @contraryObj
* (2) ask for all doc of the @relationCol collection matching the JSON { @keySearch : @nameReq }
* (3) if the result array contains something : make a JSON with it
* (4) else : check the existence of @nameReq in the @objType collection (to send nothing or an error)
*
* EXAMPLE : searchRelation('own', 'product', 'iPhone_X')
* -> looking for users (contraryObj) that own (relationCol) the product (objType) 'iPhone_X' (nameReq)
*/
async function searchRelation (relationCol, objType, nameReq) {
	let contraryObj = findContraryObj(objType); // contrary to objType (1)
	if (!contraryObj) return { 'error' : `${objType} not recognized` };

	// (2)
	let keySearch = '_id.' + objType; // key for the db request
	logger.log('INFO', `search in ${dbName} database, ${relationCol} collection the query : { ${keySearch}: ${nameReq} }`);
	let result = await mg.find(dbName, relationCol, { [keySearch]: nameReq });

	if (result.length) { // (3)
		logger.log('SUCCESS', `results found for request /get/${objType}/id/${nameReq}`);
		result = result.map((val) => val._id[contraryObj] ); // take only the contraryObj values
		return { type: [contraryObj], [contraryObj] : result };

	} else { // (4)
		let query = { '_id': nameReq };
		logger.log('INFO', `search in ${dbName} database, ${objType} collection the query : ${util.format(query)}`);
		let check_name_exists = await mg.find(dbName, objType, query)

		if (check_name_exists.length) {
			logger.log('INFO', `no ${contraryObj} for the ${objType} ${nameReq}`);
			return { type: [contraryObj], [contraryObj] : [] };
		} else {
			logger.log('WARNING', `no ${objType} named ${nameReq} found`);
			return { 'error': `${objType} ${nameReq} not found` };
		}
	}
}

/*
* Ask to add a relation @relationType (see @relationArray) between an @objType named @name
* and its contrary named @nameFri.
* (1) check if the relation exists
* (2) if it does not exist -> check if the @objType named @name exists
* (3) if it exists -> check if @nameFri exists in the collection @contraryObj
* (4) if it exists -> create it
* (5) then add the relation in the collection @relationType
*/
async function addRelation (relationType, objType, name, nameFri) {
	var contraryObj = findContraryObj(objType); // contrary to objType
	if (!contraryObj) return { 'error' : `${objType} not recognized` };
	
	// query creation, example = { $and: [ { _id.user: "Juliette" }, { _id.user: "iPhone_X" } ] }
	let keySearch_obj = "_id." + objType;
	let keySearch_contr = "_id." + contraryObj;
	let query = { $and: [
		{ [keySearch_obj] : name },
		{ [keySearch_contr] : nameFri }
	] };
	let check_relation_exists = await mg.find(dbName, relationType, query); // (1)

	if (check_relation_exists.length) { // (1)
		logger.log('WARNING', `Relation ${relationType} exists between ${objType} ${name} and ${contraryObj} ${nameFri}.`);
		return { 'error': 'relation already exists' };

	} else {
		let check_name_exists = await mg.find(dbName, objType, { '_id': name }) // (2)
		if (!check_name_exists.length) {
			logger.log('ERROR', `${objType} ${name} does not exist : cannot add him relations`);
			return { 'error': `${objType} ${name} does not exist` }
		}
		else {
			let check_nameFri_exists = await mg.find(dbName, contraryObj, {_id: nameFri}); // (3)
			if (! check_nameFri_exists.length) { // (4)
				logger.log('DEBUG', `${contraryObj} ${nameFri} does not exist : will be inserted in collection ${contraryObj}`);
				await mg.insertMany(dbName, contraryObj, [ {_id: nameFri} ]);
			}
			let toInsert = { _id: {
				[objType] : name,
				[contraryObj] : nameFri
			} };
			await mg.insertMany(dbName, relationType, [ toInsert ]); // (5)
			return { 'added': nameFri };
		}
	}
}


module.exports = {
	readJsonSync: readJsonSync,
	start: start,
	dbInit: dbInit,
	doesDbExist: doesDbExist,
	getDbName: () => { return dbName; },
	searchRelation: searchRelation,
	addRelation: addRelation
}
