let http = require('http')
let request = require('request')

let url = require('url')
// Set a the default value for --host to 127.0.0.1
let argv = require('yargs')
    .default('host', '127.0.0.1:8000')
    .argv

// Get the --port value
// If none, default to the echo server port, or 80 if --host exists
let port = argv.port || (argv.host === '127.0.0.1' ? 8000 : 80)

// Update our destinationUrl line from above to include the port
let destinationUrl = argv.url || url.format({
       protocol: 'http',
       host: argv.host,
       port
    })

let path = require('path')
let fs = require('fs')
let logPath = argv.log && path.join(__dirname, argv.log)
let logStream = logPath ? fs.createWriteStream(logPath) : process.stdout

http.createServer((req, res) => {
    console.log(`Request received at: ${req.url}`)
    //req.pipe(res)
    for (let header in req.headers) {
    	res.setHeader(header, req.headers[header])
	}
	// Log the proxy request headers and content in the **server callback**
	let outboundResponse = request(options)
	req.pipe(outboundResponse)

	process.stdout.write(JSON.stringify(outboundResponse.headers))
	outboundResponse.pipe(process.stdout)
	outboundResponse.pipe(res)
}).listen(8000)

http.createServer((req, res) => {
  	console.log(`Proxying request to: ${destinationUrl + req.url}`)
	let options = {
	    headers: req.headers,
	    url: `http://${destinationUrl}${req.url}`
	}
    //request(options)
    //request(options).pipe(res)
    // Use the same HTTP verb
	options.method = req.method

	// Note: streams are chainable
	// readableStream -> writable/readableStream -> writableStream
	req.pipe(request(options)).pipe(res)
	process.stdout.write('\n\n\n' + JSON.stringify(req.headers))
	req.pipe(logStream, {end: false})
    
}).listen(8001)