AJMax
=====

AJMax is a micro-framework, which simplifies the development of one-page Ajax applications with node.js.

It has a light-weight HTML-template engine, which performs data-binding on the client side very efficiently.

It effectively enforces MVC architecture, where Model is JSON-based REST API, View is HTML templates,
and Controller is written in JavaScript and/or JSON, running either on the client side or the server side (or both).

It allows developers to describe data-binding instructions (and controll behaviors) in JSON instead of JavaScriptz, which simplifies the development, and also makes it possible to describe those instructions on the server side and send them to the client to be executed (remote data-binding and DOM manipulation).

Data-binding Instructions (DBI)
-------------------------------

For example, the following code (which runs either on the client side or the server side) fetches the JSON data that describes 'me' using Facebook Graph API, and binds it with the HTML template named 'hello', and inserts the generated HTML at the location specified by the JQuery selector '#message'.

    FB.api('/me', { fields:'name' }, function(data) {
      ctx.exec({ cmd:'html', params:{ data:result, template:'hello', selector:'#message' }});
    });

If the 'data' is { name:"John Smith" } and the template 'hello' is "\<p>Hello, {{name}}!\</p>", this instruction will generate

    "<p>Hello, John Smith!</p>"

and set it as the innerHTML of the DOM element specified by '#message'. It effectively performs

    $('#message').html("<p>Hello, John Smith!</p>");

Since this instruction is written in JSON (not in JavaScript), it allows the server to send it to the client and modify the DOM remotely (or even describes the behaviors remotely).

Description of various behaviors in DBI is also possible. For example, 

    FB.api('/me/friends', function(result) {
      ctx.exec([
        { cmd:'html', params:{ template:'friends', selector:'#contents' }}, // (1)
        { cmd:'html', params:{ data:result.data, template:'friend', selector:'#friends', // (2)
          bindings:[
            { selector:'.friend', on:'click', actions:[ // (3)
              { cmd:'hide', params: { selector:'#contents' } }, // (4)
              { cmd:'emit', params: { event:'friend_selected', target:'client' } } // (5)
            ]}
          ]}
        }
      ]);
    });

will fetch the list of Facebook friends of the current user, then perform following actions.

1. insert the HTML template named 'friends' at the DOM element specified by the selector '#contents' (no data binding)
2. bind the list of friends (result.data) with the HTML template named 'friend', and insert it at the DOM element specified by the selector '#friends'
3. then, find all the DOM element specified by the selector '.friends', and bind the 'click' event with actions described in (4) and (5)
4. hide the DOM element specified by the selector '#contents' (executed as the result of 'click' event)
5. emit the event 'friend_selected' to the client-side of JavaScript (execute as the result of 'click' event)

Flexibility
-----------

Because of this symmetry (the data binding instruction are portable across server and client) gives maximum flexibility to the developer. It enables three variation of MVC architectures.

1. Server is a pure REST API server (Model), and all controlloing logics (Controller) are written on the client side. 
2. Along with the REST API (Model), all the controlling logics (Controller) are described on the server side, and the client simply interprets those instructions sent from the server side, and route appropriate events (such as 'click' events) back to the server.
3. Controlling logics that involves data access are written on the server side, but the rest of controlling logics (mostly pure UI behaviors) are written on the client side. 

Template Mechanism
------------------

Template is a JSON object, which is a dictionary of HTML-templates. For example, 

    {
      morning: "<p>Good morning, {{name}}!</p>",
      evening: "<p>Good evening, {{name}}!</p>"
    }
    
has two templates, "morning" and "evening". 

The template machanism has only three rules.

1. {{foo}} will be replaced by the value of property "foo" (escaped)
2. {{{foo}}} will be replaced by the value of property "foo" (unescaped)
3. {{$index}} will be replaced by the index of the row (when the data object is an array)

When a template is applied to an array of objects, the template will be applied to each object in the array and the results wil be concatinated.

The templates needs to be specified by calling AJ.setTemplate() method on the client side (this may change in the later release). 

API (client side)
-----------------

When ajmaxc.js is loaded, it create a AJMax object on the global variable AJ. It has only three methods:

1. setTemplate(object) - specifies the set of templates
2. on(event, callback) - specify the event listner (callback function receives a Context object as the only parameter)
3. context() - create a new Context object

Context object has one method and a property. 

1. exec(dbi) - execute the data-bind istruction(s)
2. params - parameters to the event

API (server side)
-----------------

The node module ajmax has one exported method

1. createServer() - it creates a Server object and returns it

The Server object has only one method

1. serve(request, response) - checks if the request is a AJMax event and emits it if necessary and return true. Otherwise it returns false. 

The Server object is an EventEmitter and emit events (application specific). 

DBI syntax
----------

DBI is either an DBI object or an array of DBI objects.

DBI object must have 'cmd' property and 'params' property.

The value of 'cmd' property (command) must be one of 'html', 'emit', 'hide', 'show', 'alert' (this is not extensible at this point, but may change later). 

The meaning of 'params' property depends on the command.

    'html' -- data-bind the data object with the specified view template and insert it at the specified DOM element
      'data': data object to be bound with the specified template (optional)
      'template': the name of template (required)
      'selector': jQuery selector (required)
      'bindings': UI binding instructions (optional)

    'emit' -- emit an event
      'event': name of the event (required)
      'target': 'client' or 'server' (optional, the default is 'server')
      'params': event parameters (optional)
      
    'show', 'hide' -- show/hide the specified DOM element(s)
      'selector': jQuery selector (required)
      
    'alert' - display the browser alert
      'data': data object to be bound with the specified template (optional)
      'template': the name of template (required)

UI-Binding instructions (optional property of 'html' command) allows the application to bind DBI instructions to UI events. It is an array of UI-binding instructions (UBI). UBI has following properties.

    'selector': specifies the JQuery selector (required)
    'on': specifies the event (optional, the default is 'click')
    'actions' : specifies DBIs to be executed when the specified event happens (required)
    


