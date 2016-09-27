"use strict";

let http = require('http')
let request = require('request')

// Place near the top of your file, just below your other requires 
let url = require('url')
// Set a the default value for --host to 127.0.0.1
let argv = require('yargs')
    .default('host', '127.0.0.1')
    .default('port', "8000")
    .argv

let destinationUrl = argv.host + ":" + argv.port

let path = require('path')
let fs = require('fs')
let logPath = argv.log && path.join(__dirname, argv.log)
let logStream = logPath ? fs.createWriteStream(logPath) : process.stdout

console.log('destinationUrl = '+destinationUrl)

http.createServer((req, res) => {
    console.log(`Request received at: ${req.url}`)
    for (let header in req.headers) {
        res.setHeader(header, req.headers[header])
    }
    req.pipe(res)
    // res.end('hello world\n')

    logStream.write('\n\n\n' + JSON.stringify(req.headers))
    req.pipe(logStream, {end: false})
}).listen(8000)

http.createServer((req, res) => {
  console.log(`Proxying request to: ${destinationUrl + req.url}`)
    // Proxy code
    let options = {
        headers: req.headers,
        url: `http://${destinationUrl}${req.url}`
    }
    options.method = req.method

    // Log the proxy request headers and content in the **server callback**
    let outboundResponse = request(options)
    req.pipe(outboundResponse)

    logStream.write(JSON.stringify(outboundResponse.headers))
    outboundResponse.pipe(logStream, {end: false})
    outboundResponse.pipe(res)
}).listen(8001)