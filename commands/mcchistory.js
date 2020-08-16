const mcc = require('../mcc.js');
const Discord = require('discord.js');

module.exports = {
	name: 'mcchistory',
	description: 'Test command for MCC',
	aliases: ['mcc'],
	usage: '[-VERSION] [GAMERTAG]',
	args: true,
	supportsProfiles: true,

	async execute(message, args) {
		let gamerTag = '';
		let version = '';
		if (args.length) {
			if (args[0].startsWith('-')) {
				version = args.shift().substring(1).toLowerCase();
				if (version !== 'xbox-one' && version !== 'xbox' && version !== 'pc' && version !== 'windows') {
					return message.reply('Invalid option. Use either \'-xbox\' or \'-pc\'.');
				}
				switch (version) {
				case 'xbox':
					version = 'xbox-one';
					break;
				case 'pc':
					version = 'windows';
					break;
				}
			}
			else {
				return message.reply('Please select version. Use either \'-xbox\' or \'-pc\'.');
			}
		}
		if (args.length) {
			gamerTag = args.join(' ');
		}
		else {
			gamerTag = message.client.profiles.get(message.author.id);
		}
		const res = await mcc.getHistory(version, gamerTag);
		console.log(JSON.stringify(res));
	},
};
