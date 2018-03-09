/*

TO RUN
node index.js -h // display help

TODO
- serverJS.dbInit() improvements : check the name of the key (for collections)
- Map objects
- UNIT TESTS : assert module

QUESTIONS
- pass the dbName in command line or in conf file ?

*/


const commander = require('commander');
const express = require('express');

const logger = require('./lib/logger').logger;
const server = require('./lib/server');

const app = express();
var conf, init;


/***** main *****/
commander
	.option('-c, --conf <string>', 'Path to the config JSON file.', 
		(val) => { conf = server.readJsonSync(val); })
	.option('-i, --init <string>', 'Path to the JSON file to init the database, optional.',
		(val) => { init = server.readJsonSync(val); })
	.parse(process.argv);

server.start(conf);

if (init) {
	server.dbInit(init, conf.mongoVar.dbName)
	.then(() => {
		// go !!!
		server.test();
	})
	.catch((err) => {
		logger.log('ERROR', `in the initilization of the database : ${err}`);
		console.log(err)
		process.exit();
	});
}



//app.listen(3344);

