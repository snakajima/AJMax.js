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

var AJ = (function() {
  var _template = {}; // templates
  var _compiled = {}; // compiled templates (cache)
  var _listners = {};
  var _extension = {};

  function _escape(text) {
    return text.replace(/&/g, '&amp;')
               .replace(/'/g, '&#146;') //'
               .replace(/</g, '&lt;')
               .replace(/>/g, '&gt;')
               .replace(/\n/g, '<br />');
  };
  
  function _get_template_function(key) {
    if (!_compiled[key]) {
      var t = _template[key];
      if ($.isArray(t)) {
        t = t.join('');
      }
      var _script =  '"' + t.replace(/\"/g, "'")
                        .replace(/[\r\n]/g, " ")
                        .replace(/{{$index}}/g, '"+index+"')
                        .replace(/{{{([a-z0-9_\.]*)}}}/gi, '"+row.$1+"')
                        .replace(/{{([a-z0-9_\.]*)}}/gi, '"+_escape(""+row.$1)+"')
                        +'"';
      eval("_compiled[key] = function(row, index) { return (" + _script + "); };");
    }
    return _compiled[key];
  };
  
  function _bind_data(params) {
    var ret = '';
    if (typeof params.data == 'undefined') {
      ret = _template[params.template];
      if ($.isArray(ret)) {
        ret = ret.join('');
        _template[params.template] = ret;
      }
    } else {
      var apply = _get_template_function(params.template);
      if ($.isArray(params.data)) {
        var rowset = [];
        for (var i in params.data) {
          rowset.push(apply(params.data[i], i));
        }
        ret = rowset.join('');
      } else {
        ret = apply(params.data);
      }
    }
    return ret;
  }
  
  function _process_action(action, id) {
    if (action.cmd) {
      if (id) {
        if (action.params.params) {
          action.params.params.id = id;
        } else {
          action.params.params = { id: id };
        }
      }
      if (typeof _dispatch[action.cmd] == 'function') {
        _dispatch[action.cmd](action.params);
      } else if (typeof _extension[action.cmd] == 'function') {
        _extension[action.cmd](action.params);
      }
    }
  }
  
  function _process_payload(payload, id) {
    if ($.isArray(payload)) {
      for (i in payload) {
        _process_action(payload[i], id);
      }
    } else {
      _process_action(payload, id);
    }
  };
    
  function Context(params) {
    this.params = params;
  };
  
  Context.prototype.exec = function(actions) {
    _process_payload(actions);
  };
  
  Context.prototype.deferred = function() {
    // no-op on the client side
  };
  
  var _dispatch = {
    template: function(params) {
      $.getJSON(params.url, {}, function(data) {
        $.extend(_template, data);
        _dispatch.emit(params);
      });
    },
    html: function(params) {
      var $element = $(params.selector);
      $element.html(_bind_data(params));
      if (params.bindings) {
        for (var i in params.bindings) {
          var item = params.bindings[i];
          $(item.selector, $element).bind(item.on ? item.on : 'click', function() {
            _process_payload(item.actions, this.id);
            return false;
          });
        }
      }
    },
    emit: function(params) {
      if (params.target == 'client') {
        _listners[params.event](new Context(params.params));
      } else {
        var url = '/event/'+params.event;
        $.getJSON(url, params.params, function(data) {
          _process_payload(data);
        });
      }
    },
    alert: function(params) {
      setTimeout(function() {
        alert(_bind_data(params));
      }, 100);
    },
    open: function(params) {
      window.location.href = params.url;
    }
  };

  return {
    context: function(params) {
      return new Context(params);
    },
    on: function(event, callback) {
      _listners[event] = callback;
      return this;
    },
    extend: function(extension) {
      $.extend(_extension, extension);
    }
  }; // end of "return"
})(); // end of "var ajmax="
