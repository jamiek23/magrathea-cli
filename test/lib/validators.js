const assert = require('assert');
const validators = require('../../lib/validators');

describe('Validators', function() {
	describe('.isTelephoneNumber()', function() {
		it('should return true for a national number', function(){
			assert.strictEqual(validators.isTelephoneNumber('01234567890'), true);
		});
		it('should return true for an international number', function(){
			assert.strictEqual(validators.isTelephoneNumber('+441234567890'), true);
		});
		it('should return false for numbers with letters', function(){
			assert.strictEqual(validators.isTelephoneNumber('0800-CALL-NOW'), false);
		});
		it('should return false for empty/null', function(){
			assert.strictEqual(validators.isTelephoneNumber(null), false);
			assert.strictEqual(validators.isTelephoneNumber(''), false);
		});
	});

	describe('.isAllocatableNumber()', function() {
		it('should return true for a national number', function(){
			assert.strictEqual(validators.isAllocatableNumber('01234567890'), true);
		});
		it('should return true for an international number', function(){
			assert.strictEqual(validators.isAllocatableNumber('+441234567890'), true);
		});
		it('should return true for a national number with underscores', function(){
			assert.strictEqual(validators.isAllocatableNumber('012345678__'), true);
			assert.strictEqual(validators.isAllocatableNumber('01234_6_8_0'), true);
		});
		it('should return true for an international number with underscores', function(){
			assert.strictEqual(validators.isAllocatableNumber('+4412345678__'), true);
			assert.strictEqual(validators.isAllocatableNumber('+441234__78__'), true);
		});
		it('should return false for numbers with letters', function(){
			assert.strictEqual(validators.isAllocatableNumber('0800-CALL-NOW'), false);
		});
		it('should return false for empty/null', function(){
			assert.strictEqual(validators.isAllocatableNumber(null), false);
			assert.strictEqual(validators.isAllocatableNumber(''), false);
		});
	});

	describe('.stripWhitespace()', function() {
		it('should strip only whitespace', function() {
			assert.equal(validators.stripWhitespace('aa bb   ccc!@;+'), 'aabbccc!@;');
		});
		it('should strip newlines', function() {
			assert.equal(validators.stripWhitespace("aa\nbb"), 'aabb');
		});
		it('should cope with null/empty strings', function() {
			assert.strictEqual(validators.stripWhitespace(''), '');
			assert.strictEqual(validators.stripWhitespace(null), '');
		});
	});

	describe('.stripNonNumeric()', function() {
		it('should strip alpha characters', function() {
			assert.equal(validators.stripNonNumeric('abcdefghijklmnopqrstuvwxyz'), '');
		});
		it('should allow numbers', function() {
			assert.equal(validators.stripNonNumeric('+44(1234)567890'), '441234567890');
		});
		it('should cope with null/empty strings', function() {
			assert.strictEqual(validators.stripNonNumeric(''), '');
			assert.strictEqual(validators.stripNonNumeric(null), '');
		});
	});

	describe('.emergencyAbbreviate()', function() {
		it('should cope with null/empty strings', function() {
			assert.strictEqual(validators.emergencyAbbreviate(''), '');
			assert.strictEqual(validators.emergencyAbbreviate(null), '');
		});

		it('abbreviates words', function(){
			assert.equal(validators.emergencyAbbreviate('Chimney Sweep'), 'Chim Swp');
			assert.equal(validators.emergencyAbbreviate('Zinc'), 'Zn');
		});

		it('replaces words with the correct abbreviation', function(){
			assert.equal(validators.emergencyAbbreviate('My job is a Chiropodist (State Registered)'), 'My job is a Chrpdst (SR)');
		});
	});

	describe('.isUKPostcode()', function() {
		it('should cope with null/empty strings', function() {
			assert.strictEqual(validators.isUKPostcode(''), false);
			assert.strictEqual(validators.isUKPostcode(null), false);
		});

		it('validates postcodes', function(){
			assert.equal(validators.isUKPostcode('MK3 6EB'), true);
			assert.equal(validators.isUKPostcode('MK170SR'), true);
		});

		it('copes with postcodes with strange cases', function(){
			assert.equal(validators.isUKPostcode('Mk3 6eB'), true);
			assert.equal(validators.isUKPostcode('MK170sr'), true);
		});

		it('rejects invalid strings', function(){
			// US ZIP code
			assert.equal(validators.isUKPostcode('20001'), true);
		});
	});
});
