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
  this.response.writeHead(200, { 'content-type':'application/json' });
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
  if (result = RegExp('^\/event\/([a-zA-Z0-9\s\._-]+)$').exec(url.pathname)) {
    console.log('event: ', result[1]);
    var ctx = new Context(req, res, url);
    this.emit(result[1], ctx);
    if (!ctx._handled) {
      res.writeHead(400, { 'content-type':'application/json' });
      res.end(JSON.stringify({ error:'invalid event:' + result[1] }));
    }
    ret = true;
  }
  return ret;
};

exports.Server = Server;

exports.createServer = function(options) {
  return new Server(options);
};
