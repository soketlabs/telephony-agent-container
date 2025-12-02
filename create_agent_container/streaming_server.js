import dotenv from "dotenv"
import { createServer } from "http"
import { WebSocketServer } from "ws"
import { parse as parseUrl } from "url"
import { parse as parseQuery } from "querystring"
import { RealtimeClient, RealtimeUtils } from "@openai/realtime-api-beta"
import { telephony_setup, addStream, toXML, createTelephonyEvent } from '../utils/telephony_setup.js'
// import data_config from '../data/config.json'
import {set_config} from '../controllers/create_agent.js'

dotenv.config({ override: true })
const data_config = global.data_config || data_config;

// "statusCallbackUrl": "http://api.soket.ai:3389/status_callback",
// "statusCallbackMethod": "POST"

const telephony_attributes = telephony_setup()

const server = createServer((req, res) => {

  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const data = body;
        const params = new URLSearchParams(data);
        const parsedData = Object.fromEntries(params);
        console.log('Received POST data:', parsedData);
      } catch (e) {
        console.error('Error parsing POST data:', e);
      }
    });
  }


  if(req.url.match(/^\/answer.*\.xml$/)) {

    console.log("Received request to answer.xml")

    addStream(telephony_attributes.TELEPHONY_WS_STREAM_URL, telephony_attributes.streamParams)
    console.log("Sent reponse to user , method: "+ req.method)
    res.writeHead(200, { 'Content-Type': 'text/xml' })
    res.end(toXML(telephony_attributes))

  } else if(req.url === '/status_callback') {

  }else {
    console.log("Cant find: ", req.url)
  }
});


const wss = new WebSocketServer({ noServer: true })

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
      console.log(data)
      return
    }
    if(!client.isConnected())
      messageQueue.push(RealtimeUtils.base64ToArrayBuffer(data.media.payload))
    else{ 
      // console.log("inRelay")
      // console.log(data.media.payload)
      client.appendInputAudio(RealtimeUtils.base64ToArrayBuffer(data.media.payload))
    }
    // console.log(data)
  })

  let session_config =  data_config['session_config']

  // Connect to S2S
  try {
    console.log(`Connecting to S2S...`)
    await client.connect()
    client.updateSession(session_config)
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

server.on('upgrade', (req, sock, head) => {
  const { pathname } = new URL(req.url, telephony_attributes.TELEPHONY_WS_URL);

  console.log("Upgrade path: ", pathname)

  wss.handleUpgrade(req, sock, head, (ws) => {
    wss.emit('connection', ws, req)
  })
})

server.listen(telephony_attributes.TELEPHONY_PORT, () => {
  console.log(`Running on port ${telephony_attributes.TELEPHONY_PORT} ...`)
})