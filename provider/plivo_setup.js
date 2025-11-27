import dotenv from 'dotenv'
import plivo from "plivo"
dotenv.config({ override: true })

const TELEPHONY_PORT = process.env.PLIVO_PORT
const TELEPHONY_WS_URL = process.env.TELEPHONY_WS_URL +":"+ TELEPHONY_PORT
const TELEPHONY_STREAM_TAG = "/plivo_streamer"
let TELEPHONY_WS_STREAM_URL = TELEPHONY_WS_URL + TELEPHONY_STREAM_TAG

var telephonyResponse = plivo.Response()

var streamParams = {
    "audioTrack": "inbound",
    "bidirectional" : true,
    "contentType": "audio/x-l16;rate=8000",
    "keepCallAlive": true,
    "streamTimeout": "360",
}
function plivo_setup() {
    return {
        telephonyResponse,
        streamParams,
        TELEPHONY_WS_STREAM_URL,
        TELEPHONY_WS_URL,
        TELEPHONY_PORT
    }
}

function plivoAddStream(streamUrl, streamParams) {
    plivoResponse.addStream(streamUrl, streamParams)
    console.log("Sent reponse to user , method: "+ req.method)
}

function createPlivoEvent(audio){
    // Implementation for creating Plivo event with audio
    var plivoEvent = {
        "event": "playAudio",
        "media": {
          "contentType": "wav",
          "sampleRate": "8000",
          "payload": RealtimeUtils.arrayBufferToBase64(audio)
        }
      }
    return plivoEvent;
}

export { plivo_setup, plivoAddStream, createPlivoEvent };