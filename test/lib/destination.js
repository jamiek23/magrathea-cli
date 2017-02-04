const assert = require('assert');
const Destination = require('../../lib/destination');

describe('Destination', function() {
	var dest;
	beforeEach(function() {
		dest = new Destination();
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
			dest.hostname = 'sip.mydomain.example';
			assert.equal(dest.toString(), 'S:myuser@sip.mydomain.example');
		});
		it('correctly stringifies SIP type with password', function() {
			dest.type = Destination.types.sip;
			dest.username = 'myuser';
			dest.password = 'pass';
			dest.hostname = 'sip.mydomain.example';
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
