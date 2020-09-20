const mcc = require('../mcc.js');
const Discord = require('discord.js');

module.exports = {
	name: 'mcchistory',
	description: 'Test command for MCC',
	aliases: ['mcc', 'mcch'],
	usage: '[-VERSION] [GAMERTAG]',
	args: true,
	supportsProfiles: true,

	async execute(message, args) {
		let gamerTag = '';
		let version = 'xbox-one';
		if (args.length) {
			if (args[0].startsWith('-')) {
				version = args.shift().substring(1).toLowerCase();
				if (version !== 'xbox-one' && version !== 'xbox' && version !== 'pc' && version !== 'windows') {
					return message.reply('Invalid option. Use either \'-xbox\' or \'-pc\'. No option assumes Xbox.');
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
		}
		if (args.length) {
			gamerTag = args.join(' ');
		}
		else {
			gamerTag = message.client.profiles.get(message.author.id);
		}
		const prom1 = mcc.getHistory(version, gamerTag);
		const prom2 = mcc.getHistory(version, gamerTag, 2);
		const [ res1, res2 ] = await Promise.all([ prom1, prom2 ]);
		gamerTag = res1[0].Gamertag;
		const games = res1[0].Stats.concat(res2[0].Stats);
		if (games.length == 0) {
			return message.reply(`${gamerTag} has no games played in MCC.`);
		}
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

		const gamertagURL = gamerTag.split(' ').join('%20');
		const embed = new Discord.MessageEmbed();
		const data = [];
		data.push('```diff');
		data.push(winString);
		data.push(midString);
		data.push(lossString);
		if (gamesToday && gamesToday < 20) {
			embed.setDescription(`Matches completed today: ${gamesToday}`);
			const firstGameLocation = ' '.repeat(midString.length - gamesToday) + '^';
			data.push(firstGameLocation);
		}
		data.push('```');

		embed
			.setTitle(gamerTag)
			.setURL(`https://www.halowaypoint.com/en-us/games/halo-the-master-chief-collection/${version}/game-history?gamertags=${gamertagURL}`)
			.addFields({ name: 'Last 20 MCC games:', value: data },
			);
		message.channel.send(embed);
	},
};
