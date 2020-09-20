const mcc = require('../mcc.js');
const Discord = require('discord.js');

module.exports = {
	name: 'mccrank',
	description: 'Test command for MCC',
	aliases: ['mccranks', 'mccsr'],
	usage: '[-VERSION] [GAMERTAG]',
	args: true,
	supportsProfiles: true,

	async execute(message, args) {
		let gamertag = '';
		let version = 'windows';
		if (args.length) {
			if (args[0].startsWith('-')) {
				version = args.shift().substring(1).toLowerCase();
				if (version !== 'xbox-one' && version !== 'xbox' && version !== 'pc' && version !== 'windows') {
					return message.reply('Invalid option. Use either \'-xbox\' or \'-pc\'. No option assumes Windows.');
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
			gamertag = args.join(' ');
		}
		else {
			gamertag = message.client.profiles.get(message.author.id);
		}
		const json = await mcc.getRanks(version, gamertag);
		const ranks = Object.keys(json);
		gamertag = json[ranks[0]][0].Gamertag;
		const data = [];
		data.push('```');
		data.push(' ______________________________ ');
		data.push('|Playlist                 |Rank|');
		data.push('|-------------------------|----|');
		for (const rank of ranks) {
			data.push(`|${rank.padEnd(25, ' ')}|${json[rank][0].SkillRank.toString().padStart(4, ' ')}|`);
		}
		data.push('|______________________________|');
		data.push('```');
		const gamertagURL = gamertag.split(' ').join('%20');
		const embed = new Discord.MessageEmbed()
			.setTitle(gamertag)
			.setURL(`https://halowaypoint.com/en-us/games/halo-the-master-chief-collection/${version}/skill-ranks?gamertags=${gamertagURL}`)
			.addFields(
				{ name: `MCC ${(version == 'windows') ? 'PC' : 'Xbox'} Ranks`, value: data },
			);
		message.channel.send(embed);
	},
};
