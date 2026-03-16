import dotenv from "dotenv";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { parse as parseUrl } from "url";
import { telephony_setup, addStream, toXML } from "../utils/telephony_setup.js";

dotenv.config({ override: true });

const RELAY_PORT = Number(process.env.RELAY_PORT) || 3390;
const telephony_attributes = telephony_setup();

// HTTP server: handles /.../answer.xml and /status_callback
const server = createServer((req, res) => {
  const { pathname } = parseUrl(req.url || "", true);

  if (req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk.toString()));
    req.on("end", () => {
      const params = new URLSearchParams(body);
      // const url = params.get("ws_url") || wsUrl;
      const parsedData = Object.fromEntries(params);
      console.log('Received POST data:', parsedData);
      // if (url) {
      //   connectToStream(url);
      //   res.writeHead(200, { "Content-Type": "application/json" });
      //   res.end(JSON.stringify({ ok: true }));
      // } else {
      //   res.writeHead(400, { "Content-Type": "application/json" });
      //   res.end(JSON.stringify({ error: "missing ws_url" }));
      // }

    });
    // return;
  }

  // For requests like: /dev/telephony:3391/answer.xml
  // We want to extract the port (3391) from the path segment before "answer.xml"
  // and build a *public* WS URL on this relay, e.g.:
  //   ws://api.soket.ai/dev/telephony:3391/plivo_streamer
  let upstreamPort = null;
  let wsStreamUrl = null;
  if (pathname) {
    const segments = pathname.split("/").filter(Boolean); // ["dev", "telephony:3391", "answer.xml"]
    const beforeAnswer = segments.length >= 2 ? segments[segments.length - 2] : null; // "telephony:3391"
    if (beforeAnswer && beforeAnswer.includes(":")) {
      const [, portStr] = beforeAnswer.split(":");
      const p = Number(portStr);
      if (!Number.isNaN(p)) upstreamPort = p;
    }
  }

  if (upstreamPort) {
    const hostHeader = req.headers.host || ""; // e.g. "api.soket.ai:3390"
    const hostOnly = hostHeader.split(":")[0] || "api.soket.ai";
    const base = `ws://${hostOnly}`;
    // Replace trailing "/answer.xml" with "/plivo_streamer"
    const wsPath = pathname.replace(/\/answer\.xml$/, "/plivo_streamer");
    wsStreamUrl = `${base}${wsPath}`;
    wsStreamUrl = `${process.env.TELEPHONY_WS_STREAM_URL}:${upstreamPort}/plivo_streamer`
    console.log("Extracted upstream port from path segment:", upstreamPort);
    console.log("Public WS proxy URL for provider:", wsStreamUrl);
  }

  // Handle any path that ends with "/answer.xml", e.g. "/dev/telephony:3391/answer.xml"
  if (pathname && pathname.endsWith("/answer.xml")) {

    console.log("Received request to answer.xml");
    console.log(req.url);

    const streamUrl = wsStreamUrl || telephony_attributes.TELEPHONY_WS_STREAM_URL;
    console.log("Stream URL exposed to provider:", streamUrl);
    // Tell telephony provider to open a WS stream to this relay;
    // the relay will proxy that WS to the internal localhost:upstreamPort server.
    addStream(streamUrl, telephony_attributes.streamParams);
    console.log("Sent response to user, method:", req.method);
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(toXML(telephony_attributes));
    // return;

  } else if (pathname === "/status_callback") {

    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("OK");
    return;

  } else {
    console.log("Cant find: ", req.url);
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
    return;
  }
});

// WebSocket proxy: provider connects to this relay (public),
// relay connects to internal ws://localhost:<upstreamPort> and pipes traffic.
const wss = new WebSocketServer({ noServer: true });

