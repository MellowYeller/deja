const mcc = require('../mcc.js');
const Discord = require('discord.js');

module.exports = {
	name: 'mcchistory',
	description: 'Test command for MCC',
	aliases: ['mcc', 'mcch'],
	usage: '[-VERSION] [GAMERTAG]',
	args: true,
	supportsProfiles: true,

	async execute(message, args, gamertag) {
		let version = 'xbox-one';
		const prom1 = mcc.getHistory(version, gamertag);
		const prom2 = mcc.getHistory(version, gamertag, 2);
		const [ res1, res2 ] = await Promise.all([ prom1, prom2 ]);
		gamertag = res1[0].Gamertag;
		const games = res1[0].Stats.concat(res2[0].Stats);
		if (games.length == 0) {
			return message.reply(`${gamertag} has no games played in MCC.`);
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

		const gamertagURL = gamertag.split(' ').join('%20');
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
			.setTitle(gamertag)
			.setURL(`https://www.halowaypoint.com/en-us/games/halo-the-master-chief-collection/${version}/game-history?gamertags=${gamertagURL}`)
			.addFields({ name: 'Last 20 MCC games:', value: data },
			);
		message.channel.send(embed);
	},
};
