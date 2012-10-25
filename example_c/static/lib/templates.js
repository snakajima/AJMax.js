AJ.setTemplate({
  "initializing":
    "<h1>Initializing...</h1>",
  "login_required": [
    "<h1>Authentication is required</h1>",
    "<p><input id='login' type='button' value='Login' /></p>" ],
  "authenticating": [
    "<h1>Authenticating</h1>",
    "<p>accessing the server...</p>"],
  "authenticated": [
    "<h1 id='message'>Authenticated</h1>",
    "<div id='contents'>contacting Facebook server...</div>"],
  "loading_friends":
    "<p>fetching friend list...</p>",

  "morning": "Good morning, {{name}}!",
  "evening": "Good evening, {{name}}!",
  "hello": "Hello, {{name}}!",

  "friends":
    "<ul id='friends'></ul>",
  "friend":[
    "<li>",
    "  <img style='width:24px' src='http://graph.facebook.com/{{id}}/picture'>",
    "  <a class='friend' id='{{id}}' href='#'>",
    "  <span style='padding:2px'>{{name}}</span>",
    "  </a>",
    "</li>"]
});
