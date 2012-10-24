AJMax
=====

AJMax is a micro-framework, which simplifies the development of one-page Ajax applications with node.js.

It has a light-weight HTML-template engine, which performs data-binding on the client side very efficiently.

It effectively enforces MVC architecture, where Model is JSON-based REST API, View is HTML templates,
and Controller is written in JavaScript and/or JSON, running either on the client side or the server side.

It allows developers to describe data-binding instructions (and controll behaviors) in JSON (instead of JavaScript), which simplifies the development, and also makes it possible to describe those instructions on the server side and send them to the client to be executed.

Data-binding Instructions (DBI)
-------------------------------

For example, the following code (which runs either on the client side and the server side) fetches the JSON data that describes 'me' using Facebook Graph API, and binds it with the HTML template named 'hello', and inserts the generated HTML at the location specified by the JQuery selector '#message'.

    FB.api('/me', { fields:'name' }, function(data) {
      ctx.exec({ cmd:'html', params:{ data:result, template:'hello', selector:'#message' }});
    });

If the 'data' is { name:"John Smith" } and the template 'hello' is "\<p>Hello, $(.name)!\</p>", this instruction will generate

    "\<p\>Hello, John Smith!\</p\>"

and set it as the innerHTML of the DOM element specified by '#message'. It effectively performs

    $('#message').html("<p>Hello, John Smith!</p>");

Since this instruction is written in JSON (not in JavaScript), it allows the server to send it to the client and modify the DOM remotely (or even describes the behaviors remotely).

It is also possible describe various behaviors in DBI instructions. For example, 

    FB.api('/me/friends', function(result) {
      ctx.exec([
        { cmd:'html', params:{ template:'friends', selector:'#contents' }}, // (1)
        { cmd:'html', params:{ data:result.data, template:'friend', selector:'#friends', // (2)
          bindings:[
            { selector:'.friend', event:'click', actions:[ // (3)
              { cmd:'hide', params: { selector:'#contents' } }, // (4)
              { cmd:'emit', params: { event:'friend_selected', type:'client' } } // (5)
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