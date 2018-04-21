'use strict'

const log = require('fancy-log')

log.info('INFO: Loading...')

const snekfetch = require('snekfetch'),
	  core = require('./core'),
	  events = require('events'),
	  config = require('./config')

let mediaEmitter = new events.EventEmitter(),
	active = false

if (isNaN(config.port)) {
	throw new Error('Port is empty or invalid! Please set a valid port number in \'config.js\' file.')
}
const uri = `http://localhost:${config.port}/variables.html`

log.info('INFO: Fully ready')
log.info('INFO: Listening on ' + uri)

mediaEmitter.on('CONNECTED', res => {
	if (global.intloop._idleTimeout === 15000) {
		clearInterval(global.intloop)
		setInterval(checkMedia, 1000)
	}
	active = core(res)
})

mediaEmitter.on('CONN_ERROR', code => {
	log.error(`ERROR: Unable to connect to Media Player Classic on port ${config.port}. ` + 
	`Make sure MPC is running, Web Interface is enabled and the port set in 'config.js' file is correct.\n` + code)
	if (active) {
		process.exit()
	}
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

global.intloop = setInterval(checkMedia, 15000)
