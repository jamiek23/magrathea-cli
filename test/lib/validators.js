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
			assert.equal(validators.stripWhitespace('aa bb   ccc!@;'), 'aabbccc!@;');
		});
		it('should strip newlines', function() {
			assert.equal(validators.stripWhitespace("aa\nbb"), 'aabb');
		});
		it('should cope with null/empty strings', function() {
			assert.strictEqual(validators.stripWhitespace(''), '');
			assert.strictEqual(validators.stripWhitespace(null), '');
		});
	});
});
