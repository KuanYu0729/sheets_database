// create a stdout console logger
const simpleLogger = require('simple-node-logger').createSimpleLogger();
class Logger {
	debug(...args) {
		args.unshift("debug");
		simpleLogger.log.apply(args);
	}
	log(...args) {
		args.unshift("info");
		simpleLogger.log.apply(args);
	}
	info(...args) {
		args.unshift("info");
		simpleLogger.log.apply(args);
	}
	warn(...args) {
		args.unshift("warn");
		simpleLogger.log.apply(args);
	}
	error(...args) {
		args.unshift("error");
		simpleLogger.log.apply(args);
	}
}
simpleLogger.setLevel("debug");
module.exports = new Logger();