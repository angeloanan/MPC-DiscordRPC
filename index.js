'use strict'

const log = require('fancy-log')

log.info('INFO: Loading...')

const snekfetch = require('snekfetch'),
	  { Client } = require('discord-rpc'),
	  updatePresence = require('./core'),
	  events = require('events'),
	  config = require('./config'),
	  clientID = '427863248734388224'

let mediaEmitter = new events.EventEmitter(),
	active = false,
	discordRPCLoop,
	mpcServerLoop,
	rpc

// Checks if port set in config.js is valid.
if (isNaN(config.port)) {
	throw new Error('Port is empty or invalid! Please set a valid port number in \'config.js\' file.')
}

const uri = `http://localhost:${config.port}/variables.html`

log.info('INFO: Fully ready. Trying to connect to Discord client...')

// When it succesfully connects to MPC Web Interface, it begins checking MPC
// every 5 seconds, getting its playback data and sending it to Discord Rich Presence
// through updatePresence() function from core.js.
mediaEmitter.on('CONNECTED', res => {
	clearInterval(mpcServerLoop)
	mpcServerLoop = setInterval(checkMPCEndpoint, 5000)
	if (!active) {
		log.info('INFO: Connected to MPC-HC')
	}
	active = updatePresence(res, rpc)
})

// When connection to MPC fails it attempts to connect
// to MPC again every 15 seconds.
mediaEmitter.on('CONN_ERROR', code => {
	log.error(`ERROR: Unable to connect to Media Player Classic on port ${config.port}. ` +
		`Make sure MPC is running, Web Interface is enabled and the port set in 'config.js' file is correct.\n` + code)
	// If MPC was previously connected (ie. MPC gets closed while script is running)
	// the whole process is killed and restarted by Forever in order to clean Rich Presence
	// from user's profile, as destroyRPC() apparently can't do so.
	if (active) {
		process.exit(0)
	}
	if (mpcServerLoop._onTimeout !== checkMPCEndpoint) {
		clearInterval(mpcServerLoop)
		mpcServerLoop = setInterval(checkMPCEndpoint, 15000)
	}
})

// If RPC successfully connects to Discord client,
// this script attempts to connect to MPC Web Interface every 15 seconds. 
mediaEmitter.on('discordConnected', () => {
	clearInterval(discordRPCLoop)
	log.info('INFO: Connected to Discord. Listening MPC on ' + uri)
	checkMPCEndpoint()
	mpcServerLoop = setInterval(checkMPCEndpoint, 15000)
})

// When RPC gets disconnected from Discord Client,
// this script stops checking MPC playback data.
mediaEmitter.on('discordDisconnected', () => {
	clearInterval(mpcServerLoop)
})

// Tries to connect to Media Player Classic Web Interface and,
// if connected, fetches its data.
function checkMPCEndpoint() {
	snekfetch.get(uri)
		.then(function (res) {
			mediaEmitter.emit('CONNECTED', res)
		})
		.catch(function (err) {
			mediaEmitter.emit('CONN_ERROR', err)
		})
}

// Initiates a new RPC connection to Discord client.
function initRPC(clientID) {
	rpc = new Client({ transport: 'ipc' });
	rpc.on('ready', () => {
		clearInterval(discordRPCLoop)
		mediaEmitter.emit('discordConnected')
		rpc.transport.once('close', async () => {
			await destroyRPC();
			log.error('ERROR: Connection to Discord has closed. Trying again in 10 seconds...');
			mediaEmitter.emit('discordDisconnected')
			discordRPCLoop = setInterval(initRPC, 10000, clientID);
		});
	})

	// Log in to the RPC Client, and check whether or not it errors.
	rpc.login(clientID).catch(error => {
		log.warn('WARN: Connection to Discord has failed. Trying again in 10 seconds...');
	})
}

// Destroys any active RPC connection.
async function destroyRPC() {
	if (!rpc) return;
	await rpc.destroy();
	rpc = null;
}

// This line boots the whole script, attempting to connect
// to Discord client every 10 seconds.
discordRPCLoop = setInterval(initRPC, 10000, clientID);
