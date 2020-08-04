const halo5 = require('../halo5.js');

module.exports = {
	name: 'h5streak',
	description: 'Returns the number of consecutive arena wins or losses for a player.',
	usage: '<Gamer Tag>',
	args: true,
	supportsProfiles: true,
	aliases: [ 'streak', 's' ],

	async execute(message, args) {
		let playerName = '';
		if (args.length) {
			playerName = args.join(' ');
		}
		else {
			playerName = message.client.profiles.get(message.author.id);
		}
		try{
			const matchHistory = await halo5.getMatchHistory(playerName);
			const selectedMode = 1;
			let matches = matchHistory.filter(match => match.Id.GameMode === selectedMode);
			if (matches.length === 0) {
				return message.channel.send(`No games found for ${playerName}.`);
			}
			let grabCount = 0;
			const streakType = matches.shift().Players[0].Result;
			let lastResult = streakType;
			let count = 1;
			while(lastResult === streakType) {
				for (const match of matches) {
					lastResult = match.Players[0].Result;
					if (lastResult === streakType) {
						count++;
					}
					else {
						break;
					}
				}
				if (lastResult === streakType) {
					matches = await halo5.getMatchHistory(playerName, 50, 25 * grabCount);
					grabCount++;
				}
			}
			const data = [];
			const firstLine = `${playerName} is on a `;
			switch (streakType) {
			case (0):
				data.push(firstLine + 'DNF streak. Quitter.');
				break;
			case (1):
				data.push(firstLine + 'losing streak. Thats rough, buddy.');
				break;
			case (2):
				data.push(firstLine + 'tie streak? Good job????');
				break;
			case (3):
				data.push(firstLine + 'winning streak! Keep it up!');
				break;
			}
			data.push(`Streak length of ${count}.`);
			message.channel.send(data);
		}
		catch (err) {
			if (err.type === 'invalid-json') {
				message.reply(`Sorry, there was an error processing the streak. Is the Gamertag "${playerName}" correct?`);
			}
			else { throw err; }
		}
	},
};