server.on("upgrade", (req, socket, head) => {
  const { pathname } = parseUrl(req.url || "", true);

  // Expect paths like: /dev/telephony:3391/plivo_streamer
  if (!pathname || !pathname.endsWith("/plivo_streamer")) {
    socket.destroy();
    return;
  }

  const segments = pathname.split("/").filter(Boolean); // ["dev", "telephony:3391", "ws"]
  const beforeWs = segments.length >= 2 ? segments[segments.length - 2] : null; // "telephony:3391"

  let upstreamPort = null;
  if (beforeWs && beforeWs.includes(":")) {
    const [, portStr] = beforeWs.split(":");
    const p = Number(portStr);
    if (!Number.isNaN(p)) upstreamPort = p;
  }

  if (!upstreamPort) {
    console.error("Could not extract upstreamPort from WS path:", pathname);
    socket.destroy();
    return;
  }

  // wss.handleUpgrade(req, socket, head, (providerWs) => {
  //   const targetUrl = `ws://localhost:${upstreamPort}/plivo_streamer`;
  //   console.log("Proxying WS between provider and", targetUrl);

  //   const internalWs = new WebSocket(targetUrl);
  //   const providerToInternalQueue = [];
  //   let providerClosed = false;
  //   let providerMsgCount = 0;
  //   let internalMsgCount = 0;

  //   const closeBoth = () => {
  //     try { providerWs.close(); } catch {}
  //     try { internalWs.close(); } catch {}
  //   };

  //   providerWs.on("message", (msg) => {
  //     providerMsgCount += 1;
  //     const outbound = Buffer.isBuffer(msg) ? msg.toString("utf8") : msg;
  //     if (internalWs.readyState === WebSocket.OPEN) {
  //       internalWs.send(outbound);
  //     } else {
  //       providerToInternalQueue.push(outbound);
  //     }
  //     if (providerMsgCount <= 3 || providerMsgCount % 200 === 0) {
  //       console.log(`[relay] provider->internal msg#${providerMsgCount} queued=${providerToInternalQueue.length} bytes=${msg?.length ?? msg?.byteLength ?? "?"}`);
  //     }
  //   });

  //   internalWs.on("open", () => {
  //     console.log("[relay] Internal WS connected");
  //     while (providerToInternalQueue.length && internalWs.readyState === WebSocket.OPEN) {
  //       internalWs.send(providerToInternalQueue.shift());
  //     }
  //   });

  //   internalWs.on("message", (msg) => {
  //     internalMsgCount += 1;
  //     const outbound = Buffer.isBuffer(msg) ? msg.toString("utf8") : msg;
  //     if (providerWs.readyState === WebSocket.OPEN) providerWs.send(outbound);
  //     if (internalMsgCount <= 3 || internalMsgCount % 50 === 0) {
  //       console.log(`[relay] internal->provider msg#${internalMsgCount} bytes=${msg?.length ?? msg?.byteLength ?? "?"}`);
  //     }
  //     if (internalMsgCount === 1) {
  //       const preview = (typeof outbound === "string" ? outbound : "").slice(0, 200);
  //       console.log("[relay] internal->provider first payload preview:", preview);
  //     }
  //   });

  //   internalWs.on("error", (err) => {
  //     console.error("[relay] Internal WS error:", err.message);
  //     closeBoth();
  //   });

  //   providerWs.on("error", (err) => {
  //     console.error("[relay] Provider WS error:", err.message);
  //     closeBoth();
  //   });

  //   internalWs.on("close", (code, reason) => {
  //     console.log("[relay] Internal WS closed:", code, reason?.toString?.() || "");
  //     closeBoth();
  //   });

  //   providerWs.on("close", (code, reason) => {
  //     providerClosed = true;
  //     console.log("[relay] Provider WS closed:", code, reason?.toString?.() || "");
  //     // Give internal a moment to flush any final audio back (if any)
  //     setTimeout(() => closeBoth(), 250);
  //   });
  // });

  wss.handleUpgrade(req, socket, head, (providerWs) => {
    const targetUrl = `ws://localhost:${upstreamPort}/plivo_streamer`;
    console.log("[relay] Proxying WS to", targetUrl);
  
    const internalWs = new WebSocket(targetUrl);
    const queue = [];
  
    // Provider -> Internal
    providerWs.on("message", (msg) => {
      const outbound = Buffer.isBuffer(msg) ? msg.toString("utf8") : msg;
      if (internalWs.readyState === WebSocket.OPEN) {
        internalWs.send(outbound);
      } else {
        queue.push(outbound);
        console.log(`[relay] provider->internal queued (readyState=${internalWs.readyState}) total=${queue.length}`);
      }
    });
  
    internalWs.on("open", () => {
      console.log(`[relay] Internal WS open, flushing ${queue.length} queued messages`);
      while (queue.length) internalWs.send(queue.shift());
    
      // Internal -> Provider: convert Buffer to string, Plivo expects JSON string
      internalWs.on("message", (msg) => {
        const outbound = Buffer.isBuffer(msg) ? msg.toString("utf8") : msg;
        if (providerWs.readyState === WebSocket.OPEN) providerWs.send(outbound);
      });
    });
  
    const closeBoth = () => {
      if (providerWs.readyState === WebSocket.OPEN) providerWs.close();
      if (internalWs.readyState === WebSocket.OPEN) internalWs.close();
    };
  
    providerWs.on("close", (code, reason) => {
      console.log("[relay] Provider WS closed:", code, reason?.toString() || "");
      closeBoth();
    });
    internalWs.on("close", (code, reason) => {
      console.log("[relay] Internal WS closed:", code, reason?.toString() || "");
      closeBoth();
    });
    providerWs.on("error", (err) => { console.error("[relay] Provider error:", err.message); closeBoth(); });
    internalWs.on("error", (err) => { console.error("[relay] Internal error:", err.message); closeBoth(); });
  });
});

server.listen(RELAY_PORT, () => {
  console.log(`[relay] HTTP+WS relay running on port ${RELAY_PORT}`);
});
