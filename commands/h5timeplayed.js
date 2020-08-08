const halo5 = require('../halo5.js');
const Discord = require('discord.js');

module.exports = {
	name: 'h5timeplayed',
	description: 'Returns the amount of time spent in game by a player.',
	usage: '<Gamertag>',
	aliases: [ 'timeplayed', 'tp' ],
	args: true,
	supportsProfiles: true,
	devOnly: false,

	async execute(message, args) {
		let playerName = '';
		if (args.length) {
			playerName = args.join(' ');
		}
		else {
			playerName = message.client.profiles.get(message.author.id);
		}
		const arenaPromise = halo5.getArenaServiceRecord(playerName);
		const customPromise = halo5.getCustomServiceRecord(playerName);
		const warzonePromise = halo5.getWarzoneServiceRecord(playerName);
		const campaignPromise = halo5.getCampaignServiceRecord(playerName);

		const [ arenaServiceRecord, customServiceRecord, warzoneServiceRecord, campaignServiceRecord ] = await Promise.all([ arenaPromise, customPromise, warzonePromise, campaignPromise ]);

		const gamertag = arenaServiceRecord.PlayerId.Gamertag;
		if (gamertag == null) throw new Error('Invalid Gamertag');

		const arenaISODuration = arenaServiceRecord.ArenaStats.TotalTimePlayed;
		const customISODuration = customServiceRecord.CustomStats.TotalTimePlayed;
		const warzoneISODuration = warzoneServiceRecord.WarzoneStat.TotalTimePlayed;
		const campaignISODuration = campaignServiceRecord.CampaignStat.TotalTimePlayed;

		const arenaTime = halo5.parseISODuration(arenaISODuration);
		const customTime = halo5.parseISODuration(customISODuration);
		const warzoneTime = halo5.parseISODuration(warzoneISODuration);
		const campaignTime = halo5.parseISODuration(campaignISODuration);

		const times = [ arenaTime, warzoneTime, customTime, campaignTime, [] ];
		const modes = [ 'Arena', 'Warzone', 'Custom', 'Campaign', 'Total' ];
		// Calc total times
		for (let i = 0; i < 4; i++) {
			times[4][i] = times[0][i] + times[1][i] + times[2][i] + times[3][i];
		}

		// Rebalance time overflow in total time
		times[4][2] += Math.floor(times[4][3] / 60);
		times[4][3] = times[4][3] % 60;
		times[4][1] += Math.floor(times[4][2] / 60);
		times[4][2] = times[4][2] % 60;
		times[4][0] += Math.floor(times[4][2] / 24);
		times[4][1] = times[4][1] % 24;

		const data = [];
		data.push('```');
		data.push(' ____________________________');
		data.push('|Mode    |Days|Hour|Mins|Secs|');
		data.push('|--------|----|----|----|----|');
		for (let i = 0; i < 5; i++) {
			let str = '';
			if (i === 4) str += '|--------|----|----|----|----|\n';
			str += `|${modes[i].toString().padEnd(8, ' ')}|${times[i][0].toString().padStart(4, ' ')}|${times[i][1].toString().padStart(4, ' ')}|${times[i][2].toString().padStart(4, ' ')}|${times[i][3].toString().padStart(4, ' ')}|`;
			data.push(str);
		}
		data.push('|____________________________|');
		data.push('```');

		const embed = new Discord.MessageEmbed()
			.setColor('#0099ff')
			.setTitle(gamertag)
			.setURL(`https://halowaypoint.com/en-us/games/halo-5-guardians/xbox-one/service-records/players/${gamertag.replace(' ', '%20')}`)
			.addFields(
				{ name: 'Time Played', value: data },
			);
		message.channel.send(embed);
	},
};
