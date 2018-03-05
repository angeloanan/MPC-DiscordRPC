console.log('[INFO] Loading...')
const client = require('discord-rich-presence')('419528742524813313')
const axios = require('axios')
const fs = require('fs')
const config = JSON.parse(fs.readFileSync(`./config.json`, {encoding: 'utf8'}))

if (config.port == null) throw new Error('Port is empty (null)!')
const url = `localhost:${config.port}`

console.log('[INFO] Fully ready')
console.log('[INFO] Listening on ' + url)

axios.get(url).then(function (res) {
  console.log(res)
}).catch(function (err) {
  console.log(`[INFO] Failed getting session: ${err}`)
})

client.updatePresence({
  state: 'slithering',
  details: '🐍',
  startTimestamp: Date.now(),
  endTimestamp: Date.now() + 1337,
  largeImageKey: 'snek_large',
  smallImageKey: 'snek_small',
  instance: true
})
