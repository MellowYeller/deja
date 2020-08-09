const fetch = require('node-fetch');
const { waypointLogin, waypointPassword }= require('./config.json');
const endpoint = 'https://www.halowaypoint.com/en-us/games/halo-the-master-chief-collection/';
const oauth = 'https://login.live.com/oauth20_authorize.srf?client_id=000000004C0BD2F1' +
	'&scope=xbox.basic+xbox.offline_access&response_type=code' +
	'&redirect_uri=https:%2f%2fwww.halowaypoint.com%2fauth%2fcallback&locale=en-us' +
	'&display=touch&state=https%253a%252f%252fwww.halowaypoint.com%252fen-us';
// For getting the unique data for session-based logins
const R_PPFT = /<input type="hidden" name="PPFT" id="i0327" value="(.+?)"\/>/;
const R_POST = /urlPost:'(.+?)'/;

const stringify = obj => {
	let result = '';
	for (const prop in obj) {
		if (obj.hasOwnProperty(prop)) {
			result += `&${encodeURIComponent(prop)}=${encodeURIComponent(obj[prop])}`;
		}
	}
	return result.substr(1);
};

const storeCookies = (array) => {
	const jar = [];
	const R_NAME = /^(.+?)=/;
	const R_VALUE = /=(.+?);/;
	for (let cookie in array) {
		cookie = array[cookie];
		jar.push(`${cookie.match(R_NAME)[1]}=${cookie.match(R_VALUE)[1]};`);
	}
	return jar;
};

module.exports = {
	async getHistory() {
		const res = await fetch(oauth);
		const cookies = storeCookies(res.headers['set-cookie']);
		const body = await res.text();
		const ppft = body.match(R_PPFT)[1];
		const post = body.match(R_POST)[1];
		const data = stringify({
			login: waypointLogin,
			passwd: waypointPassword,
			PPFT: ppft,
		});

		console.log(`\nppft: ${ppft}\npost: ${post}\ndata: ${data}\n`);
		const resLogin = await fetch(post, {
			method: 'POST',
			body: data,
			headers: {
				'cookie': cookies.join(''),
				'content-type': 'application/x-www-form-urlencoded',
			},
			followRedirects: false,
		});
	},
};
