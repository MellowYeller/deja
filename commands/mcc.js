const mcc = require('../mcc.js');
const Discord = require('discord.js');

module.exports = {
	name: 'mcc',
	description: 'Test command for MCC',
	// aliases: ['lastgame', 'lg'],
	usage: '<Gamer Tag>',
	args: true,
	supportsProfiles: true,

	async execute(message, args) {
		mcc.getHistory('windows', 'mellow yeller');
	},
};
