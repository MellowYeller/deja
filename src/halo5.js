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

async function fetchResult(endPoint) {
	try {
		const response = await fetch(endPoint, header);
		return await response.json();
	}
	catch (error) {
		if (error.type == 'invalid-json') {
			throw new Error('Invalid Gamertag');
		}
		else { throw error; }
	}
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
		const history = await fetchResult(endPoint);
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
		const serviceRecords = await fetchResult(endPoint);
		return serviceRecords.Results[0].Result;
	},
	async getCustomServiceRecord(gamerTag) {
		const endPoint = `${site}stats/h5/servicerecords/custom?players=${gamerTag}`;
		const serviceRecords = await fetchResult(endPoint);
		return serviceRecords.Results[0].Result;
	},

	async getCustomLocalServiceRecord(gamerTag) {
		const endPoint = `${site}stats/h5/servicerecords/customlocal?players=${gamerTag}`;
		const serviceRecords = await fetchResult(endPoint);
		return serviceRecords.Results[0].Result;
	},

	async getWarzoneServiceRecord(gamerTag) {
		const endPoint = `${site}stats/h5/servicerecords/warzone?players=${gamerTag}`;
		const serviceRecords = await fetchResult(endPoint);
		return serviceRecords.Results[0].Result;
	},

	async getCampaignServiceRecord(gamerTag) {
		const endPoint = `${site}stats/h5/servicerecords/campaign?players=${gamerTag}`;
		const serviceRecords = await fetchResult(endPoint);
		return serviceRecords.Results[0].Result;
	},

	// META
	async getCSRDesignations() {
		if (!cache.CSR) {
			const endPoint = 'https://www.haloapi.com/metadata/h5/metadata/csr-designations';
			const CSRDesignations = await fetchResult(endPoint);
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
			const playlists = await fetchResult(endPoint);
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
			const weapons = await fetchResult(endPoint);
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
		const timeArr = [ 0, 0, 0, 0 ];
		if (string === '') return timeArr;
		let stringArr = [];
		stringArr[0] = string.split(/[P|T]/).join('');
		stringArr = stringArr[0].split('D');
		if (stringArr[1]) { timeArr[0] = Number(stringArr.shift()); }
		stringArr = stringArr[0].split('H');
		if (stringArr[1]) { timeArr[1] = Number(stringArr.shift()); }
		stringArr = stringArr[0].split('M');
		if (stringArr[1]) { timeArr[2] = Number(stringArr.shift()); }
		timeArr[3] = Math.floor(Number(stringArr[0].substring(0, stringArr[0].length - 1)));
		return timeArr;
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

