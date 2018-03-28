const DiscordRP = require('discord-rich-presence'),
      events = require('events'),
      log = require('fancy-log'),
      jsdom = require('jsdom'),
      { JSDOM } = jsdom

var data = {
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

var prevStatus = '',

sendPayload = res => {
    var client = new DiscordRP('427863248734388224')
    let elapsedTimeChanged = false,
        { document } = new JSDOM(res.body).window,
        infoHtml = document.querySelector('#mpchc_np').innerHTML
    let infoArray = infoHtml.split(/\s*[•«»/]\s*/)
    
    data.mpchcVersion = infoArray[1]
    data.fileName = (infoArray[2] == '') ? undefined : infoArray[2]
    data.elapsedTime = sanitizeTime(infoArray[3])
    data.totalDuration = sanitizeTime(infoArray[4])
    data.fileSize = infoArray[5]

    var payload = {
        state: data.totalDuration + ' total',
        startTimestamp: 0,
        details: data.fileName,
        elapsedTime: undefined,
        largeImageKey: "default",
        smallImageKey: '',
        smallImageText: '',
    }

    if (convert(data.totalDuration) == 0) {
        payload.details = undefined
        payload.startTimestamp = undefined
        data.status = 'Idling'
    }
    else if (data.elapsedTime == data.prevElapsedTime) data.status = 'Paused';
    else {
        data.status = 'Playing';
        payload.startTimestamp = (Date.now() / 1000) - convert(data.elapsedTime)
        if (convert(data.elapsedTime) != convert(data.prevElapsedTime) + 1) {
            payload.startTimestamp = (Date.now() / 1000) - convert(data.elapsedTime)
            elapsedTimeChanged = true
        }
    }

    switch (data.status) {
        case 'Idling':
            payload.state = data.status
            break;
        case 'Paused':
            payload.state = data.elapsedTime + ' / ' + data.totalDuration
            break;
    }

    payload.smallImageKey = statusImage[data.status.toLowerCase()]
    payload.smallImageText = data.status

    if (data.status != prevStatus || elapsedTimeChanged) {
        client.updatePresence(payload)
        log.info('Presence updated')
    }
    
    prevStatus = data.status
    data.prevElapsedTime = data.elapsedTime 
    log.warn(
        'CONNECTED - ' +
        data.status + ' - ' +
        data.elapsedTime + ' / ' + data.totalDuration + ' - ' +
        data.fileName)
}

convert = (time) => {
    let parts = time.split(':');
        seconds = parseInt(parts[parts.length-1]),
        minutes = parseInt(parts[parts.length-2]),
        hours = (parts.length > 2) ? parseInt(parts[0]) : 0
    return ((hours * 60 * 60) + (minutes * 60) + seconds);
}

sanitizeTime = (time) => {
    if (time.split(':')[0] == '00') {
        return time.substr(3, time.length-1)
    }
    return time;
}

module.exports = sendPayload