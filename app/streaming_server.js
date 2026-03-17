import dotenv from "dotenv"
import { WebSocketServer } from "ws"
import { parse as parseUrl } from "url"
import { parse as parseQuery } from "querystring"
import { RealtimeClient, RealtimeUtils } from "@openai/realtime-api-beta"
import { telephony_setup, createTelephonyEvent } from '../utils/telephony_setup.js'
import data_config from '../data/config.json' with { type: "json" };
import { registerRealtimeTools } from '../utils/addTools.js'

dotenv.config({ override: true })

const telephony_attributes = telephony_setup()

const wss = new WebSocketServer({ port: process.env.TELEPHONY_WS_TEST_PORT })
console.log(`WebSocket server on port ${process.env.TELEPHONY_WS_TEST_PORT}`)

wss.on('listening', () => {
  const addr = wss.address(); // { address: '::', family: 'IPv6', port: 1234 } or similar
  console.log('WS server listening on:');
  console.log('  address:', addr.address);
  console.log('  port   :', addr.port);
  console.log('  family :', addr.family);
});

console.log('Configured port:', wss.options.port);
//connectionHandler
wss.on('connection', async (ws, req) =>  {

  console.log("URL:", req.url)

  const parsedUrl = parseUrl(req.url);
  const queryParams = parseQuery(parsedUrl.query);

  // Alternatively, using URLSearchParams:
  // const queryParams = new URLSearchParams(parsedUrl.query);
  // const param1 = queryParams.get('param1');
  // const param2 = queryParams.get('param2');

  console.log('Query parameters:', queryParams);

  const client = new RealtimeClient({ 
    url: process.env.S2S_WS_URL,
    apiKey: process.env.OPENAI_API_KEY 
  })
  // Relay: S2S -> Plivo
  client.realtime.on('close', () => ws.close())
  client.on('conversation.updated', ({item, delta}) => {
    if(delta?.audio) {
        var telephonyEvent = createTelephonyEvent(delta.audio)

      if(!!ws)
        ws.send(JSON.stringify(telephonyEvent))
    }
  })
  client.on('realtime.event', e => {
    if(e.event.type == 'rate_limits.updated') {
      console.log(e.event.rate_limits)
    }
  })

  client.on('conversation.interrupted', (event) => {
    console.log("Interrupted!")
    var telephonyEvent = {
      "event": "clearAudio"
    }
    //Note: streamId is currently a global variable
    if(!!ws)
      ws.send(JSON.stringify(telephonyEvent))
  })

  

  // Relay: Plivo -> S2S
  const messageQueue = []

  ws.on('error', console.error)
  ws.on('close', () => client.disconnect())
  ws.on('message', (msg) => {

    const data = JSON.parse(msg)
    
    if(data.event !== "media") {
      console.log('[internal] non-media event:', data)
      return
    }

    // console.log('[internal] media received, connected:', client.isConnected(), 'queueLen:', messageQueue.length)

    if(!client.isConnected())
      messageQueue.push(RealtimeUtils.base64ToArrayBuffer(data.media.payload))
    else{ 
      // console.log("inRelay")
      // console.log(data.media.payload)
      client.appendInputAudio(RealtimeUtils.base64ToArrayBuffer(data.media.payload))
    }
    // console.log(data)
  })

  let session_config = data_config.session_config;

  // Connect to S2S
  try {
    console.log(`Connecting to S2S...`)
    await client.connect()
    await registerRealtimeTools(client)
    client.updateSession(session_config)
    // client.updateSession({ 
    //   instructions: "You are a helpful assitant named Emily, from apollo hospital. You are talking to a patient on the phone and helping them book an appointment. You can ask for their name, preferred doctor, department, date and time for the appointment. Please be polite and professional.call the book_appointment tool once you have all the necessary information.",
    //   // voice: "katie",
    //   voice: "felicity", // Lara car insurance
    //   // voice: "sara",
    //   // voice: "shreyas",
    //   language: "hi",
    //   turn_detection: { 
    //     type: 'server_vad', 
    //     threshold: 0.2, 
    //     prefix_padding_ms: 1000 ,
    //     silence_duration_ms: 1000,
    //   },
    // })

    // flush queue before sending the greeting
    while (messageQueue.length) client.appendInputAudio(messageQueue.shift())
    client.sendUserMessageContent([
      {
        type: `input_text`,
        text: `Hello!`
      },
    ])
  } catch (e) {
    console.log(`Error connecting to S2S: ${e.message}`)
    ws.close()
    return
  }
  console.log(`Connected to S2S successfully!`)
  //empty queue
  while(messageQueue.length)
    client.appendInputAudio(messageQueue.shift())

})
