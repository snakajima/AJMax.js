AJMAX.js
========

AJMax.js is a lightweight micro-framework, which makes easy and straightforward to development one-page Ajax applications.

It has a light-weight HTML-template engine, which performs data-binding on the client side.

It enforces strict MVC model, where Model is JSON-based REST API, View is HTML templates,
and Controller is written in JavaScript or JSON. 

Data-binding instructions are written in JSON and portable across client and server. Iy means you can manipulate DOM on the client side from the server side.

Data-binding Example
--------------------

For example, the following code fetches the JSON data that describes 'me', and binds it with the HTML template named 'hello', and inserts the generated HTML at the location specified by the JQuery selector '#message'.

>  FB.api('/me', { fields:'name' }, function(result) {
>   ctx.exec({ cmd:'html', params:{ data:result, template:'hello', selector:'#message' }});
>  });

If the 'result' is { name:"John Smith" } and the template 'hello' is "<p>Hello, $(.name)!</p>", this instruction will generate

> "<p>Hello, John Smith!</p>"

and set as the innerHTML of the DOM element specified by '#message', which is equivalent to

> $('#message').html("<p>Hello, John Smith!</p>");

Since this instruction is written in JSON, it allows the server to send it to the client and modify the DOM appropriately.

Flexibility
-----------

Because of this symetry (the data binding instruction are portable across server and client) allows maximum flexibility to the developer. It essentially allows three possible architecture. 

1. Server is a pure REST API server (Model), and all controlloing logics (Controller) are written on the client side. 
2. Along with the Model, all controlling logics (Controller) are written on the server side, and the client simply interprets the instructions from the server side, and route appropriate events (such as 'click' events) to the server.
3. Controlling logics that involves data access are written on the server side, but the rest of controlling logics (mostly UI behaviors) are written on the client side. 