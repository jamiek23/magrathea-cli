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

	static parse(dest) {
		if(typeof dest != 'string') {
			throw new TypeError();
		}
		var obj = {};
		var types = this.types;
		if(validators.isTelephoneNumber(dest)) {
			// Assume it's a telephone number
			obj.type = types.telephone;
			obj.number = dest;
			return obj;
		}
		dest = dest.split(':');
		if(dest.length < 2 || dest.length > 3) {
			// Return an empty object for a string with too many/few colons,
			// as it is probably a format we don't understand.
			return obj;
		}
		switch(dest[0]) {
			case 'F':
				obj.type = types.fax;
				break;
			case 'V':
				obj.type = types.voicemail;
				break;
			case 'S':
				obj.type = types.sip;
				break;
			case 's':
				obj.type = types.sipInbandDTMF;
				break;
			case 'I':
				obj.type = types.iax;
				break;
			case 'E':
				obj.type = types.tls;
				break;
			default:
				break;
		}
		if(dest.length == 3) {
			var parts = dest[2].split('@');
			obj.username = dest[1];
			obj.password = parts[0];
			obj.host = parts[1];
		}
		else {
			var parts = dest[1].split('@');
			obj.username = parts[0];
			obj.host = parts[1];
		}
		return obj;
	}

	constructor(obj) {
		if(typeof obj == 'string') {
			obj = this.constructor.parse(obj);
		}
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
		return this.username + '@' + this.host;
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
		this.host = parts[1];
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
		if((this.type === types.fax || this.type === types.voicemail) && this.username && this.host) {
			if(this.type == types.fax) {
				dest = 'F:';
			}
			else {
				dest = 'V:';
			}
			dest += this.email;
			return dest;
		}
		if(this.username && this.host) {
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
			dest += '@' + this.host;
			return dest;
		}
	}
}

module.exports = Destination;
