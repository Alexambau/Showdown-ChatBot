/**
 * Moderation Filter: Stretching
 */

'use strict';

const Stretch_Default_Value = 1;

const Path = require('path');
const Translator = Tools('translate');

const translator = new Translator(Path.resolve(__dirname, 'stretching.translations'));

exports.id = 'stretching';

exports.parse = function (context) {
	const StrechRegExp = new RegExp('(.)\\1{10,}', 'g');
	const HardStrechRegExp = new RegExp('(.)\\1{25,}', 'g');
	const RepeatRegExp = new RegExp('(..+)\\1{8,}', 'g');
	let msg = context.noNicksMsgLow;
	let val = this.getModTypeValue(exports.id, Stretch_Default_Value);
	if (HardStrechRegExp.test(msg)) {
		context.infractions.push(exports.id);
		context.totalPointVal += (val + 1);
		if (context.pointVal < (val + 1)) {
			context.pointVal = (val + 1);
			context.muteMessage = translator.get('stretch', this.getLanguage(context.room));
		}
	} else if (StrechRegExp.test(msg)) {
		context.infractions.push(exports.id);
		context.totalPointVal += val;
		if (context.pointVal < val) {
			context.pointVal = val;
			context.muteMessage = translator.get('stretch', this.getLanguage(context.room));
		}
	} else if (RepeatRegExp.test(msg)) {
		context.infractions.push(exports.id);
		context.totalPointVal += val;
	}
};
