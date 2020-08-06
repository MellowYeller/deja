const halo5 = require('../halo5.js');
const Discord = require('discord.js');

module.exports = {
	name: 'h5arena',
	description: 'Service record for Arena playlists.',
	aliases: [ 'sr', 'arena', 'servicerecord', 'rank' ],
	usage: '<Gamertag>',
	args: true,
	supportsProfiles: true,

	async execute(message, args) {
		const playerName = halo5.parsePlayerName(message, args);
		const sr = await halo5.getArenaServiceRecord(playerName);
		if (sr.ArenaStats.TotalGamesCompleted === 0) {
			return message.reply(`${playerName} has no games played!`);
		}
		const playlists = await halo5.getPlaylists();
		const CSRDesignations = await halo5.getCSRDesignations();
		const gamertag = sr.PlayerId.Gamertag;
		const gamertagURL = gamertag.split(' ').join('%20').toString();
		const rank = sr.SpartanRank;
		const lifeAccuracy = (sr.ArenaStats.TotalShotsLanded / sr.ArenaStats.TotalShotsFired * 100).toFixed(1);
		const lifeKills = sr.ArenaStats.TotalKills;
		const lifeDeaths = sr.ArenaStats.TotalDeaths;
		const lifeKD = (lifeKills / Math.max(lifeDeaths, 1)).toFixed(1);
		const lifeDamage = Math.round(sr.ArenaStats.TotalWeaponDamage);
		const lifeGamesCompleted = sr.ArenaStats.TotalGamesCompleted;
		const lifeGamesWon = sr.ArenaStats.TotalGamesWon;
		const lifeWinPercent = (lifeGamesWon / lifeGamesCompleted * 100).toFixed(1);
		const lifeTimePlayed = halo5.parseISODuration(sr.ArenaStats.TotalTimePlayed);
		const lifeDays = Math.floor(lifeTimePlayed.getTime() / 86400000);
		const lifeHours = lifeTimePlayed.getHours();
		const lifeMinutes = lifeTimePlayed.getMinutes();
		const lifeSeconds = Math.floor(lifeTimePlayed.getSeconds());
		const lifeStatString1 = `Kills: ${lifeKills}\nDeaths: ${lifeDeaths}\nK/D: ${lifeKD}\nAccuracy: ${lifeAccuracy}%\nDamage: ${lifeDamage}`;
		let lifeStatString2 = `Time Played: ${lifeDays} days, ${lifeHours} hours, ${lifeMinutes} minutes, ${lifeSeconds} seconds\nGames: ${lifeGamesCompleted}\nWon: ${lifeGamesWon}\nWin %: ${lifeWinPercent}`;
		if (sr.ArenaStats.HighestCsrPlaylistId) {
			const highestCSRPlaylist = playlists.find(highCSRPlaylist => highCSRPlaylist.id === sr.ArenaStats.HighestCsrPlaylistId);
			const highestCSRPlaylistName = highestCSRPlaylist.name.trim();
			const highestCSRStats = sr.ArenaStats.HighestCsrAttained;
			let highestCSRRank = '';
			if (highestCSRStats.DesignationId === 0) {
				highestCSRRank = 'unranked';
			}
			else if (highestCSRStats.Rank) {
				highestCSRRank = `Champ ${highestCSRStats.Rank}`;
			}
			else if(highestCSRStats.Csr) {
				highestCSRRank = `Onyx ${highestCSRStats.Csr}`;
			}
			else {
				highestCSRRank = `${CSRDesignations[highestCSRStats.DesignationId].name} ${highestCSRStats.Tier}`;
			}
			lifeStatString2 += `\nHighest CSR: ${highestCSRPlaylistName}, ${highestCSRRank}`;
		}
		const embed = new Discord.MessageEmbed()
			.setTitle(gamertag)
			.setURL(`https://www.halowaypoint.com/en-us/games/halo-5-guardians/xbox-one/service-records/players/${gamertagURL}`)
			.setAuthor(rank)
			.addFields(
				{
					name: 'Lifetime Stats:',
					value: lifeStatString1,
					inline: true,
				},
				{
					name: '...',
					value: lifeStatString2,
					inline: true,
				},
			);
		const playlistStats = sr.ArenaStats.ArenaPlaylistStats;
		// Create table for current season playlist stats
		if (playlistStats.length > 0) {
			let table = '```';
			table += ' _______________________________________________________\n';
			table += '|Playlist             |Rank      |CSR %|Games|Win % |K/D|\n';
			table += '|---------------------|----------|-----|-----|------|---|\n';
			playlistStats.forEach(stats => {
				const playlist = playlists.find(list => list.id === stats.PlaylistId);
				table += `|${playlist.name.padEnd(21, ' ')}|`;
				const measurementMatches = stats.MeasurementMatchesLeft;
				let csr = '';
				let csrPercent = `${stats.CsrPercentile}%`;
				if (measurementMatches) {
					csr = `${measurementMatches} to rank`;
					csrPercent = 'N/A';
				}
				else if (stats.Csr.Rank) {
					csr = `Champ ${stats.Csr.Rank}`;
				}
				else if (stats.Csr.Csr) {
					csr = `Onyx ${stats.Csr.Csr}`;
				}
				else {
					csr = `${CSRDesignations[stats.Csr.DesignationId].name} ${stats.Csr.Tier}`;
				}
				const winPercent = ((stats.TotalGamesWon / stats.TotalGamesCompleted) * 100).toFixed(1) + '%';
				const killDeath = (stats.TotalKills / Math.max(stats.TotalDeaths, 1)).toFixed(1);
				table += `${csr.padStart(10, ' ')}|${csrPercent.padStart(5, ' ')}|${stats.TotalGamesCompleted.toString().padStart(5, ' ')}|${winPercent.padStart(6, ' ')}|${killDeath.padStart(3, ' ')}|\n`;
			});
			table += '|_______________________________________________________|\n';
			table += '```';
			embed.addField('Season Stats:', table);
		}
		message.channel.send(embed);
	},
};
