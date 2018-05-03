'use strict'

const log = require('fancy-log')

log.info('INFO: Loading...')

const snekfetch = require('snekfetch'),
	  { Client } = require('discord-rpc'),
	  core = require('./core'),
	  events = require('events'),
	  config = require('./config'),
	  clientID = '427863248734388224'

let mediaEmitter = new events.EventEmitter(),
	active = false,
	discordRPCLoop,
	mpcServerLoop,
	rpc

if (isNaN(config.port)) {
	throw new Error('Port is empty or invalid! Please set a valid port number in \'config.js\' file.')
}

const uri = `http://localhost:${config.port}/variables.html`

log.info('INFO: Fully ready. Trying to connect to Discord client...')

mediaEmitter.on('CONNECTED', res => {
	clearInterval(mpcServerLoop)
	mpcServerLoop = setInterval(checkMedia, 5000)
	if (!active) {
		log.info('INFO: Connected to MPC-HC')
	}
	active = core(res, rpc)
})

mediaEmitter.on('CONN_ERROR', code => {
	log.error(`ERROR: Unable to connect to Media Player Classic on port ${config.port}. ` +
		`Make sure MPC is running, Web Interface is enabled and the port set in 'config.js' file is correct.\n` + code)
	if (active) {
		process.exit(0)
	}
	clearInterval(mpcServerLoop)
	mpcServerLoop = setInterval(checkMedia, 15000)
})

mediaEmitter.on('discordConnected', () => {
	clearInterval(discordRPCLoop)
	log.info('INFO: Connected to Discord. Listening MPC on ' + uri)
	checkMedia()
	mpcServerLoop = setInterval(checkMedia, 15000)
})

mediaEmitter.on('discordDisconnected', () => {
	clearInterval(mpcServerLoop)
})

// Functions
function checkMedia() {
	snekfetch.get(uri)
		.then(function (res) {
			mediaEmitter.emit('CONNECTED', res)
		})
		.catch(function (err) {
			mediaEmitter.emit('CONN_ERROR', err)
		})
}

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
		//rpc.setActivity(payload);
	})

	// Log in to the RPC Client, and check whether or not it errors.
	rpc.login(clientID).catch(error => {
		log.warn('WARN: Connection to Discord has failed. Trying again in 10 seconds...');
	})
}

async function destroyRPC() {
	if (!rpc) return;
	await rpc.destroy();
	rpc = null;
	log.info('INFO: você destruiu o meu rpc');
}

discordRPCLoop = setInterval(initRPC, 10000, clientID);
