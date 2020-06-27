// TODO:
// Check if a gamertag is valid before saving

const fs = require('fs');

module.exports = {
	name: 'register',
	description: 'Register your Gamertag with your Discord account. Allows calling commands without specifying a Gamertag.',
	aliases: [ 'reg' ],
	usage: '<Gamertag>',
	args: true,

	async execute(message, args) {
		const id = message.author.id;
		const gamertag = args.join(' ');
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
