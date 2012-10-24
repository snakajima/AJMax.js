var static = require('node-static');
var http = require('http');

//
// Create a node-static server to serve the './static' directory
//
var file = new(static.Server)('./static', { cache: 7200, headers: {'X-Hello':'World!'} });

http.createServer(function (request, response) {
  request.addListener('end', function () {
    if (request.url == '/favicon.ico') {
      http.get('http://www.facebook.com/favicon.ico', function(resProxy) {
        resProxy.pipe(response);
      });
    } else {
      //
      // Serve static files
      //
      file.serve(request, response, function (err, res) {
        if (err) { // An error as occured
            console.error("> Error serving " + request.url + " - " + err.message);
            response.writeHead(err.status, err.headers);
            response.end();
        } else { // The file was served successfully
            console.log("> " + request.url + " - " + res.message);
        }
      });
    }
  });
}).listen(8000);

console.log("this server is listening on http://127.0.0.1:8000");
