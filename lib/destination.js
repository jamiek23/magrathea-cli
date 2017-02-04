'use strict';
const validators = require('./validators');

class Destination {

	static get types() {
		return {
			telephone: 0,
			fax: 1,
			voicemail: 2,
			sip: 3,
			sipInbandDTMF: 4,
			iax: 5,
			tls: 6
		};
	};

	constructor(obj) {
		var obj = obj || {};
		this.type = obj.type || this.constructor.types.telephone;
		this.username = obj.username;
		this.password = obj.password;
		this.number = obj.number;
		this.host = obj.host;
	}

	get type() {
		return this._type;
	}

	set type(type) {
		const types = this.constructor.types;
		for(var k in types) {
			if(types[k] === type) {
				this._type = type;
				return;
			}
		}
		throw new Error('Invalid value for type property given');
	}

	get email() {
		return this.username + '@' + this.hostname;
	}

	set email(email) {
		if(typeof email == 'undefined' || typeof email == 'null') {
			this._email = null;
			return;
		}
		if(typeof email != 'string') {
			throw new TypeError('Must be a string');
		}
		if(/@/g.exec(email).length !== 1) {
			throw new Error('Email is not valid');
		}
		var parts = email.split('@');
		this.username = parts[0];
		this.hostname = parts[1];
	}

	get number() {
		return this._number;
	}

	set number(number) {
		if(typeof number == 'undefined' || typeof number == 'null') {
			this._number = null;
			return;
		}
		if(typeof number != 'string') {
			throw new TypeError('Must be a string');
		}
		this._number = validators.stripNonNumeric(number);
	}

	get username() {
		return this._username;
	}

	set username(username) {
		if(typeof username == 'undefined' || typeof username == 'null') {
			this._username = null;
			return;
		}
		if(typeof username != 'string') {
			throw new TypeError('Must be a string');
		}
		this._username = validators.stripWhitespace(username);
	}

	get password() {
		return this._password;
	}

	set password(pass) {
		if(typeof pass == 'undefined' || typeof pass == 'null') {
			this._password = null;
			return;
		}
		if(typeof pass != 'string') {
			throw new TypeError('Must be a string');
		}
		this._password = validators.stripWhitespace(pass);
	}

	get host() {
		return this._host;
	}

	set host(host) {
		if(typeof host == 'undefined' || typeof pass == 'null') {
			this._host = null;
			return;
		}
		if(typeof host != 'string') {
			throw new TypeError('Must be a string');
		}
		this._host = validators.stripWhitespace(host);
	}

	toString() {
		var dest = '';
		const types = this.constructor.types;
		if(this.type === types.telephone) {
			return this.number;
		}
		if((this.type === types.fax || this.type === types.voicemail) && this.username && this.hostname) {
			if(this.type == types.fax) {
				dest = 'F:';
			}
			else {
				dest = 'V:';
			}
			dest += this.email;
			return dest;
		}
		if(this.username && this.hostname) {
			switch(this.type) {
				case types.sip:
					dest = 'S:';
					break;
				case types.sipInbandDTMF:
					dest = 's:';
					break;
				case types.iax:
					dest = 'I:';
					break;
				case types.tls:
					dest = 'E:';
					break;
			}
			dest += this.username;
			if(this.password) {
				dest += ':' + this.password;
			}
			dest += '@' + this.hostname;
			return dest;
		}
	}
}

module.exports = Destination;
