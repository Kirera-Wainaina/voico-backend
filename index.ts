import { IncomingMessage, ServerResponse } from "http";

const http = require("http");
const http2 = require("http2");
const dotenv = require("dotenv")

const HTTP_PORT = 80;
const HTTPS_PORT = 443;

dotenv.config()

/////////////////////////REDIRECT HTTP REQUESTS////////////////////////////////////////
const httpServer = http.createServer();

httpServer.on("request", (request: IncomingMessage, response: ServerResponse) => {
  response.writeHead(301, {
    "location": `${process.env.DOMAIN}${request.url}`
  })
  response.end()
})

httpServer.listen(HTTP_PORT, () => console.log(`Listening on port ${HTTP_PORT}`))