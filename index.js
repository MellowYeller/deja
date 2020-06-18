const fs = require('fs');
const Discord = require('discord.js');
const { prefix, token, developerIds } = require('./config.json');
const client = new Discord.Client();
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}
client.profiles = new Discord.Collection();
const profileDirs = fs.readdirSync('./cache/users');
for (const dir of profileDirs) {
	const profile = require(`./cache/users/${dir}/profile.json`);
	client.profiles.set(profile.id, profile.gamertag);
}
const cooldowns = new Discord.Collection();

const activitiesList = [
	'Halo 5: Guardians',
	'with Spartans',
	'!timeplayed',
	'!history',
	'!streak',
	'!register',
	'!lastgame',
];

client.once('ready', () => {
	setInterval(() => {
		const index = Math.floor(Math.random() * (activitiesList.length - 1) + 1);
		client.user.setActivity(activitiesList[index]);
	}, 7000);
	client.user.setActivity('Halo 5: Guardians');
	console.log('Logged in as Deja!');
});

client.on('message', async message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).split(/ +/);
	const commandName = args.shift().toLowerCase();

	const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
	if (!command) return;

	if (command.guildOnly && message.channel.type !== 'text') {
		return message.reply('I can\'t execute that command inside DMs!');
	}

	if (command.args && !args.length && !command.supportsProfiles) {
		let reply = `You didn't provide any arguments, ${message.author}!`;

		if (command.usage) {
			reply += `\nThe proper usage would be: '${prefix}${command.name} ${command.usage}'`;
		}

		return message.channel.send(reply);
	}

	if (command.devOnly && !developerIds.includes(message.author.id)) {
		return message.reply('You are not authorized to use that command.');
	}

	if (!cooldowns.has(command.name)) {
		cooldowns.set(command.name, new Discord.Collection());
	}

	const now = Date.now();
	const timestamps = cooldowns.get(command.name);
	const cooldownAmount = (command.cooldown || 3) * 1000;

	if (timestamps.has(message.author.id)) {
		const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

		if (now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000;
			return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) beofre reusing the '${command.name}' command.`);
		}
	}
	timestamps.set(message.author.id, now);
	setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
	try {
		await command.execute(message, args);
	}
	catch (error) {
		console.error(error);
		message.reply('there was an error trying to execute that command!');
	}
});

process.on('unhandledRejection', error => {
	console.error('Unhandled promise rejection:', error);
});
client.login(token);
