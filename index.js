"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
const http2 = require("http2");
const fs = require('node:fs');
const dotenv = require("dotenv");
// const path = require("node:path");
const { log } = require("./lib/utils");
const path_1 = __importDefault(require("path"));
const HTTP_PORT = 80;
const HTTP2_PORT = 443;
dotenv.config();
///////////////////////// REDIRECT HTTP REQUESTS /////////////////////////////////
const httpServer = http.createServer();
httpServer.listen(HTTP_PORT, () => console.log(`Listening on port ${HTTP_PORT}`));
httpServer.on("request", (request, response) => {
    response.writeHead(301, {
        "location": `${process.env.DOMAIN}${request.url}`
    });
    response.end();
});
//////////////////////// HANDLE HTTPS REQUESTS ///////////////////////////////////
const options = {
    allowHTTP1: true,
    key: fs.readFileSync(process.env.CERT_KEY_PATH),
    cert: fs.readFileSync(process.env.CERT_CERTIFICATE_PATH)
};
const http2Server = http2.createSecureServer(options);
http2Server.listen(HTTP2_PORT, () => console.log(`Listening on port ${HTTP2_PORT}`));
http2Server.on("request", (request, response) => {
    if (request.headers[":method"] == "GET") {
        handleGETRequests(request, response);
    }
    else if (request.headers[":method"] == "POST") {
        handlePOSTRequests(request, response);
    }
});
http2Server.on("request", (request) => log(`Path: ${request.url}`));
function handleGETRequests(request, response) {
    const filePath = createFilePath(request.headers[":path"]);
    response.writeHead(200, { "content-type": "text/html" });
    response.end("<h1>Hello, World!</h1>");
}
function handlePOSTRequests(request, response) {
    const requestPath = request.headers[":path"];
    if (requestPath) {
        const parsedUrl = new URL(requestPath, process.env.DOMAIN);
        const main = require(`.${parsedUrl.pathname}.js`);
        main(request, response);
    }
}
function createFilePath(requestPath) {
    if (!requestPath)
        return;
    const parsedUrl = new URL(requestPath, process.env.DOMAIN);
    if (parsedUrl.pathname == '/') {
        return `/frontend/html/home.html`;
    }
    else if (!path_1.default.extname(parsedUrl.pathname)) {
        // there is no extension therefore a browser path
        return `/frontend/html${parsedUrl.pathname}`;
    }
    else {
        // all other filepaths
        return parsedUrl.pathname;
    }
}
