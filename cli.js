#!/usr/bin/env node

'use strict';

const debug = require('debug');

debug.log = function() {
	vorpal.log.apply(vorpal, arguments);
}

const vorpal = require('vorpal')();
const NTSAPI = require('./lib/ntsapi');

vorpal.log('Connecting to Magrathea...');

var api = new NTSAPI();

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
		action.log(msg);
	});
});

vorpal.command('reactivate <number>', 'Reactivate a number previously deactivated').types({ string: [ '_' ] }).validate(validateNumber).action(function(args, cb) {
	var action = this;
	api.status(args.number, function(success, data) {
		action.log(msg);
	});
});

vorpal.command('destination <number> <priority> <destination>', 'Set the destination of a number').types({ string: [ '_' ] }).validate(validateNumber).action(function(args, cb) {
	var action = this;
	api.destination(args.number, args.priority, args.destination, function(success, msg) {
		action.log(msg);
	});
});

vorpal.command('status <number>', 'Gets information about a number').types({ string: [ '_' ] }).validate(validateNumber).action(function(args, cb) {
	var action = this;
	api.status(args.number, function(success, data) {
		if(success) {
			action.log('Activated:', data.activated ? 'Yes' : 'No');
			action.log('Expires:', data.expiry);
			data.destinations.forEach(function(target, i) {
				if(target && target.length) {
					action.log('Destination '+ ( i + 1 ) + ':', target);
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
		var number = args.number;
		var size = 10;
		if(args.size) {
			size = parseInt(args.size);
		}
		api.availableNumbers(number, size, function(success, data) {
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

vorpal.find('exit').description('Quits the CLI').action(function(args, callback) {
	api.disconnect();
	process.exit();
});

function validateNumber(args) {
	if(!NTSAPI.validators.isTelephoneNumber(args.number)) {
		return "Invalid number format.";
	}
	return true;
}

function validateAllocatableNumber(args) {
	if(!NTSAPI.validators.isAllocatableNumber(args.number)) {
		return "Invalid number format.";
	}
	return true;
}

function validateAvailable(args) {
	if(!NTSAPI.validators.isAllocatableNumber(args.number)) {
		return 'Invalid number format';
	}
	if(args.size) {
		var size = parseInt(args.size);
		if(size == NaN || size < 1) {
			return 'Invalid size';
		}
	}
	return true;
}
