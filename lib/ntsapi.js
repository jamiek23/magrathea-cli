'use strict';

const EventEmitter = require('events');
const net = require('net');
const tls = require('tls');
const debug = require('debug')('ntsapi');
const validators = require('./validators');

class NTSAPI extends EventEmitter {
	constructor() {
		super();
		this.connected = false;
		this.socket = null;
		this.secure = true;
	}

	static connect(cb) {
		var session = new NTSAPI();
		session.connect(cb);
		return session;
	}

	static get validators() {
		return validators;
	}

	connect(cb) {
		var dataBuffer = '';
		if(this.connected) {
			return false;
		}
		var self = this;
		if(this.secure) {
			this.socket = new tls.TLSSocket();
		}
		else {
			this.socket = new net.Socket();
		}
		this.socket.setEncoding('ascii');
		this.socket.setKeepAlive(true, 10000);

		this.socket.on('connect', function() {
			self.socket.write(''); // Tell the far end we're here
			self.connected = true;
			cb(true);
			self.emit('connect');
			debug('Socket open');
			debug('Socket is', self.socket.encrypted ? 'secure' : 'insecure');
		});

		this.socket.on('secureConnect', function() {
			debug('Peer fingerprint:', self.socket.getPeerCertificate().fingerprint);
		});

		this.socket.on('error', function(err) {
			if(!self.connected) {
				cb(false, err);
			}
			debug('Socket error occurred:', err);
		});

		this.socket.on('close', function() {
			self.connected = false;
			self.emit('close');
			debug('Socket closed');
		});

		this.socket.on('data', function(data) {
			if(data.substr(-1) == "\n") {
				// The data, minus the line ending
				var data = data.substr(0, data.length - 1);
				self.emit('data', dataBuffer + data);
				debug('Recieved:', dataBuffer + data);
				dataBuffer = '';
			}
			else {
				dataBuffer += data;
			}
		});

		if(this.secure) {
			this.socket.connect(777, 'secure.magrathea-telecom.co.uk', { rejectUnauthorized: true });
		}
		else {
			this.socket.connect(777, 'api.magrathea-telecom.co.uk');
		}
		return true;
	}
	
	disconnect() {
		var socket = this.socket;
		if(!this.connected) {
			return false;
		}
		this.command('QUIT');
		// Make sure we close the session, even if we don't get a
		// response back.
		setTimeout(function() {
			if(!socket.destroyed) {
				socket.destroy();
			}
		}, 500);
	}

	connectionInfo() {
		var socket = this.socket;
		var info = {
			connected: this.connected,
			encrypted: (!!socket.encrypted)
		};
		if(!info.connected) {
			return info;
		}
		info.local = {
			address: socket.localAddress,
			port: socket.localPort
		};
		info.remote = {
			address: socket.remoteAddress,
			port: socket.remotePort
		};
		if(!info.encrypted) {
			return info;
		}
		info.remote.certificate = socket.getPeerCertificate();
		info.authorized = socket.authorized;
		if(!info.authorized) {
			info.authorizedError = socket.authorizationError;
		}
		info.protocol = socket.getProtocol();
		info.cipher = socket.getCipher();
		return info;
	}

	auth(username, password, cb) {
		var username = username.replace(/[^a-zA-Z0-9\_\-\.]/g, '');
		var password = password.replace(/[^a-zA-Z0-9\_\-\.]/g, '');
		this.command('AUTH ' + username + ' ' + password, function(success, message) {
			cb(success);
		});
	}

	allocate(number, cb) {
		if(!validators.isAllocatableNumber(number)) {
			throw new Error('Invalid number format');
		}
		this.command('ALLO ' + number, function(success, message, code) {
			cb(success, success ? message[0] : message);
		});
	}

	activate(number, cb) {
		if(!validators.isTelephoneNumber(number)) {
			throw new Error('Invalid number format');
		}
		this.command('ACTI ' + number, function(success, message) {
			cb(success, message);
		});
	}

	deactivate(number, cb) {
		if(!validators.isTelephoneNumber(number)) {
			throw new Error('Invalid number format');
		}
		this.command('DEAC ' + number, function(success, message, code) {
			cb(success, message);
		});
	}

	reactivate(number, cb) {
		if(!validators.isTelephoneNumber(number)) {
			throw new Error('Invalid number format');
		}
		this.command('REAC ' + number, function(success, message, code) {
			cb(success, message);
		});
	}

	status(number, cb) {
		if(!validators.isTelephoneNumber(number)) {
			throw new Error('Invalid number format');
		}
		this.command('STAT ' + number, function(success, message, code) {
			if(!success) {
				cb(success, message);
			}
			else {
				var result = message.split(' ');
				var data = {
					activated: (result[1] == 'Y'),
					expiry: new Date(result[2]),
					destinations: result[3].split('|')
				}
				cb(success, data);
			}
		});
	}

	destination(number, index, dest, cb) {
		if(!validators.isTelephoneNumber(number)) {
			throw new Error('Invalid number format');
		}
		var index = parseInt(index);
		this.command('SET ' + number + ' ' + index + ' ' + dest, function(success, message){
			cb(success, message);
		});
	};
	
	pin(number, pin) {
		throw new Error('Not implemented!');
	};

	feature(account, name, state) {
		throw new Error('Not implemented!');
	};

	order(number, index, periods) {
		throw new Error('Not implemented!');
	};
	
	availableNumbers(range, size) {
		throw new Error('Not implemented!');
	};
	
	info(address) {
		throw new Error('Not implemented!');
	};

	command(action, cb) {
		this._checkConnected();
		debug('Sending:', action);
		this.socket.write(action);
		function listener(data) {
			var result = this._processResult(data);
			cb(result.success, result.data, result.code);
		}
		this.once('data', listener);
	}

	_processResult(result) {
		var result = result.split(/\s+/);
		var code   = result.shift();
		result     = result.join(' ');
		return { 
			success: (code == '0'),
			code: parseInt(code),
			data: result
		};
	}

	_checkConnected() {
		if(!this.connected) {
			throw new Exception('Socket is not connected!');
		}
	}
};

module.exports = NTSAPI;