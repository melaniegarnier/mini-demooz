/*

A module to use MongoDB

*/

const mgc = require( 'mongodb' ).MongoClient;

const logger = require('./logger').logger;

var client;

async function connect (url) {
	client = await mgc.connect(url);
}

function getDb (name) {
	return client.db(name);
}

async function listDbs () {
	return await client.db().admin().listDatabases();
}

function getCol (dbName, colName) {
	return client.db(dbName).collection(colName);
}

async function insertMany (dbName, colName, docArray) {
	return await client.db(dbName).collection(colName).insertMany(docArray);
}

async function find (dbName, colName, query = {}) {
	return await client.db(dbName).collection(colName).find(query).toArray();
}

module.exports = {
 	connect: connect,
	getDb: getDb,
	listDbs: listDbs,
	getCol: getCol,
	insertMany: insertMany,
	find: find
};