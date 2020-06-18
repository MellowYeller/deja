const halo5 = require('../halo5.js');
const Discord = require('discord.js');

module.exports = {
	name: 'h5last20',
	aliases: [ 'last20', 'history', 'h', '20' ],
	description: 'Displays the win/loss ratio of the last 20 games.',
	usage: '[-OPTION] [GAMERTAG]',
	devOnly: true,
	supportsProfiles: true,

	async execute(message, args) {
		let gamerTag = '';
		let option = '';
		if (args.length) {
			if (args[0].startsWith('-')) {
				option = args.shift().substring(1).toLowerCase();
				if (option !== 'arena' && option !== 'warzone' && option !== 'custom' && option !== 'campaign') {
					return message.reply('Invalid option. Use either arena, warzone, custom, or campaign. Combine bydelimiting by , (no spaces).');
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
		try {
			matchHistory = await halo5.getMatchHistory(gamerTag, 20, 0, option);
		}
		catch (err) {
			console.error(err);
			return message.reply('error retreiving match history.');
		}
		if (matchHistory.length === 0) {
			message.channel.send(`No matches found for ${gamerTag}.`);
		}
		gamerTag = matchHistory[0].Players[0].Player.Gamertag;
		const results = [];
		let index = 0;
		let winString = '';
		let midString = '';
		let lossString = '';
		for (const match of matchHistory) {
			const result = match.Players[0].Result;
			results[index] = result;
			index++;
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
		}
		winString = '+  |' + winString;
		midString = '---|' + midString;
		lossString = '-  |' + lossString;

		const data = [];
		data.push('```diff');
		data.push(winString);
		data.push(midString);
		data.push(lossString);
		data.push('```');

		const embed = new Discord.MessageEmbed()
			.setTitle(gamerTag)
			.setURL(`https://www.halowaypoint.com/en-us/games/halo-5-guardians/xbox-one/game-history/players/${gamerTag.replace(' ', '%20')}?gameModeFilter=${option}&count=20`)
			.addFields({ name: 'Last 20 games:', value: data },
			)
			.setFooter(`Mode: ${option ? option.toUpperCase() : 'ALL'}`);
		message.channel.send(embed);
	},
};
