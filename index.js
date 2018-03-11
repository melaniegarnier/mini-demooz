/*

TO RUN
node index.js -h // display help

TODO
- display many components for a same url https://stackoverflow.com/questions/30501931/assign-multiple-controller-in-stateprovider-state
- serverJS.dbInit() improvements : check the name of the keys (for collections)

LATER
- loggerJS : modify the defaultLevel (in command line or in conf file ?)
- port for expressJS : in conf.json ?
- Map objects
- UNIT TESTS : assert module
- use mongoose instead of mongodb module ?
- pass the dbName in command line or in conf file ?

*/


const commander = require('commander');
const express = require('express');

const logger = require('./lib/logger').logger;
const server = require('./lib/server');

const app = express();
const port = 3344;
var conf, init;


/*
* Function to run the client
* In work...
*/
async function client_run(dbName) {
	//app.use('/sb/', express.static(__dirname + '/web/search-bar/'));
	app.use('/root/', express.static(__dirname + '/web/'));

	app.get('/minidem/get/:type/:name', async (req, res) => {
		let reqType = req.params.type; // type asked (user or product)
		let nameReq = req.params.name; // user/product name asked

		let relationCol = 'own'; // relationnal collection
		// only 'own' for now ('test' to come...)

		let result = await server.searchRelation(dbName, relationCol, reqType, nameReq);
		res.json(result);
	});

	app.get('*', (req, res) => {
		res.sendFile(__dirname + '/web/index.html');
	});

	app.listen(port, () => {
	    logger.log('INFO', `Server listening on port ${port} !`);
	});
}

function treatErr (err) {
	logger.log('ERROR', err);
	console.log(err)
	process.exit();
}


/***** command line arguments *****/
commander
	.option('-c, --conf <string>', 'Path to the config JSON file.', 
		(val) => { conf = server.readJsonSync(val); })
	.option('-i, --init <string>', 'Path to the JSON file to init the database, optional.',
		(val) => { init = server.readJsonSync(val); })
	.parse(process.argv);

/***** main *****/
server.start(conf)
.then(() => {
	if (init) {
		server.dbInit(init, conf.mongoVar.dbName)
		.then(() => {
			client_run()
			.catch((err) => {
				treatErr(err);
			});
		})
		.catch((err) => {
			treatErr(err);
		});

	} else {
		client_run(conf.mongoVar.dbName)
		.catch((err) => {
			treatErr(err);
		});;
	}
})
.catch((err) => {
	treatErr(err);
});


	