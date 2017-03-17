'use strict';

const abbreviations = require('./eha-abbreviations').sort((a, b) => b[0].length - a[0].length);
const Postcode = require('postcode');

class Validators {
	static isTelephoneNumber(number) {
		return /^\+?[0-9]+$/g.test(number);
	}

	static isAllocatableNumber(number) {
		return /^\+?[0-9_]+$/g.test(number);
	}

	static stripWhitespace(number) {
		if (typeof number != 'string') {
			return '';
		}
		return number.replace(/[+\s]+/g, '');
	}

	static stripNonNumeric(text) {
		if (typeof text != 'string') {
			return '';
		}
		return text.replace(/[^0-9]+/g, '');
	}

	/**
	 * Replaces words with abbreviations, as required by EHA standards.
	 * @param text {string}
	 * @returns {string}
	 */
	static emergencyAbbreviate(text) {
		if (typeof text != 'string') {
			return '';
		}
		abbreviations.forEach((word) => {
			text = text.split(word[0]).join(word[1]);
		});
		return text;
	}

	static isUKPostcode(postcode) {
		return (new Postcode(postcode)).valid();
	}
}

module.exports = Validators;
