/*

TO RUN
node index.js -h // display help

TODO
- UNIT TESTS : assert module

*/

const bodyParser = require('body-parser');
const commander = require('commander');
const express = require('express');

const logger = require('./lib/logger').logger;
const server = require('./lib/server');

const app = express();
const port = 3344;
var conf, init;


/*
* Function to set the client routes and define express GET and POST methods
*/
async function clientRun() {
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));

	app.use('/root/', express.static(__dirname + '/web/'));
	app.use('/sh/', express.static(__dirname + '/web/sweet-home/'));
	app.use('/ep/', express.static(__dirname + '/web/el-padre/'));
	app.use('/sb/', express.static(__dirname + '/web/search-bar/'));
	app.use('/ac/', express.static(__dirname + '/web/array-comp/'));
	

	app.get('/get/obj/:objType/id/:name/relation/:relationType', async (req, res) => {
		let objType = req.params.objType; // objType asked (user or product)
		let nameReq = req.params.name; // user/product name asked
		let relationType = req.params.relationType; // relation asked (own or test)

		let result = await server.searchRelation(relationType, objType, nameReq);
		res.json(result);
	});

	app.get('*', (req, res) => {
		res.sendFile(__dirname + '/web/main.html');
	});

	// to add a relation between an object of _id @name and a contrary object of _id @nameFri
	app.post('/add/relation/:relationType', async (req, res) => {
		let relationType = req.params.relationType;
		let objType = req.body.objType;
		let name = req.body.name;
		let nameFri = req.body.nameFriend;

		let result = await server.addRelation(relationType, objType, name, nameFri);
		res.json(result);
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
	.usage('node ./index.js [options]')
    .description('A script to run the Mini Demooz server')
	.option('-c, --conf <string>', 'Path to the config JSON file.', 
		(val) => { conf = server.readJsonSync(val); })
	.option('-i, --init <string>', 'Path to the JSON file to init the database, optional.',
		(val) => { init = server.readJsonSync(val); })
	.parse(process.argv);


/***** main *****/
server.start(conf)
.then(() => {
	if (init) {
		server.dbInit(init)
		.then(() => {
			clientRun()
			.catch((err) => {
				treatErr(err);
			});
		})
		.catch((err) => {
			treatErr(err);
		});

	} else {
		server.doesDbExist()
		.then((dbExists) => {
			if (!dbExists) {
				logger.log('ERROR', `The database ${server.getDbName()} does not exists, you have to use -i option -> exit`);
				process.exit();
			}
			clientRun()
			.catch((err) => {
				treatErr(err);
			});
		})
		.catch((err) => {
			treatErr(err);
		});
	}
})
.catch((err) => {
	treatErr(err);
});


	