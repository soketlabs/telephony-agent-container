import data_config from '../data/config.json' with { type: 'json' };
import { plivo_setup, plivoAddStream, createPlivoEvent } from '../provider/plivo_setup.js'

// console.log(data_config)

// Try multiple JSON shapes, fallback to env or 'plivo'
const telephony_provider =
  data_config?.provider_config?.provider
  ?? data_config?.data_config?.provider_config?.provider
  ?? process.env.TELEPHONY_PROVIDER
  ?? 'plivo';

export function telephony_setup() {
    console.log(`Telephony setup`);
    if (telephony_provider === 'plivo') {
        console.log(`Setting up Plivo telephony.`);
        return plivo_setup();
    } else {
        console.error(`Telephony provider ${telephony_provider} is not supported.`);
        return null;
    }   
}

export function addStream(streamUrl, streamParams) {
    if (telephony_provider === 'plivo') {
        plivoAddStream(streamUrl, streamParams);
    } else {
        console.error(`Telephony provider ${telephony_provider} is not supported for adding streams.`);
    }   
}

export function toXML(telephony_attributes) {
    if (telephony_provider === 'plivo' && telephony_attributes?.telephonyResponse) {
        return telephony_attributes.telephonyResponse.toXML();
    }
    return '';
}

export function createTelephonyEvent(audio){
    if (telephony_provider === 'plivo') {
        return createPlivoEvent(audio);
    } else {
        console.error(`Telephony provider ${telephony_provider} is not supported for creating events.`);
        return null;
    }
}