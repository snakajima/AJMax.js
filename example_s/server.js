var static = require('node-static');
var http = require('http');
var qs = require('querystring');
var URL = require('url');
var https = require('https');
var ajmax = require('../lib/ajmax.js');

//
// Create a node-static server to serve the './static' directory
//
var file = new(static.Server)('./static', { cache: 7200, headers: {'X-Hello':'World!'} });

var AJ = ajmax.createServer();

http.createServer(function (request, response) {
  request.addListener('end', function () {
    if (!AJ.serve(request, response)) {
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
    }
  });
}).listen(8000);

// Helper function to retrieve a cookie value
function cookieValue(req, key) {
  var items = req.headers['cookie'].split(';');
  for (var i in items) {
    var pair = items[i].split('=');
    if (pair.length == 2 && pair[0].trim() == key) {
      return pair[1].trim();
    }
  }
  return null;
}

// Helper function for Facebook Graph API access
function Facebook(ctx) {
  this.ctx = ctx;
  if (ctx.params.accessToken) {
    this.accessToken = ctx.params.accessToken;
    this.setCookie = true;
  } else {
    this.accessToken = cookieValue(ctx.request, 'accessToken');
  }
}

Facebook.prototype.api = function(path, params, callback) {
  var that = this;
  params.access_token = this.accessToken;
  var search = qs.stringify(params);
  var url = URL.format({ protocol:'https', host:'graph.facebook.com', pathname:path, search:search })
  var body = [];
  https.get(url, function(res) {
    res.setEncoding('utf8');
    res.on('data', function(chunk) {
      body.push(chunk);
    });
    res.on('end', function() {
      if (res.statusCode >= 300) {
        console.log(res.statusCode);
        console.log(body);
      }
      if (that.setCookie) {
        that.ctx.response.setHeader('Set-Cookie', 'accessToken=' + that.accessToken);
      }
      callback(JSON.parse(body.join('')));
    });
  });
};

// Handle AJAX events from the client
AJ.on('load', function(ctx) {
  ctx.deferred();
  var FB = new Facebook(ctx);
  FB.api('/me', { fields:'name' }, function(result) {
    ctx.exec([
      { cmd:'html', params:{ data:result, template:'hello', selector:'#message' }},
      { cmd:'html', params:{ template:'loading_friends', selector:'#contents' }},
      { cmd:'emit', params:{ event:'friends' }},
    ]);
  });
}).on('friends', function(ctx) {
  ctx.deferred();
  var FB = new Facebook(ctx);
  FB.api('/me/friends', {}, function(result) {
    ctx.exec([
      { cmd:'html', params:{ template:'friends', selector:'#contents' }},
      { cmd:'html', params:{ data:result.data, template:'friend', selector:'#friends',
        bindings:[
          { selector:'.friend', event:'click', actions:[
            { cmd:'hide', params: { selector:'#contents' } },
            { cmd:'emit', params: { event:'friend_selected' } }
          ]}
        ]}
      }
    ]);
  });
}).on('friend_selected', function(ctx) {
  ctx.exec(
    { cmd:'open', params:{ url:'http://www.facebook.com/' +  ctx.params.id }}
  );
});

console.log("this server is listening on http://127.0.0.1:8000");
