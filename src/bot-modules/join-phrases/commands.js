/**
 * Commands File
 *
 * joinphrase: configures joinphrases
 * listjoinphrases: views joinphrases list
 * listjoinphraseshastebin: views joinphrases list (via Hastebin)
 */

'use strict';

const Path = require('path');
const Translator = Tools('translate');
const Text = Tools('text');
const Chat = Tools('chat');
const Hastebin = Tools('hastebin');

const translator = new Translator(Path.resolve(__dirname, 'commands.translations'));

module.exports = {
	joinphrase: function (App) {
		if (!this.can('joinphrases', this.room)) return this.replyAccessDenied('joinphrases');
		let config = App.modules.joinphrases.system.config;
		let room = this.targetRoom;
		if (this.getRoomType(room) !== 'chat') return this.errorReply(translator.get('nochat', this.lang));
		let user;
		switch (Text.toId(this.args[0])) {
		case 'add':
		case 'set':
			user = Text.toId(this.args[1]);
			let phrase = Text.trim(this.args.slice(2).join(','));
			if (!user || !phrase) {
				return this.errorReply(this.usage({desc: 'get'}, {desc: this.usageTrans('user')},
					{desc: translator.get('phrase', this.lang)}));
			}
			if (user.length > 19) return this.errorReply(translator.get('inv', this.lang));
			if (!config.rooms[room]) config.rooms[room] = {};
			config.rooms[room][user] = phrase;
			App.modules.joinphrases.system.db.write();
			App.logCommandAction(this);
			this.reply(translator.get(0, this.lang) + ' ' + Chat.italics(user) + ' ' + translator.get(1, this.lang) +
				' ' + Chat.italics(this.parser.getRoomTitle(room)));
			break;
		case 'remove':
		case 'delete':
			user = Text.toId(this.args[1]);
			if (!user) return this.errorReply(this.usage({desc: 'get'}, {desc: this.usageTrans('user')}));
			if (config.rooms[room] && config.rooms[room][user]) {
				delete config.rooms[room][user];
				if (Object.keys(config.rooms[room]).length === 0) {
					delete config.rooms[room];
				}
				App.modules.joinphrases.system.db.write();
				App.logCommandAction(this);
				this.reply(translator.get(2, this.lang) + '' + Chat.italics(user) + ' ' + translator.get(1, this.lang) +
					' ' + Chat.italics(this.parser.getRoomTitle(room)));
			} else {
				this.errorReply(translator.get(3, this.lang) + ' ' + Chat.italics(user) + ' ' +
					translator.get(1, this.lang) + ' ' + Chat.italics(this.parser.getRoomTitle(room)));
			}
			break;
		case 'get':
			user = Text.toId(this.args[1]);
			if (!user) return this.errorReply(this.usage({desc: 'get'}, {desc: this.usageTrans('user')}));
			if (config.rooms[room] && config.rooms[room][user]) {
				this.reply(Text.stripCommands(config.rooms[room][user]));
			} else {
				this.errorReply(translator.get(3, this.lang) + ' ' + Chat.italics(user) + ' ' +
					translator.get(1, this.lang) + ' ' + Chat.italics(this.parser.getRoomTitle(room)));
			}
			break;
		default:
			this.errorReply(this.usage({desc: 'set / delete / get'}));
		}
	},

	listjoinphrases: function (App) {
		if (!this.can('joinphrases', this.room)) return this.replyAccessDenied('joinphrases');
		let config = App.modules.joinphrases.system.config;
		let server = App.config.server.url;
		if (!server) {
			this.cmd = 'listjoinphraseshastebin';
			return App.parser.exec(this);
		}
		let room = this.targetRoom;
		if (this.getRoomType(room) !== 'chat') return this.errorReply(translator.get('nochat', this.lang));
		if (!config.rooms[room]) {
			return this.errorReply(translator.get(4, this.lang) + " " + Chat.italics(this.parser.getRoomTitle(room)));
		}
		let html = '';
		html += '<html>';
		html += '<head><title>Join-Phrases of ' + Text.escapeHTML(this.parser.getRoomTitle(room)) + '</title></head>';
		html += '<body>';
		html += '<h3>Join-Phrases in ' + Text.escapeHTML(this.parser.getRoomTitle(room)) + '</h3>';
		html += '<ul>';
		for (let user in config.rooms[room]) {
			html += '<li>';
			html += '<strong>' + user + '</strong> - ';
			html += Text.escapeHTML(config.rooms[room][user]);
			html += '</li>';
		}
		html += '</ul>';
		html += '</body>';
		html += '</html>';
		let key = App.data.temp.createTempFile(html);
		if (server.charAt(server.length - 1) === '/') {
			return this.pmReply(App.config.server.url + 'temp/' + key);
		} else {
			return this.pmReply(App.config.server.url + '/temp/' + key);
		}
	},

	listjoinphraseshastebin: function (App) {
		if (!this.can('joinphrases', this.room)) return this.replyAccessDenied('joinphrases');
		let config = App.modules.joinphrases.system.config;
		let room = this.targetRoom;
		if (this.getRoomType(room) !== 'chat') return this.errorReply(translator.get('nochat', this.lang));
		if (!config.rooms[room]) {
			return this.errorReply(translator.get(4, this.lang) + " " + Chat.italics(this.parser.getRoomTitle(room)));
		}
		let text = '';
		text += 'Join-Phrases in ' + this.parser.getRoomTitle(room) + ':\n\n';
		for (let user in config.rooms[room]) {
			text += user + ' - ';
			text += config.rooms[room][user];
			text += '\n';
		}
		Hastebin.upload(text, function (link, err) {
			if (err) {
				this.pmReply(translator.get(5, this.lang));
			} else {
				this.pmReply(link);
			}
		}.bind(this));
	},
};
