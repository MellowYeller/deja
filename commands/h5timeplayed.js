const halo5 = require('../halo5.js');
const Discord = require('discord.js');

module.exports = {
	name: 'h5timeplayed',
	description: 'Returns the amount of time spent in game by a player.',
	usage: '<Gamertag>',
	aliases: [ 'timeplayed', 'tp' ],
	args: true,
	nameRequired: true,
	devOnly: false,

	async execute(message, args, playerName) {

		// Grab all game modes data
		const arenaPromise = halo5.getArenaServiceRecord(playerName);
		const customPromise = halo5.getCustomServiceRecord(playerName);
		const warzonePromise = halo5.getWarzoneServiceRecord(playerName);
		const campaignPromise = halo5.getCampaignServiceRecord(playerName);

		const [ arenaServiceRecord, customServiceRecord, warzoneServiceRecord, campaignServiceRecord ] = await Promise.all([ arenaPromise, customPromise, warzonePromise, campaignPromise ]);

		// Use gamertag from server for proper capitilization
		const gamertag = arenaServiceRecord.PlayerId.Gamertag;
		if (gamertag == null) throw new Error('Invalid Gamertag');

		// Get ISO times for each game mode
		const arenaISODuration = arenaServiceRecord.ArenaStats.TotalTimePlayed;
		const customISODuration = customServiceRecord.CustomStats.TotalTimePlayed;
		const warzoneISODuration = warzoneServiceRecord.WarzoneStat.TotalTimePlayed;
		const campaignISODuration = campaignServiceRecord.CampaignStat.TotalTimePlayed;

		const arenaTime = halo5.parseISODuration(arenaISODuration);
		const customTime = halo5.parseISODuration(customISODuration);
		const warzoneTime = halo5.parseISODuration(warzoneISODuration);
		const campaignTime = halo5.parseISODuration(campaignISODuration);
		const times = [ arenaTime, warzoneTime, customTime, campaignTime, [] ];

		// Build total time from each gamemode
		calcTotalTime(times);
		const modes = [ 'Arena', 'Warzone', 'Custom', 'Campaign', 'Total' ];

		const embed = buildEmbed(gamertag, times, modes);
		message.channel.send(embed);
	},
};

const calcTotalTime = (times) => {
	// Add each game mode days, hours, minutes, and seconds into total times[4]
	for (let i = 0; i < 4; i++) {
		times[4][i] = times[0][i] + times[1][i] + times[2][i] + times[3][i];
	}

	// After adding, times are overflowed
	// Rebalance time overflow in total time
	times[4][2] += Math.floor(times[4][3] / 60);
	times[4][3] = times[4][3] % 60;
	times[4][1] += Math.floor(times[4][2] / 60);
	times[4][2] = times[4][2] % 60;
	times[4][0] += Math.floor(times[4][2] / 24);
	times[4][1] = times[4][1] % 24;
	return times;
};
const buildEmbed = (gamertag, times, modes) => {
	const data = [];
	data.push('```');
	// Build table
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

	// URL friendly gamertag
	const gamertagURL = gamertag.split(' ').join('%20');

	// Embed with link to gamertag records
	const embed = new Discord.MessageEmbed()
		.setColor('#0099ff')
		.setTitle(gamertag)
		.setURL(`https://halowaypoint.com/en-us/games/halo-5-guardians/xbox-one/service-records/players/${gamertagURL}`)
		.addFields(
			{ name: 'Time Played', value: data },
		);
	return embed;
};
