#!/usr/bin/env node

'use strict';

const debug = require('debug');
const vorpal = require('vorpal')();

debug.log = function() {
	vorpal.log.apply(vorpal, arguments);
};

const NTSAPI = require('./lib/ntsapi');
var api;

function validateNumber(args) {
	if(!NTSAPI.Validators.isTelephoneNumber(args.number)) {
		return "Invalid number format.";
	}
	return true;
}

function validateAllocatableNumber(args) {
	if(!NTSAPI.Validators.isAllocatableNumber(args.number)) {
		return "Invalid number format.";
	}
	return true;
}

function validateAvailable(args) {
	var size;
	if(!NTSAPI.Validators.isAllocatableNumber(args.number)) {
		return 'Invalid number format';
	}
	if(args.size) {
		size = parseInt(args.size, 10);
		if(isNaN(size) || size < 1) {
			return 'Invalid size';
		}
	}
	return true;
}

vorpal.log('Connecting to Magrathea...');

api = new NTSAPI();

api.on('close', function() {
	vorpal.log('Connection to server lost');
	process.exit();
});

api.connect(function(success, err) {
	if(success) {
		vorpal.delimiter('anonymous@api$').show();
		return;
	}
	vorpal.log('Failed to connect to server!');
	vorpal.log(err);
});

vorpal.command('auth <user> [password]', 'Authenticate as a user with password. If no password is given, one will be prompted for.').types({ string: ['_'] }).action(function(args, callback) {
	var user = args.user;
	var password = args.password;
	var action = this;
	if(!args.password) {
		this.prompt({type: 'password', name: 'password', message: 'Password: '}, function(result) {
			password = result.password;
			handleAuth();
		});
	}
	else {
		handleAuth();
	}
	function handleAuth() {
		api.auth(user, password, function(success) {
			if(success) {
				action.log('Login successful');
				vorpal.delimiter(user + '@api$');
			}
			else {
				action.log('Login failed - check username and password');
			}
			callback();
		});
	}
});

vorpal.command('allocate <number>', 'Allocate a number.').types({ string: [ '_' ] }).validate(validateAllocatableNumber).action(function(args, cb) {
	var action = this;
	api.allocate(args.number, function(success, msg) {
		if(success) {
			action.log('Success - ' + msg + 'allocated');
			action.log('(Remember to activate your new number!)');
		}
		else {
			action.log(msg);
		}
		cb();
	});
});

vorpal.command('activate <number>', 'Activate a number').types({ string: [ '_' ] }).validate(validateNumber).action(function(args, cb) {
	var action = this;
	api.activate(args.number, function(success, msg) {
		if(success) {
			action.log('Success - ' + msg + 'activated');
		}
		else {
			action.log(msg);
		}
		cb();
	});
});

vorpal.command('deactivate <number>', 'Activate a number').types({ string: [ '_' ] }).validate(validateNumber).action(function(args, cb) {
	var action = this;
	api.status(args.number, function(success, data) {
		action.log(data);
		cb();
	});
});

vorpal.command('reactivate <number>', 'Reactivate a number previously deactivated')
	.types({ string: [ '_' ] })
	.validate(validateNumber)
	.action(function(args, cb) {
		var action = this;
		api.status(args.number, function(success, data) {
			action.log(data);
			cb();
		});
	});

vorpal.command('destination <number> <destination>', 'Set the destination of a number')
	.alias('dest', 'set')
	.types({ string: [ '_' ] })
	.validate(validateNumber)
	.option('-p, --priority', 'Set the priority of the destination (default: 1)', ['1', '2', '3'])
	.action(function(args, cb) {
		var action = this;
		var priority = args.priority ? args.priority : '1';
		var dest = new NTSAPI.Destination(args.destination);
		api.destination(args.number, priority, dest, function(success, msg) {
			action.log(msg);
			cb();
		});
	});

vorpal.command('status <number>', 'Gets information about a number').types({ string: [ '_' ] }).validate(validateNumber).action(function(args, cb) {
	var action = this;
	api.status(args.number, function(success, data) {
		if(success) {
			action.log('Activated:', data.activated ? 'Yes' : 'No');
			action.log('Expires:', data.expiry);
			data.destinations.forEach(function(target, i) {
				if(target) {
					action.log('Destination '+ ( i + 1 ) + ':', target.toString());
				}
			});
		}
		else {
			action.log(data);
		}
		cb();
	});
});

vorpal.command('available <number> [size]', 'Provide a list of available numbers. If size is not specified, then a value of 10 is assumed.')
	.types({ string: [ '_' ] }).validate(validateAvailable).action(function(args, cb) {
		var action = this;
		var size = 10;
		if(args.size) {
			size = parseInt(args.size, 10);
		}
		api.availableNumbers(args.number, size, function(success, data) {
			if(success) {
				action.log('Found ' + data.length + ' numbers');
				data.forEach(function(number) {
					action.log(number);
				});
			}
			else {
				action.log(data);
			}
			cb();
		});
	});

vorpal.command('connection', 'Show information about the current connection').action(function(args, cb) {
	this.log(api.connectionInfo());
	cb();
});

vorpal.find('exit').description('Quits the CLI').action(function() {
	api.disconnect();
	process.exit();
});
