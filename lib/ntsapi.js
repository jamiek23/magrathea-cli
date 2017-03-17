'use strict';

const EventEmitter = require('events');
const net = require('net');
const tls = require('tls');
const debug = require('debug')('ntsapi');
const Validators = require('./validators');
const Destination = require('./destination');

class NTSAPI extends EventEmitter {
	constructor() {
		super();

		/**
		 * @protected
		 * @type {boolean}
		 */
		this._connected = false;

		/**
		 * The socket we use for communication
		 * @protected
		 * @type {net.Socket|tls.Socket}
		 */
		this.socket = null;

		/**
		 * Sets if we should use the TLS endpoint or not
		 * @type {boolean}
		 */
		this.secure = true;
	}

	/**
	 * Creates an instance of {NTSAPI} and connects it using the default settings.
	 * @param cb
	 * @returns {NTSAPI}
	 */
	static connect(cb) {
		var session = new NTSAPI();
		session.connect(cb);
		return session;
	}

	/**
	 * Provides access to the Validators used in the API.
	 * @returns {Validators}
	 */
	static get Validators() {
		return Validators;
	}

	/**
	 * Provides access to the destination object.
	 * @returns {Destination}
	 */
	static get Destination() {
		return Destination;
	}

	/**
	 * Says whether we are connected or not
	 * @returns {boolean}
	 */
	get connected() {
		return this._connected;
	}

	/**
	 * Connects to the API endpoint
	 * @param cb {function} function to be called after the connection is established (or fails)
	 * @returns {boolean} returns true or false depending on if we attempted to connect (not whether it succeeds or fails!)
	 */
	connect(cb) {
		var dataBuffer = '';
		if(this._connected) {
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
			self._connected = true;
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
			self._connected = false;
			self.emit('close');
			debug('Socket closed');
		});

