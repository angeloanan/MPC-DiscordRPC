const DiscordRP = require('discord-rich-presence'),
      events = require('events'),
      log = require('fancy-log'),
      jsdom = require('jsdom'),
      { JSDOM } = jsdom

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

var currentStatus = '';

sendPayload = res => {
    var client = new DiscordRP('427863248734388224')
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
    let statusText = (data.status != 'Idling') ?
        (data.elapsedTime + ' / ' + data.totalDuration) :
        data.status

    var payload = {
        //state: statusText,
        state: data.totalDuration + ' total',
        startTimestamp: (Date.now() / 1000) - convert(data.elapsedTime),
        details: data.fileName,
        largeImageKey: "default",
        largeImageText: data.mpchcVersion,
        smallImageKey: statusImage[data.status.toLowerCase()],
        smallImageText: data.status,
    }

    if (data.status == 'Paused') payload.startTimestamp = undefined

    
    if (data.status != currentStatus) {
        client.updatePresence(payload)
        log.info('Pacote enviado')
    }
    currentStatus = data.status;
    log.warn(
        'CONNECTED - ' +
        data.status + ' - ' +
        data.elapsedTime + ' / ' + data.totalDuration + ' - ' +
        data.fileName)
}

convert = (time) => {
    let parts = time.split(':'),
        hours = parseInt(parts[0]),
        minutes = parseInt(parts[1]),
        seconds = parseInt(parts[2]);
    return ((hours * 60 * 60) + (minutes * 60) + seconds);
}

module.exports = sendPayload