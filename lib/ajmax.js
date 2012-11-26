// Copyright Satoshi Nakajima (@snakajima)
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

(function(module_) {
  var module = module_ || require.register('ajmax');
  var exports = module.exports;
 
  var util = require('util');
  var URL = require('url');
  var fs = require('fs');
  var util = require('util')
  var events = require('events');

  function Context(req, res, url) {
    this.request = req;
    this.response = res;
    this.params = url.query;
    this._url = url;
    this._handled = false;
  }

  Context.prototype.exec = function(actions) {
    this.response.writeHead(200, { 'content-type':'application/json', 'Cache-Control': 'no-cache' });
    this.response.end(JSON.stringify(actions));
    this._handled = true;
  };

  Context.prototype.deferred = function() {
    this._handled = true;
  }

  function Server(options) {
  }

  util.inherits(Server, events.EventEmitter)

  Server.prototype.serve = function (req, res) {
    var ret = false;
    var url = URL.parse(req.url, true);
    var result = RegExp('^\/_ajmax\/([a-zA-Z0-9\s\._-]+)$').exec(url.pathname);
    if (result) {
      //console.log('event: ', result[1]);
      if (result[1] == 'ajmaxc.js') {
        fs.readFile(__dirname + '/ajmaxc.js', 'utf8', function(err, data) {
          if (err) {
            console.log(err);
          }
          res.writeHead(200, { 'Content-Type':'text/javascript' } );
          res.end(data);
        });
      } else {
        var ctx = new Context(req, res, url);
        this.emit(result[1], ctx);
        if (!ctx._handled) {
          res.writeHead(400, { 'content-type':'application/json' });
          res.end(JSON.stringify({ error:'invalid event:' + result[1] }));
        }
      }
      ret = true;
    }
    return ret;
  };

  exports.createServer = function(options) {
    return new Server(options);
  };

})(typeof module != 'undefined' ? module : null);
