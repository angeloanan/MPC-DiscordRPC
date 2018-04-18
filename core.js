const DiscordRP = require('discord-rich-presence'),
      client = new DiscordRP('427863248734388224'),
      events = require('events'),
      log = require('fancy-log'),
      jsdom = require('jsdom'),
      { JSDOM } = jsdom

var playback = {
    filename: '',
    position: '',
    duration: '',
    fileSize: '',
    state: '',
    prevState: '',
    prevPosition: '',
}

const states = {
    '-1': {
        string: 'Idling',
        stateKey: 'stop_small'
    },
    '0': {
        string: 'Stopped',
        stateKey: 'stop_small'
    },
    '1': {
        string: 'Paused',
        stateKey: 'pause_small'
    },
    '2': {
        string: 'Playing',
        stateKey: 'play_small'
    }
}

const updatePresence = res => {
    let { document } = new JSDOM(res.body).window
        
    playback.filename     = document.getElementById('file').textContent
    playback.state        = document.getElementById('state').textContent
    playback.duration     = sanitizeTime(document.getElementById('durationstring').textContent)
    playback.position     = sanitizeTime(document.getElementById('positionstring').textContent)

    let payload = {
        state: playback.duration + ' total',
        startTimestamp: undefined,
        details: playback.filename,
        largeImageKey: "default",
        smallImageKey: states[playback.state].stateKey,
        smallImageText: states[playback.state].string
    }

    switch (playback.state) {
        case '-1': // Idling
            payload.state = states[playback.state].string
            payload.details = undefined
            break;
        case '1': // Paused
            payload.state = playback.position + ' / ' + playback.duration
            break;
        case '2': // Playing
            payload.startTimestamp = (Date.now() / 1000) - convert(playback.position)
            break;
    }

    if ( (playback.state != playback.prevState) || (
            playback.state == '2' && 
            convert(playback.position) != convert(playback.prevPosition) + 1
        ) ) {
        client.updatePresence(payload)
        log.info('INFO: Presence update sent:\n' + 
            'CONNECTED - ' +
            states[playback.state].string + ' - ' +
            playback.position + ' / ' + playback.duration + ' - ' +
            playback.filename)
    }
    
    playback.prevState = playback.state
    playback.prevPosition = playback.position 
    return true
}

const convert = time => {
    let parts = time.split(':'),
        seconds = parseInt(parts[parts.length-1]),
        minutes = parseInt(parts[parts.length-2]),
        hours = (parts.length > 2) ? parseInt(parts[0]) : 0
    return ((hours * 60 * 60) + (minutes * 60) + seconds)
}

const sanitizeTime = time => {
    if (time.split(':')[0] == '00') {
        return time.substr(3, time.length-1)
    }
    return time
}

module.exports = updatePresence