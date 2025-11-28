import dotenv from 'dotenv'
import plivo from "plivo"
import { RealtimeUtils } from "@openai/realtime-api-beta"
dotenv.config({ override: true })

const TELEPHONY_PORT = process.env.PLIVO_PORT
const TELEPHONY_WS_URL = process.env.PLIVO_WS_URL + ":" + TELEPHONY_PORT
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
export function plivo_setup() {
    return {
        telephonyResponse,
        streamParams,
        TELEPHONY_WS_STREAM_URL,
        TELEPHONY_WS_URL,
        TELEPHONY_PORT
    }
}

export function plivoAddStream(streamUrl, streamParams) {
    telephonyResponse.addStream(streamUrl, streamParams)
    console.log("Added Plivo stream: ", streamUrl)
}

export function createPlivoEvent(audio){
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