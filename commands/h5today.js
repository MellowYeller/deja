const halo5 = require('../halo5.js');
const Discord = require('discord.js');

module.exports = {
	name: 'h5today',
	aliases: [ 'today', 't', 'session', 's' ],
	description: 'Shows the count of games played on the current day.',
	usage: '[GAMERTAG]',
	supportsProfiles: true,

	// Win/Loss today?
	// Kill/death today?
	// How many of each gametype?
	async execute(message, args, gamertag) {
		let option = '';
		if (args.length) {
			option = args.shift().substring(1).toLowerCase();
			if (option !== 'arena' && option !== 'warzone' && option !== 'custom' && option !== 'campaign') {
				return message.reply('Invalid option. Use either arena, warzone, custom, or campaign.');
			}
		}
		let matchesToday = 0;
		const today = new Date(Date.now());
		today.setHours(0);
		today.setMinutes(0);
		today.setSeconds(0);
		today.setMilliseconds(0);
		let matchDay = today;
		while (today.getTime() === matchDay.getTime()) {
			let matchHistory = [];
			matchHistory = await halo5.getMatchHistory(gamertag, 50, matchesToday, option);
			gamertag = matchHistory[0].Players[0].Player.Gamertag;
			for (const match of matchHistory) {
				// Use this when adding extra info
				// const result = match.Players[0].Result;
				matchDay = new Date(match.MatchCompletedDate.ISO8601Date);
				matchDay.setHours(0);
				matchDay.setMinutes(0);
				matchDay.setSeconds(0);
				matchDay.setMilliseconds(0);
				if (today.getTime() === matchDay.getTime()) matchesToday++;
				else break;
			}
		}
		message.channel.send(`${gamertag} has played ${matchesToday} matches today.(PST)`);
	},
};
