const halo5 = require('../halo5.js');
const Discord = require('discord.js');

module.exports = {
	name: 'h5lastgame',
	description: 'Info on last game played by a player.',
	aliases: ['lastgame', 'lg'],
	usage: '<Gamer Tag>',
	args: true,
	supportsProfiles: true,

	async execute(message, args, gamertag) {
		const game = await halo5.lastGame(gamertag);
		if (!game) {
			return message.channel.send(`No games found for ${gamertag}.`);
		}
		const data = [];
		let mode = '';
		switch (game.Id.GameMode) {
		case (1):
			mode = 'Arena';
			break;
		case (2):
			mode = 'Campaign';
			break;
		case (3):
			mode = 'Custom';
			break;
		case (4):
			mode = 'Warzone';
			break;
		case (5):
			mode = 'Local Custom';
			break;
		default:
			mode = 'Error';
			break;
		}
		const gamertagURL = gamertag.split(' ').join('%20');
		const linkToGame = `https://www.halowaypoint.com/en-us/games/halo-5-guardians/xbox-one/mode/${mode}/matches/${game.Id.MatchId}/players/${gamertagURL}`;
		const dateCompleted = new Date(game.MatchCompletedDate.ISO8601Date).toDateString();
		const playerName = game.Players[0].Player.Gamertag;
		const kills = game.Players[0].TotalKills;
		const deaths = game.Players[0].TotalDeaths;
		const assists = game.Players[0].TotalAssists;
		const kd = (kills / deaths).toFixed(1);
		const kda = ((kills + assists) / Math.max(1, deaths)).toFixed(1);
		let gameResult = '';
		switch (game.Players[0].Result) {
		case (3):
			gameResult = 'win';
			break;
		case(2):
			gameResult = 'tied';
			break;
		case (1):
			gameResult = 'lost';
			break;
		case (0):
			gameResult = 'did not finish';
			break;
		default:
			gameResult = 'error';
			break;
		}
		if (mode === 'Campaign') {
			data.push(`${playerName} last played on ${dateCompleted}.`);
			data.push(`Game mode:\t${mode}`);
			message.channel.send(data);
		}
		if (mode !== 'Campaign') {
			data.push(`\`\`\`bash\nKills:    ${kills}`);
			data.push(`Assists:  ${assists}`);
			data.push(`Deaths:   ${deaths}`);
			data.push(`K/D:      ${kd}`);
			data.push(`K/D/A:    ${kda}`);
			data.push(`Result:   ${gameResult}\`\`\``);
			const embed = new Discord.MessageEmbed()
				.setColor('#0099ff')
				.setTitle('Carnage Report')
				.setURL(linkToGame)
				.setDescription(`Mode: ${mode}`)
				.addFields(
					{ name: `${playerName}'s stats:`, value: data },
				)
				.setFooter(dateCompleted);
			message.channel.send(embed);
		}
	},
};
