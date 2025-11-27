import { create } from "domain";
import {plivo_setup, plivoAddStream} from "./plivo_setup.js";

const data_config = require('./data/config.json');
const telephony_provider = data_config['telephony_provider'].provider;

function telephony_setup() {
    
    console.log(`Telephony setup`);

    if (telephony_provider === 'plivo') {
        console.log(`Setting up Plivo telephony.`);
        return plivo_setup();
    } else {
        console.error(`Telephony provider ${telephony_provider} is not supported.`);
    }   
    console.log(`Telephony setup complete.`);
}

function addStream(streamUrl, streamParams) {
    if (telephony_provider === 'plivo') {
        plivoAddStream(streamUrl, streamParams);
    } else {
        console.error(`Telephony provider ${telephony_provider} is not supported for adding streams.`);
    }   
}

function toXML() {
    if (telephony_provider === 'plivo') {
        return telephony_attributes.telephonyResponse.toXML();
    }
}

function createTelephonyEvent(audio){
    if (telephony_provider === 'plivo') {
        createPlivoEvent(audio);
    } else {
        console.error(`Telephony provider ${telephony_provider} is not supported for creating events.`);
    }
}

export { telephony_setup, addStream, toXML, createTelephonyEvent };