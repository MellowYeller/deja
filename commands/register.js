const fs = require('fs');
const halo5 = require('../halo5.js');

module.exports = {
	name: 'register',
	description: 'Register your Gamertag with your Discord account. Allows calling commands without specifying a Gamertag.',
	aliases: [ 'reg' ],
	usage: '<Gamertag>',
	args: true,
	nameRequired: true,

	async execute(message, args, gamertag) {
		const id = message.author.id;
		console.log(gamertag);
		try {
			await halo5.lastGame(gamertag);
		}
		catch (error) {
			if (error.message == 'Invalid Gamertag') {
				return message.reply(`${gamertag} is an invalid gamertag. Please verify it is spelled correctly and try again.`);
			}
			else { throw error; }
		}
		const obj = {
			id: id,
			gamertag: gamertag,
		};
		const path = `./cache/users/${id}`;
		fs.mkdirSync(`${path}`, { recursive: true });
		fs.writeFile(`${path}/profile.json`, JSON.stringify(obj), 'utf8', (err) => {
			if (err) {
				message.reply('there was an error creating your profile!');
				throw err;
			}
		});
		message.client.profiles.set(obj.id, obj.gamertag);
		message.channel.send(`Okay ${message.author}, your Gamertag is now set to ${gamertag}.`);
	},
};
