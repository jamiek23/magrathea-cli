'use strict';

class Validators {
	static isTelephoneNumber(number) {
		return /^\+?[0-9]+$/g.test(number);
	}
	
	static isAllocatableNumber(number) {
		return /^\+?[0-9_]+$/g.test(number);
	}

	static stripWhitespace(number) {
		if(typeof number != 'string') {
			return '';
		}
		return number.replace(/[+\s]+/g, '');
	}
}

module.exports = Validators;
