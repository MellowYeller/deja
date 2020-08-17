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
		gamerTag = res[0].Gamertag;
		const games = res[0].Stats;
		let gamesToday = 0;
		const today = new Date();
		today.setMilliseconds(0);
		today.setSeconds(0);
		today.setMinutes(0);
		today.setHours(0);
		let winString = '';
		let midString = '';
		let lossString = '';
		for (const game of games) {
			const gameDay = new Date(game.DateTime);
			gameDay.setMilliseconds(0);
			gameDay.setSeconds(0);
			gameDay.setMinutes(0);
			gameDay.setHours(0);
			if (today.getTime() === gameDay.getTime()) gamesToday++;
			const result = game.Won;
			if (result) {
				winString = 'W' + winString;
				midString = '-' + midString;
				lossString = ' ' + lossString;
			}
			else {
				winString = ' ' + winString;
				midString = '-' + midString;
				lossString = 'L' + lossString;
			}
		}
		winString = '+  |' + winString;
		midString = '---|' + midString;
		lossString = '-  |' + lossString;

		const embed = new Discord.MessageEmbed();
		const data = [];
		data.push('```diff');
		data.push(winString);
		data.push(midString);
		data.push(lossString);
		if (gamesToday && gamesToday < 10) {
			embed.setDescription(`Matches completed today: ${gamesToday}`);
			const firstGameLocation = ' '.repeat(midString.length - gamesToday) + '^';
			data.push(firstGameLocation);
		}
		data.push('```');

		embed
			.setTitle(gamerTag)
			.setURL(`https://www.halowaypoint.com/en-us/games/halo-the-master-chief-collection/${version}/game-history?gamertags=${gamerTag.replace(' ', '%20')}`)
			.addFields({ name: 'Last 10 games:', value: data },
			);
		message.channel.send(embed);
	},
};
