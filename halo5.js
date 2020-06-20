const { halo5Key } = require('./config.json');
const fs = require('fs');
const fetch = require('node-fetch');
const site = 'https://www.haloapi.com/';
const header = { headers: { 'Ocp-Apim-Subscription-Key': halo5Key } };

const cache = { };
if (fs.existsSync('./cache/halo5/CSRDesignations.json')) {
	cache.CSR = require('./cache/halo5/CSRDesignations.json');
}
if (fs.existsSync('./cache/halo5/playlists.json')) {
	cache.playlists = require('./cache/halo5/playlists.json');
}
if (fs.existsSync('./cache/halo5/weapons.json')) {
	cache.weapons = require('./cache/halo5/weapons.json');
}

module.exports = {
	name: 'halo5',
	description: 'API for the Halo 5 API.',
	cache: cache,

	async getMatchHistory(gamerTag, count = 25, startIndex = 0, modes = '') {
		if (modes) {
			modes = '&modes=' + modes;
		}
		const endPoint = `${site}stats/h5/players/${gamerTag}/matches?count=${count}&start=${startIndex}${modes}&include-times=true`;
		const response = await fetch(endPoint, header);
		const history = await response.json();
		if (history.Results === []) throw 'No player data';
		return history.Results;
	},

	async lastGame(gamerTag) {
		const res = await this.getMatchHistory(gamerTag, 1);
		const match = res[0];
		return match;
	},

	async getArenaServiceRecord(gamerTag, seasonId = null) {
		let season = '';
		if (seasonId) { season = '&' + seasonId; }
		const endPoint = `${site}stats/h5/servicerecords/arena?players=${gamerTag}${season}`;
		const reply = await fetch(endPoint, header);
		const serviceRecords = await reply.json();
		return serviceRecords.Results[0].Result;
	},

	async getCustomServiceRecord(gamerTag) {
		const endPoint = `${site}stats/h5/servicerecords/custom?players=${gamerTag}`;
		const reply = await fetch(endPoint, header);
		const serviceRecords = await reply.json();
		return serviceRecords.Results[0].Result;
	},

	async getCustomLocalServiceRecord(gamerTag) {
		const endPoint = `${site}stats/h5/servicerecords/customlocal?players=${gamerTag}`;
		const reply = await fetch(endPoint, header);
		const serviceRecords = await reply.json();
		return serviceRecords.Results[0].Result;
	},

	async getWarzoneServiceRecord(gamerTag) {
		const endPoint = `${site}stats/h5/servicerecords/warzone?players=${gamerTag}`;
		const reply = await fetch(endPoint, header);
		const serviceRecords = await reply.json();
		return serviceRecords.Results[0].Result;
	},

	async getCampaignServiceRecord(gamerTag) {
		const endPoint = `${site}stats/h5/servicerecords/campaign?players=${gamerTag}`;
		const reply = await fetch(endPoint, header);
		const serviceRecords = await reply.json();
		return serviceRecords.Results[0].Result;
	},

	// META
	async getCSRDesignations() {
		if (!cache.CSR) {
			const endPoint = 'https://www.haloapi.com/metadata/h5/metadata/csr-designations';
			const reply = await fetch(endPoint, header);
			const CSRDesignations = await reply.json();
			cache.CSR = CSRDesignations;
			const path = './cache/halo5';
			fs.mkdirSync(path, { recursive: true });
			fs.writeFile(`${path}/CSRDesignations.json`, JSON.stringify(CSRDesignations), 'utf8', (err) => {
				if (err) {
					console.error(err);
				}
			});
		}
		return cache.CSR;
	},

	async getPlaylists() {
		if (!cache.playlists) {
			const endPoint = 'https://www.haloapi.com/metadata/h5/metadata/playlists';
			const reply = await fetch(endPoint, header);
			const playlists = await reply.json();
			cache.playlists = playlists;
			const path = './cache/halo5';
			fs.mkdirSync(path, { recursive: true });
			fs.writeFile(`${path}/playlists.json`, JSON.stringify(playlists), 'utf8', (err) => {
				if (err) console.error(err);
			});
		}
		return cache.playlists;
	},

	async getWeapons() {
		if (!cache.weapons) {
			const endPoint = 'https://www.haloapi.com/metadata/h5/metadata/weapons';
			const reply = await fetch(endPoint, header);
			const weapons = await reply.json();
			cache.weapons = weapons;
			const path = './cache/halo5';
			fs.mkdirSync(path, { recursive: true });
			fs.writeFile(`${path}/weapons.json`, JSON.stringify(weapons), 'utf8', (err) => {
				if (err) console.error(err);
			});
		}
		return cache.weapons;
	},


	parseISODuration(string) {
		if (string === '') { return new Date(0); }
		const date = new Date(0);
		let dateArr = [];
		dateArr[0] = string.split(/[P|T]/).join('');
		let days = 32;
		let hours = 0;
		let minutes = 0;
		let seconds = 0;
		dateArr = dateArr[0].split('D');
		if (dateArr[1]) { days += Number(dateArr.shift()); }
		dateArr = dateArr[0].split('H');
		if (dateArr[1]) { hours = Number(dateArr.shift()); }
		dateArr = dateArr[0].split('M');
		if (dateArr[1]) { minutes = Number(dateArr.shift()); }
		seconds = Number(dateArr[0].substring(0, dateArr[0].length - 1));
		date.setDate(days);
		date.setHours(hours);
		date.setMinutes(minutes);
		date.setSeconds(seconds);
		return date;
	},

	parsePlayerName(message, args) {
		let playerName = '';
		if (args.length) {
			playerName = args.join(' ');
		}
		else {
			playerName = message.client.profiles.get(message.author.id);
		}
		return playerName;
	},
};

