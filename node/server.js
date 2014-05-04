#!/usr/bin/env node

var zlib = require('zlib');
var https = require('https');
var fs = require('fs');

var options = {
    key: fs.readFileSync('/etc/apache2/ssl/apache.key'),
    cert: fs.readFileSync('/etc/apache2/ssl/apache.crt')
};

https.createServer(options, function(req, res) {
    var requestHeaders = req.headers;
    requestHeaders.host = 'abs.twimg.com';
    var requestOptions = {
        hostname: 'abs.twimg.com',
        port: 443,
        path: req.url,
        method: req.method,
        headers: requestHeaders
    };
    var request = https.request(requestOptions, function(response) {
        var responseText = '';
        var responseHeaders = response.headers;
        delete responseHeaders['content-encoding'];
        var gunzip = zlib.createGunzip();
        response.pipe(gunzip);
        gunzip.on('data', function(data) {
            responseText += data;
        });
        response.on('end', function () {
                responseHeaders['content-length'] = responseText.length;
                res.writeHead(response.statusCode, responseHeaders);
                res.write(responseText);
                res.end();
        });
    });
    request.end();
    request.on('error', function(e) {
        console.error(e.message);
        res.end(e);
    });
}).listen(443);
