/*

A module to use MongoDB

*/

const mgc = require( 'mongodb' ).MongoClient;

const logger = require('./logger').logger;

var client;

async function connect2 (url) {
	client = await mgc.connect(url);
  	return client;
}

function getDb (name) {
	return client.db(name);
}

async function createCol (dbName, colName) {
	return await getDb(dbName).createCollection(colName);
}

function getCol (dbName, colName) {
	return client.db(dbName).collection(colName);
}

module.exports = {
 	connect: connect2,
	getDb: getDb,
	createCol: createCol,
	getCol: getCol
};