		this.socket.on('data', function(data) {
			var data = data;
			var isComplete = (data.substr(-1) == "\n");
			if(dataBuffer.length) {
				data = dataBuffer + data;
				dataBuffer = '';
			}
			if(/\n/g.test(data)) {
				data = data.split("\n");
				var lastIndex = (data.length - 1);
				data.forEach(function(line, i) {
					if(line == '') {
						// Ignore the end of lines
						return;
					}
					if(i == lastIndex && !isComplete) {
						// We got a partial amount of data - store it for the next event
						dataBuffer = line;
					}
					else {
						// We got a full line
						debug('Recieved:', line);
						self.emit('data', line);
					}
				});
			}
			else {
				// No newline characters, so assume just a chunk of data
				dataBuffer = data;
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

	/**
	 * Disconnects a current API session, cleaning up the socket after use.
	 * @returns {boolean} returns true if we will try and close the socket, or false if it is already closed.
	 */
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
		return true;
	}

	/**
	 * Returns information about the current connection.
	 * @returns {object}
	 */
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

	/**
	 * Authenticates a connected endpoint, using a username and password
	 * @param username {string}
	 * @param password {string}
	 * @param cb {function} called with result
	 */
	auth(username, password, cb) {
		var username = username.replace(/[^a-zA-Z0-9\_\-\.]/g, '');
		var password = password.replace(/[^a-zA-Z0-9\_\-\.]/g, '');
		this.command('AUTH ' + username + ' ' + password, function(success, message) {
			cb(success);
		});
	}

	/**
	 * Tries to allocate a given telephone number
	 * @param number {string}
	 * @param cb
	 */
	allocate(number, cb) {
		if(!Validators.isAllocatableNumber(number)) {
			throw new Error('Invalid number format');
		}
		this.command('ALLO ' + number, function(success, message, code) {
			cb(success, success ? message[0] : message);
		});
	}

	/**
	 * Activates a telephone number
	 * @param number
	 * @param cb
	 */
	activate(number, cb) {
		if(!Validators.isTelephoneNumber(number)) {
			throw new Error('Invalid number format');
		}
		this.command('ACTI ' + number, function(success, message) {
			cb(success, message);
		});
	}

	/**
	 * Deactivates a telephone number
	 * @param number
	 * @param cb
	 */
	deactivate(number, cb) {
		if(!Validators.isTelephoneNumber(number)) {
			throw new Error('Invalid number format');
		}
		this.command('DEAC ' + number, function(success, message) {
			cb(success, message);
		});
	}

	/**
	 * Reactivates a telephone number that was deactivated
	 * @param number
	 * @param cb
	 */
	reactivate(number, cb) {
		if(!Validators.isTelephoneNumber(number)) {
			throw new Error('Invalid number format');
		}
		this.command('REAC ' + number, function(success, message) {
			cb(success, message);
		});
	}

	/**
	 * Gets the status of a telephone number
	 * @param number
	 * @param cb
	 */
	status(number, cb) {
		if(!Validators.isTelephoneNumber(number)) {
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
					destinations: result[3].split('|').filter((dest) => dest.length).map((dest) => new Destination(dest))
				};
				cb(success, data);
			}
		});
	}

	/**
	 * Sets the destination for a telephone number
	 * @param number {string}
	 * @param index {number} The
	 * @param dest {Destination}
	 * @param cb {function}
	 */
	destination(number, index, dest, cb) {
		if(!Validators.isTelephoneNumber(number)) {
			throw new Error('Invalid number format');
		}
		if(!dest instanceof Destination) {
			throw new TypeError('Destination must be a Destination object')
		}
		var index = parseInt(index);
		this.command('SET ' + number + ' ' + index + ' ' + dest.toString(), function(success, message){
			cb(success, message);
		});
	};

	/**
	 * Sets the voicemail PIN on a telephone number
	 * @param number {string}
	 * @param pin {string}
	 */
	pin(number, pin) {
		throw new Error('Not implemented!');
	};

	/**
	 *
	 * @param account {string}
	 * @param name {string} the feature name
	 * @param state {boolean} whether it is enabled or disabled
	 */
	feature(account, name, state) {
		throw new Error('Not implemented!');
	};

	/**
	 *
	 * @param number
	 * @param index
	 * @param periods
	 */
	order(number, index, periods) {
		throw new Error('Not implemented!');
	};

	/**
	 * Gets an array of available numbers
	 * @param range
	 * @param size
	 * @param cb
	 */
	availableNumbers(range, size, cb) {
		if(!Validators.isAllocatableNumber(range)) {
			throw new Error('Invalid number format');
		}
		var self = this;
		var size = parseInt(size);
		if(size == NaN || size < 1) {
			throw new Error('Invalid number format');
		}
		// We need to use our own data callback, as this command
		// is special - it will return multiple lines of data.
		this.on('data', dataParser);
		this.command('ALIST ' + range + ' ' + size);
		var numbers = [];
		function dataParser(data) {
			var result = self._processResult(data);
			if(result.success) {
				numbers.push(result.data);
				return;
			}
			self.removeListener('data', dataParser);
			if(numbers.length) {
				cb(true, numbers);
			}
			else {
				cb(false, result.data);
			}
		}
	};

	/**
	 *
	 * @param address
	 */
	info(address) {
		throw new Error('Not implemented!');
	};

	/**
	 * Sends a command to the socket, and waits for a response
	 * @param action
	 * @param cb callback when we receive a response to our command
	 */
	command(action, cb) {
		this._checkConnected();
		debug('Sending:', action);
		this.socket.write(action);
		if(cb && typeof cb == 'function') {
			var listener = function listener(data) {
				var result = this._processResult(data);
				cb(result.success, result.data, result.code);
			};
			this.once('data', listener);
		}
	}

	/**
	 * Takes a result string we are sent and turns it into a JS object
	 * @param result
	 * @returns {{success: boolean, code: Number, data}}
	 * @private
	 */
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

	/**
	 * Throws an exception if we're not currently connected
	 * @private
	 */
	_checkConnected() {
		if(!this.connected) {
			throw new Exception('Socket is not connected!');
		}
	}
}

module.exports = NTSAPI;
