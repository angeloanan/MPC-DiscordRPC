const log = require('fancy-log')

log.info('INFO: Loading...')

const client = require('discord-rich-presence')('419528742524813313')
const events = require('events')
const snekfetch = require('snekfetch')
const fs = require('fs')

const config = JSON.parse(fs.readFileSync(`./config.json`, {encoding: 'utf8'}))

var mediaEmitter = new events.EventEmitter()

if (config.port == null) throw new Error('Port is empty (null)!')
const uri = `http://localhost:${config.port}`

log.info('INFO: Fully ready')
log.info('INFO: Listening on ' + uri)

mediaEmitter.on('CONNECTED', function (res) {
  log.warn('CONNECTED ' + res)
})

mediaEmitter.on('ERROR', function (code) {
  log.error('ERRROR: ' + code)
})

// Functions

function checkMedia () {
  snekfetch.get(uri)
    .then(function (res) {
      mediaEmitter.emit('CONNECTED', res)
    })
    .catch(function (err) {
      mediaEmitter.emit('ERROR', err.code)
    })
}

global.intloop = setInterval(checkMedia, 2000)

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
