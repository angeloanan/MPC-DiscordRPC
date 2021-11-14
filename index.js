const log = require('fancy-log');

log.info('INFO: Loading...');

const axios = require('axios').default,
	{ Client } = require('discord-rpc'),
	updatePresence = require('./core'),
	events = require('events'),
	config = require('./config'),
	clientId = '427863248734388224';

let mediaEmitter = new events.EventEmitter(),
	active = false,
	discordRPCLoop,
	mpcServerLoop,
	rpc;

// Checks if port set in config.js is valid.
if (isNaN(config.port)) {
	throw new Error('Port is empty or invalid! Please set a valid port number in \'config.js\' file.');
}

const uri = `http://127.0.0.1:${config.port}/variables.html`;

log.info('INFO: Fully ready. Trying to connect to Discord client...');

// When it succesfully connects to MPC Web Interface, it begins checking MPC
// every 5 seconds, getting its playback data and sending it to Discord Rich Presence
// through updatePresence() function from core.js.
mediaEmitter.on('CONNECTED', res => {
	clearInterval(mpcServerLoop);
	mpcServerLoop = setInterval(checkMPCEndpoint, 5000);
	if (!active) {
		log.info(`INFO: Connected to ${res.headers.server}`);
	}
	active = updatePresence(res, rpc);
});

// When connection to MPC fails it attempts to connect
// to MPC again every 15 seconds.
mediaEmitter.on('CONN_ERROR', code => {
	log.error(`ERROR: Unable to connect to Media Player Classic on port ${config.port}. ` +
		`Make sure MPC is running, Web Interface is enabled and the port set in 'config.js' file is correct.\n` + code);
	// If MPC was previously connected (ie. MPC gets closed while script is running)
	// the whole process is killed and restarted by Forever in order to clean MPC Rich Presence
	// from user's profile, as destroyRPC() apparently can't do so.
	if (active) {
		log.warn('WARN: Killing process to clean Rich Presence from your profile...');
		process.exit(0);
	}
	if (mpcServerLoop._onTimeout !== checkMPCEndpoint) {
		clearInterval(mpcServerLoop);
		mpcServerLoop = setInterval(checkMPCEndpoint, 15000);
	}
});

// If RPC successfully connects to Discord client,
// it will attempt to connect to MPC Web Interface every 15 seconds. 
mediaEmitter.on('discordConnected', () => {
	clearInterval(discordRPCLoop);
	log.info('INFO: Connected to Discord. Listening MPC on ' + uri);
	checkMPCEndpoint();
	mpcServerLoop = setInterval(checkMPCEndpoint, 15000);
});

// If RPC gets disconnected from Discord Client,
// it will stop checking MPC playback data.
mediaEmitter.on('discordDisconnected', () => {
	clearInterval(mpcServerLoop);
});

// Tries to connect to MPC Web Interface and,
// if connected, fetches its data.
function checkMPCEndpoint() {
	axios.get(uri)
		.then(res => {
			mediaEmitter.emit('CONNECTED', res);
		})
		.catch(err => {
			mediaEmitter.emit('CONN_ERROR', err);
		});
}

// Initiates a new RPC connection to Discord client.
function initRPC(clientId) {
	rpc = new Client({ transport: 'ipc' });
	rpc.on('ready', () => {
		clearInterval(discordRPCLoop);
		mediaEmitter.emit('discordConnected');
		rpc.transport.once('close', async () => {
			await destroyRPC();
			log.error('ERROR: Connection to Discord client was closed. Trying again in 10 seconds...');
			mediaEmitter.emit('discordDisconnected');
			discordRPCLoop = setInterval(initRPC, 10000, clientId);
		});
	});

	// Log in to the RPC server on Discord client, and check whether or not it errors.
	rpc.login({ clientId }).catch(() => {
		log.warn('WARN: Connection to Discord has failed. Trying again in 10 seconds...');
	});
}

// Destroys any active RPC connection.
async function destroyRPC() {
	if (!rpc) return;
	await rpc.destroy();
	rpc = null;
}

// Boots the whole script, attempting to connect
// to Discord client every 10 seconds.
initRPC(clientId);
discordRPCLoop = setInterval(initRPC, 10000, clientId);
