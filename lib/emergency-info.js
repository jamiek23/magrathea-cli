'use strict';
const validators = require('./validators');
const Postcode = require('postcode');

class EmergencyInfo{
	/**
	 * Get the company name or person's surname.
	 * @returns {string}
	 */
	get name() {
		return this._name;
	}

	/**
	 * Set the company name or person's surname.
	 * @param name {string}
	 */
	set name(name) {
		if(typeof name != 'string') {
			throw new TypeError('Must be a string');
		}
		this._name = validators.emergencyAbbreviate(name);
	}

	/**
	 * Get the person's forename, or null if not set.
	 * @returns {string|null}
	 */
	get forename() {
		return this._forename;
	}

	/**
	 * Set the person's forename.
	 * @param forename {string|null}
	 */
	set forename(forename) {
		if(typeof forename == 'undefined' || typeof forename == 'null') {
			this._forename = null;
			return;
		}
		if(typeof forename != 'string') {
			throw new TypeError('Must be a string');
		}
		this._forename = forename;
	}

	/**
	 * Get the business suffix, or null if not set.
	 * @returns {string|null}
	 */
	get businessSuffix() {
		return this._businessSuffix;
	}

	/**
	 * Set the business suffix.
	 * @param suffix {string|null} The business suffix (e.g. Plc, Ltd)
	 */
	set businessSuffix(suffix) {
		if(typeof suffix == 'undefined' || typeof suffix == 'null') {
			this._businessSuffix = null;
			return;
		}
		if(typeof suffix != 'string') {
			throw new TypeError('Must be a string');
		}
		this._businessSuffix = validators.emergencyAbbreviate(suffix);
	}

	/**
	 * Get the house/building name/number.
	 * @returns {string}
	 */
	get premises() {
		return this._premises;
	}

	/**
	 * Set the house/building name/number.
	 * @param name {string}
	 */
	set premises(name) {
		if (typeof premises != 'string') {
			throw new TypeError('Must be a string');
		}
		this._premises = name;
	}

	/**
	 * Get the street name.
	 * @returns {string}
	 */
	get thoroughfare() {
		return this._thoroughfare;
	}

	/**
	 * Set the street name.
	 * @param thoroughfare {string}
	 */
	set thoroughfare(thoroughfare) {
		if (typeof thoroughfare != 'string') {
			throw new TypeError('Must be a string');
		}
		this._thoroughfare = thoroughfare;
	}


	/**
	 * Get the town/village.
	 * @returns {string}
	 */
	get locality() {
		return this._locality;
	}

	/**
	 * Set the town/village.
	 * @param locality {string}
	 */
	set locality(locality) {
		if (typeof locality != 'string') {
			throw new TypeError('Must be a string');
		}
		this._locality = locality;
	}

	/**
	 * Get the UK postcode for the address.
	 * @returns {string}
	 */
	get postcode() {
		return this._postcode;
	}

	/**
	 * Set the UK postcode for the address.
	 * @param postcode {string} A UK postcode
	 */
	set postcode(postcode) {
		if(typeof postcode != 'string') {
			throw new TypeError('Must be a string');
		}
		var pcode = new Postcode(postcode);
		if(!pcode.valid()) {
			throw new Error('Must be a postcode');
		}
		this._postcode = pcode.normalise();
	}
}