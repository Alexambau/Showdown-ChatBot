/**
 * Translate System
 */

'use strict';

const Text = Tools('text');
const FileSystem = require('fs');

/**
 * Represents a basic translator
 */
class Translator {
	/**
	 * @param {Path} file - Translations file
	 */
	constructor(file) {
		this.data = {};
		let str = FileSystem.readFileSync(file).toString();
		let lines = str.split('\n');
		let currentLang = null;
		for (let i = 0; i < lines.length; i++) {
			lines[i] = lines[i].trim();
			if (!lines[i]) continue;
			switch (lines[i].charAt(0)) {
			case '%':
				currentLang = Text.toId(lines[i].substr(1));
				if (!currentLang) {
					currentLang = null;
					continue;
				}
				if (!this.data[currentLang]) this.data[currentLang] = {};
				break;
			case '$':
				if (!currentLang) continue;
				lines[i] = lines[i].substr(1);
				let spl = lines[i].split('=');
				let id = Text.toId(spl.shift());
				if (!id) continue;
				this.data[currentLang][id] = spl.join('=').trim();
				break;
			}
		}
	}

	/**
	 * @param {String|Number} key
	 * @param {String} lang
	 * @returns {String} Translated key
	 */
	get(key, lang) {
		if (typeof key !== 'string') key = '' + key;
		if (lang && this.data[lang] && typeof this.data[lang][key] === 'string') {
			return this.data[lang][key];
		} else {
			for (let l in this.data) {
				if (typeof this.data[l][key] === 'string') {
					return this.data[l][key];
				}
			}
			return 'undefined';
		}
	}
}

module.exports = Translator;
