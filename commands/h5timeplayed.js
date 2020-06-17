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
		try {
			const arenaPromise = halo5.getArenaServiceRecord(playerName);
			const customPromise = halo5.getCustomServiceRecord(playerName);
			const warzonePromise = halo5.getWarzoneServiceRecord(playerName);
			const campaignPromise = halo5.getCampaignServiceRecord(playerName);

			const [ arenaServiceRecord, customServiceRecord, warzoneServiceRecord, campaignServiceRecord ] = await Promise.all([ arenaPromise, customPromise, warzonePromise, campaignPromise ]);

			const gamertag = arenaServiceRecord.Result.PlayerId.Gamertag;

			const arenaISODuration = arenaServiceRecord.Result.ArenaStats.TotalTimePlayed;
			const customISODuration = customServiceRecord.Result.CustomStats.TotalTimePlayed;
			const warzoneISODuration = warzoneServiceRecord.Result.WarzoneStat.TotalTimePlayed;
			const campaignISODuration = campaignServiceRecord.Result.CampaignStat.TotalTimePlayed;

			const arenaDate = halo5.parseISODuration(arenaISODuration);
			const customDate = halo5.parseISODuration(customISODuration);
			const warzoneDate = halo5.parseISODuration(warzoneISODuration);
			const campaignDate = halo5.parseISODuration(campaignISODuration);
			const totalMillisPlayed = arenaDate.getTime() + customDate.getTime() + warzoneDate.getTime() + campaignDate.getTime();
			const totalDate = new Date(totalMillisPlayed);

			const arenaDays = (Math.floor(arenaDate.getTime() / 86400000)).toString().padStart(4, ' ');
			const arenaHours = arenaDate.getHours().toString().padStart(4, ' ');
			const arenaMinutes = arenaDate.getMinutes().toString().padStart(4, ' ');
			const arenaSeconds = arenaDate.getSeconds().toString().padStart(4, ' ');
			const warzoneDays = (Math.floor(warzoneDate.getTime() / 86400000)).toString().padStart(4, ' ');
			const warzoneHours = warzoneDate.getHours().toString().padStart(4, ' ');
			const warzoneMinutes = warzoneDate.getMinutes().toString().padStart(4, ' ');
			const warzoneSeconds = warzoneDate.getSeconds().toString().padStart(4, ' ');
			const customDays = (Math.floor(customDate.getTime() / 86400000)).toString().padStart(4, ' ');
			const customHours = customDate.getHours().toString().padStart(4, ' ');
			const customMinutes = customDate.getMinutes().toString().padStart(4, ' ');
			const customSeconds = customDate.getSeconds().toString().padStart(4, ' ');
			const campaignDays = (Math.floor(campaignDate.getTime() / 86400000)).toString().padStart(4, ' ');
			const campaignHours = campaignDate.getHours().toString().padStart(4, ' ');
			const campaignMinutes = campaignDate.getMinutes().toString().padStart(4, ' ');
			const campaignSeconds = campaignDate.getSeconds().toString().padStart(4, ' ');
			const totalDays = (Math.floor(totalDate.getTime() / 86400000)).toString().padStart(4, ' ');
			const totalHours = totalDate.getHours().toString().padStart(4, ' ');
			const totalMinutes = totalDate.getMinutes().toString().padStart(4, ' ');
			const totalSeconds = totalDate.getSeconds().toString().padStart(4, ' ');

			const data = [];
			data.push('```');
			data.push(' ____________________________');
			data.push('|Mode    |Days|Hour|Mins|Secs|');
			data.push('|--------|----|----|----|----|');
			data.push(`|Arena   |${arenaDays}|${arenaHours}|${arenaMinutes}|${arenaSeconds}|`);
			data.push(`|Warzone |${warzoneDays}|${warzoneHours}|${warzoneMinutes}|${warzoneSeconds}|`);
			data.push(`|Custom  |${customDays}|${customHours}|${customMinutes}|${customSeconds}|`);
			data.push(`|Campaign|${campaignDays}|${campaignHours}|${campaignMinutes}|${campaignSeconds}|`);
			data.push('|--------|----|----|----|----|');
			data.push(`|Total   |${totalDays}|${totalHours}|${totalMinutes}|${totalSeconds}|`);
			data.push('```');

			const embed = new Discord.MessageEmbed()
				.setColor('#0099ff')
				.setTitle(gamertag)
				.setURL(`https://halowaypoint.com/en-us/games/halo-5-guardians/xbox-one/service-records/players/${gamertag.replace(' ', '%20')}`)
				.addFields(
					{ name: 'Time Played', value: data },
				);
			message.channel.send(embed);
		}
		catch (err) {
			if (err === 'Invalid Date') {
				message.reply(`There was an error fetching time played. ${playerName} may not have played before!`);
			}
			else {
				throw err;
			}
		}
	},
};
