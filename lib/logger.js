const win = require('winston');

var defaultLevel = 'INFO';

var levels = {
    'CRITICAL': 0,
    'ERROR': 1,
    'WARNING': 2,
    'SUCCESS': 3,
    'INFO': 4,
    'DEBUG': 5
}
var colors = {
    'CRITICAL': 'red',
    'ERROR': 'magenta',
    'WARNING': 'yellow',
    'SUCCESS': 'green',
    'INFO': 'cyan',
    'DEBUG': 'blue'
}

var logger = new (win.Logger)({
    levels,
    colors,
    level: defaultLevel,
    transports: [
        new (win.transports.Console)({
            colorize: true
        })
    ]
});

module.exports = {
    logger: logger
}