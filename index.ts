import { IncomingMessage, ServerResponse } from "http";
import { Http2ServerRequest, Http2ServerResponse } from "http2";

const http = require("http");
const http2 = require("http2");
const fs = require('node:fs')
const dotenv = require("dotenv")

const HTTP_PORT = 80;
const HTTP2_PORT = 443;

dotenv.config()

///////////////////////// REDIRECT HTTP REQUESTS /////////////////////////////////
const httpServer = http.createServer();

httpServer.listen(HTTP_PORT, () => console.log(`Listening on port ${HTTP_PORT}`));

httpServer.on("request", (request: IncomingMessage, response: ServerResponse) => {
  response.writeHead(301, {
    "location": `${process.env.DOMAIN}${request.url}`
  })
  response.end()
})

//////////////////////// HANDLE HTTPS REQUESTS ///////////////////////////////////

const options = {
  allowHTTP1: true,
  key: fs.readFileSync(process.env.CERT_KEY_PATH),
  cert: fs.readFileSync(process.env.CERT_CERTIFICATE_PATH)
};

const http2Server = http2.createSecureServer(options);

http2Server.listen(HTTP2_PORT, () => console.log(`Listening on port ${HTTP2_PORT}`))

http2Server.on("request", (request: Http2ServerRequest, response: Http2ServerResponse) => {
  if (request.headers[":method"] == "GET") {
    handleGETRequests(request, response);
  } else if (request.headers[":method"] == "POST") {
    handlePOSTRequests(request, response);
  }
})

function handleGETRequests(request:Http2ServerRequest, response: Http2ServerResponse) {
  response.writeHead(200, { "content-type": "text/html" });
  response.end("<h1>Hello, World!</h1>");
}

function handlePOSTRequests(request:Http2ServerRequest, response:Http2ServerResponse) {
  const requestPath = request.headers[":path"];

  if (requestPath) {
    const parsedUrl = new URL(requestPath, process.env.DOMAIN);
    console.log(`.${parsedUrl.pathname}`)
    const main = require(`.${parsedUrl.pathname}.js`);
    main(request, response);
  }
}