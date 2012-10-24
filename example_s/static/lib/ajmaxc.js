var AJ = (function() {
  var _template = {}; // templates
  var _compiled = {}; // compiled templates (cache)
  var _listners = {};

  function _escape(text) {
    return text.replace(/&/g, '&amp;')
               .replace(/'/g, '&#146;') //'
               .replace(/</g, '&lt;')
               .replace(/>/g, '&gt;')
               .replace(/\n/g, '<br />');
  };
  
  function _get_template_function(key) {
    if (!_compiled[key]) {
      var _script =  '"' + _template[key].replace(/\"/g, "'")
                        .replace(/[\r\n]/g, " ")
                        .replace(/\$\(index\)/g, '"+index+"')
                        .replace(/\$\(\.([a-z0-9_\.]*)\)/gi, '"+_escape(""+row.$1)+"')
                        .replace(/\$\(\_([a-z0-9_\.]*)\)/gi, '"+row.$1+"')
                        +'"';
      eval("_compiled[key] = function(row, index) { return (" + _script + "); };");
    }
    return _compiled[key];
  };
  
  function _bind_data(params) {
    var ret = '';
    if (typeof params.data == 'undefined') {
      ret = _template[params.template];
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
    if (action.cmd && typeof AJ[action.cmd] == 'function') {
      if (id) {
        if (action.params.params) {
          action.params.params.id = id;
        } else {
          action.params.params = { id: id };
        }
      }
      AJ[action.cmd](action.params);
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

  return {
    setTemplate: function(template) {
      _template = template;
    },
    html: function(params) {
      var $element = $(params.selector);
      $element.html(_bind_data(params));
      if (params.bindings) {
        for (var i in params.bindings) {
          var item = params.bindings[i];
          $(item.selector, $element).bind(item.event ? item.event : 'click', function() {
            _process_payload(item.actions, this.id);
            return false;
          });
        }
      }
    },
    emit: function(params) {
      if (params.type == 'client') {
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
    },
    show: function(params) {
      $(params.selector).show();
    },
    hide: function(params) {
      $(params.selector).hide();
    },
    on: function(event, callback) {
      _listners[event] = callback;
      return this;
    },
    _last_item_for_ie6_: '' // no trailing comma
  }; // end of "return"
})(); // end of "var ajmax="
