const halo5 = require('../halo5.js');
const Discord = require('discord.js');

module.exports = {
	name: 'h5last20',
	aliases: [ 'last20', 'history', 'h', '20' ],
	description: 'Displays the win/loss ratio of the last 20 games.',
	usage: '[-OPTION] [GAMERTAG]',
	supportsProfiles: true,

	async execute(message, args) {
		let gamerTag = '';
		let option = '';
		if (args.length) {
			if (args[0].startsWith('-')) {
				option = args.shift().substring(1).toLowerCase();
				if (option !== 'arena' && option !== 'warzone' && option !== 'custom' && option !== 'campaign') {
					return message.reply('Invalid option. Use either arena, warzone, custom, or campaign.');
				}
			}
		}
		if (args.length) {
			gamerTag = args.join(' ');
		}
		else {
			gamerTag = message.client.profiles.get(message.author.id);
		}
		let matchHistory = [];
		matchHistory = await halo5.getMatchHistory(gamerTag, 20, 0, option);
		if (!matchHistory.length) {
			return message.channel.send(`No matches found for ${gamerTag}.`);
		}
		gamerTag = matchHistory[0].Players[0].Player.Gamertag;
		const results = [];
		let matchesToday = 0;
		const today = new Date(Date.now());
		today.setHours(0);
		today.setMinutes(0);
		today.setSeconds(0);
		today.setMilliseconds(0);
		let index = 0;
		let winString = '';
		let midString = '';
		let lossString = '';
		for (const match of matchHistory) {
			const result = match.Players[0].Result;
			const matchDay = new Date(match.MatchCompletedDate.ISO8601Date);
			matchDay.setHours(0);
			matchDay.setMinutes(0);
			matchDay.setSeconds(0);
			matchDay.setMilliseconds(0);
			if (today.getTime() === matchDay.getTime()) matchesToday++;
			results[index] = result;
			if (result === 3) {
				winString = 'W' + winString;
				midString = '-' + midString;
				lossString = ' ' + lossString;
			}
			else if (result === 2) {
				winString = ' ' + winString;
				midString = 'T' + midString;
				lossString = ' ' + lossString;
			}
			else if (result === 1) {
				winString = ' ' + winString;
				midString = '-' + midString;
				lossString = 'L' + lossString;
			}
			else {
				winString = ' ' + winString;
				midString = '-' + midString;
				lossString = 'Q' + lossString;
			}
			index++;
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
		if (matchesToday && matchesToday < 20) {
			embed.setDescription(`Matches completed today: ${matchesToday}`);
			const firstGameLocation = ' '.repeat(midString.length - matchesToday) + '^';
			data.push(firstGameLocation);
		}
		data.push('```');

		embed
			.setTitle(gamerTag)
			.setURL(`https://www.halowaypoint.com/en-us/games/halo-5-guardians/xbox-one/game-history/players/${gamertagURL}?gameModeFilter=${option}&count=20`)
			.addFields({ name: 'Last 20 games:', value: data },
			)
			.setFooter(`Mode: ${option ? option.toUpperCase() : 'ALL'}`);
		message.channel.send(embed);
	},
};
