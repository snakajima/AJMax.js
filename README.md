AJMAX.js
========

AJMax.js is a micro-framework, which makes easy and straightforward to development one-page Ajax applications.

It has a light-weight HTML-template engine, which performs data-binding on the client side very efficiently.

It enforces strict MVC model, where Model is JSON-based REST API, View is HTML templates,
and Controller is written in JavaScript or JSON, running either on the client side or the server side.

It allows developers to describe data-binding instructions (and controll behaviors) in JSON (instead of JavaScript), which simplifies the development process, and also makes it possible to describe it on the server side and send it to the client.

Data-binding Instructions (DBI)
-------------------------------

For example, the following code fetches the JSON data that describes 'me' using Facebook Graph API, and binds it with the HTML template named 'hello', and inserts the generated HTML at the location specified by the JQuery selector '#message'.

    FB.api('/me', { fields:'name' }, function(data) {
      ctx.exec({ cmd:'html', params:{ data:result, template:'hello', selector:'#message' }});
    });

If the 'data' is { name:"John Smith" } and the template 'hello' is "<p>Hello, $(.name)!</p>", this instruction will generate

    "\<p\>Hello, John Smith!\</p\>"

and set as the innerHTML of the DOM element specified by '#message'>. It effectively performs

    $('#message').html("<p>Hello, John Smith!</p>");

Since this instruction is written in JSON (not in JavaScript), it allows the server to send it to the client and modify the DOM appropriately.

Flexibility
-----------

Because of this symetry (the data binding instruction are portable across server and client) allows maximum flexibility to the developer. It essentially allows three possible architectures.

1. Server is a pure REST API server (Model), and all controlloing logics (Controller) are written on the client side. 
2. Along with the Model, all controlling logics (Controller) are written on the server side, and the client simply interprets the instructions from the server side, and route appropriate events (such as 'click' events) to the server.
3. Controlling logics that involves data access are written on the server side, but the rest of controlling logics (mostly UI behaviors) are written on the client side. 