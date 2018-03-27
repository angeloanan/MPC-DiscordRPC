const log = require('fancy-log'),
	jsdom = require('jsdom'),
	{ JSDOM } = jsdom

log.info('INFO: Loading...')

const client = require('discord-rich-presence')('427863248734388224')
const events = require('events')
const snekfetch = require('snekfetch')
const fs = require('fs')

const data = {
	mpchcVersion: '',
	fileName: '',
	elapsedTime: '',
	prevElapsedTime: '',
	totalDuration: '',
	fileSize: '',
	status: 'Idling'
}

const statusImage = {
	playing: 'play_small',
	paused: 'pause_small',
	idling: 'stop_small'
}

const config = JSON.parse(fs.readFileSync(`./config.json`, {
	encoding: 'utf8'
}))

var mediaEmitter = new events.EventEmitter()

if (config.port == null) throw new Error('Port is empty (null)!')
const uri = `http://localhost:${config.port}/info.html`

log.info('INFO: Fully ready')
log.info('INFO: Listening on ' + uri)

mediaEmitter.on('CONNECTED', function (res) {
	console.log(client)
	let { document } = new JSDOM(res.body).window,
		htmlInfo = document.querySelector('#mpchc_np').innerHTML,
		infoArray = htmlInfo.split(/\s*[•«»/]\s*/)

	data.mpchcVersion = infoArray[1]
	data.fileName = infoArray[2]
	data.elapsedTime = infoArray[3]
	data.totalDuration = infoArray[4]
	data.fileSize = infoArray[5]

	if (data.totalDuration == '00:00:00') {
		data.fileName = undefined
		data.elapsedTime = ''
		data.totalDuration = ''
		data.status = 'Idling'
	}
	else if (data.elapsedTime == data.prevElapsedTime) data.status = 'Paused';
	else data.status = 'Playing';

	data.prevElapsedTime = data.elapsedTime
	updatePresence(data);
	log.warn(
		'CONNECTED - ' + 
		data.status + ' - ' + 
		data.elapsedTime + ' / ' + data.totalDuration + ' - ' +
		data.fileName)
	
})

mediaEmitter.on('ERROR', function (code) {
	log.error('ERRROR: ' + code)
	process.exit();
})

mediaEmitter.on('error', e => {
	log.error('error' + e)
})

// Functions

function checkMedia() {
	snekfetch.get(uri)
		.then(function (res) {
			mediaEmitter.emit('CONNECTED', res)
		})
		.catch(function (err) {
			mediaEmitter.emit('ERROR', err.code)
		})
}

setInterval(checkMedia, 2000)

updatePresence = (data) => {
	let statusText = (data.status != 'Idling')?
		(data.elapsedTime + ' / ' + data.totalDuration):
		data.status

	client.updatePresence({
		state: statusText,
		details: data.fileName,
		largeImageKey: "default",
		largeImageText: data.mpchcVersion,
		smallImageKey: statusImage[data.status.toLowerCase()],
		smallImageText: data.status,
		instance: true
	})
}

// Error Example

// { Error: connect ECONNREFUSED 127.0.0.1:13579
//     at Object._errnoException (util.js:999:13)
//     at _exceptionWithHostPort (util.js:1020:20)
//     at TCPConnectWrap.afterConnect [as oncomplete] (net.js:1207:14)
//   errno: 'ECONNREFUSED',
//   code: 'ECONNREFUSED',
//   syscall: 'connect',
//   address: '127.0.0.1',
//   port: 13579 }

// { expires: 'Thu, 19 Nov 1981 08:52:00 GMT',
//      'cache-control': 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0',
//      pragma: 'no-cache',
//      'content-type': 'text/html',
//      'content-length': '9946',
//      'set-cookie': [ 'MPCSESSIONID=df00f9f0; path=/' ],
//      server: 'MPC-HC WebServer',
//      connection: 'close' },
//   statusCode: 200,
//   statusText: 'OK' }