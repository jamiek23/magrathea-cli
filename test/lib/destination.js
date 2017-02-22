const assert = require('assert');
const Destination = require('../../lib/destination');

describe('Destination', function() {
	var dest;
	beforeEach(function() {
		dest = new Destination();
	});

	describe('.constructor()', function() {
		it('creates an instance from an object', function() {
			dest = new Destination({
				type: Destination.types.sip,
				host: 'sip.mydomain.example',
				username: 'sipuser'
			});
			assert(dest instanceof Destination);
			assert.equal(dest.type, Destination.types.sip);
			assert.equal(dest.host, 'sip.mydomain.example');
			assert.equal(dest.username, 'sipuser');
		});
		it('creates an instance from a string', function() {
			dest = new Destination('S:user@sip.mydomain');
			assert(dest instanceof Destination);
			assert.equal(dest.type, Destination.types.sip);
			assert.equal(dest.username, 'user');
			assert.equal(dest.username, 'user');
		});
	});

	describe('.parse()', function() {
		it('creates an object from a telephone number', function() {
			obj = Destination.parse('441234789567');
			assert.equal(obj.type, Destination.types.telephone);
			assert.equal(obj.number, '441234789567');
		});
		it('creates an object from a SIP string', function() {
			obj = Destination.parse('S:user@sip.mydomain');
			assert.equal(obj.type, Destination.types.sip);
			assert.equal(obj.username, 'user');
			assert.equal(obj.password, null);
			assert.equal(obj.host, 'sip.mydomain');
		});
		it('creates an object from a SIP string with password', function() {
			obj = Destination.parse('S:user:pass@sip.mydomain');
			assert.equal(obj.type, Destination.types.sip);
			assert.equal(obj.username, 'user');
			assert.equal(obj.password, 'pass');
			assert.equal(obj.host, 'sip.mydomain');
		});
		it('copes with an empty string', function() {
			obj = Destination.parse('');
			assert(Object.keys(obj).length === 0);
		});
	});

	describe('#toString()', function() {
		it('exists', function() {
			assert.equal(typeof dest.toString, 'function');
		});
		it('correctly stringifies telephone type', function() {
			dest.type = Destination.types.telephone;
			dest.number = '441234567890';
			assert.equal(dest.toString(), '441234567890');
		});
		it('correctly stringifies SIP type', function() {
			dest.type = Destination.types.sip;
			dest.username = 'myuser';
			dest.host = 'sip.mydomain.example';
			assert.equal(dest.toString(), 'S:myuser@sip.mydomain.example');
		});
		it('correctly stringifies SIP type with password', function() {
			dest.type = Destination.types.sip;
			dest.username = 'myuser';
			dest.password = 'pass';
			dest.host = 'sip.mydomain.example';
			assert.equal(dest.toString(), 'S:myuser:pass@sip.mydomain.example');
		});
	});

	describe('#username', function() {
		it('exists', function() {
			assert.strictEqual(dest.username, null);
		});
		it('accepts strings', function() {
			assert.doesNotThrow(function() {
				dest.username = 'myuser';
			}, TypeError);
		});
		it('rejects other types', function() {
			assert.throws(function() {
				dest.username = 234;
			}, TypeError);
			assert.throws(function() {
				dest.username = function(){};
			}, TypeError);
		});
	});

	describe('#password', function() {
		it('exists', function() {
			assert.strictEqual(dest.password, null);
		});
		it('accepts strings', function() {
			assert.doesNotThrow(function() {
				dest.password = 'mypass';
			}, TypeError);
		});
		it('rejects other types', function() {
			assert.throws(function() {
				dest.password = 234;
			}, TypeError);
			assert.throws(function() {
				dest.password = function(){};
			}, TypeError);
		});
	});

	describe('#host', function() {
		it('exists', function() {
			assert.strictEqual(dest.host, null);
		});
		it('accepts strings', function() {
			assert.doesNotThrow(function() {
				dest.host = 'sip.mydomain.example';
			}, TypeError);
		});
		it('rejects other types', function() {
			assert.throws(function() {
				dest.host = 234;
			}, TypeError);
			assert.throws(function() {
				dest.host = function(){};
			}, TypeError);
		});
	});

	describe('#number', function() {
		it('exists', function() {
			assert.strictEqual(dest.number, null);
		});
		it('accepts strings', function() {
			assert.doesNotThrow(function() {
				dest.number = '';
			}, TypeError);
		});
		it('rejects other types', function() {
			assert.throws(function() {
				dest.number = function(){};
			}, TypeError);
		});
	});
});
