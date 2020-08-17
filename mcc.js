const fetch = require('node-fetch');
const { waypointLogin, waypointPassword } = require('./config.json');
const site = 'https://www.halowaypoint.com/en-us/games/halo-the-master-chief-collection/';
const oauth = 'https://login.live.com/oauth20_authorize.srf?client_id=000000004C0BD2F1' +
	'&scope=xbox.basic+xbox.offline_access&response_type=code' +
	'&redirect_uri=https:%2f%2fwww.halowaypoint.com%2fauth%2fcallback&locale=en-us' +
	'&display=touch&state=https%253a%252f%252fwww.halowaypoint.com%252fen-us';
// For getting the unique data for session-based logins
const R_PPFT = /<input type="hidden" name="PPFT" id="i0327" value="(.+?)"\/>/;
const R_POST = /urlPost:'(.+?)'/;
let auth = '';
getAuth().then(() => {
	console.log('Aquired MCC OAuth');
});

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

async function getAuth() {
	const res = await fetch(oauth);
	const cook = res.headers.get('set-cookie').split(' HttpOnly, ');
	const cookies = storeCookies(cook);
	const body = await res.text();
	const ppft = body.match(R_PPFT)[1];
	const post = body.match(R_POST)[1];
	const data = stringify({
		login: waypointLogin,
		passwd: waypointPassword,
		PPFT: ppft,
	});

	const resLogin = await fetch(post, {
		method: 'POST',
		body: data,
		headers: {
			'cookie': cookies.join(''),
			'content-type': 'application/x-www-form-urlencoded',
		},
		redirect: 'manual',
	});
	const location = resLogin.headers.get('location');

	const resAuth = await fetch(location, {
		redirect: 'manual',
	});
	// TODO: Check if code == 302
	// The way these cookies are split damages the 'expires' cookie.
	// This is fine, because all we need here is the Auth cookie.
	const authCook = resAuth.headers.get('set-cookie').split(', ');
	const authCookies = storeCookies(authCook);
	for (const c of authCookies) {
		if (c.startsWith('Auth=')) {
			auth = c;
		}
	}
	return auth;
}

// the json we return might contain a single array. consider grabbing json[0]
async function fetchResult(endpoint) {
	let res = await fetch(endpoint, {
		headers: { 'cookie': auth },
	});
	try {
		const json = await res.json();
		return json;
	}
	catch (err) {
		console.log('Response from endpoint was not valid JSON\n' +
			'Attempting to grab new OAuth...');
		await getAuth();
		res = await fetch(endpoint, {
			headers: { 'cookie': auth },
		});
		try {
			const json = await res.json();
			console.log('Attempt successful.');
			return json;
		}
		catch (err) {
			console.log('Attempt failed.');
			throw err;
		}
	}
}

module.exports = {
	// Use &page=2 to fetch additional games. Up to 100.
	async getHistory(version, gamertag) {
		const endpoint = `${site}${version}/game-history?gamertags=${gamertag}&gameVariant=all&view=DataOnly`;
		return await fetchResult(endpoint);
	},
};
