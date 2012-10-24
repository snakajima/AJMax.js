$(document).ready(function() {
    
  window.fbAsyncInit = function() {
    // init the FB JS SDK
    FB.init({
      appId      : '432315406833390', // App ID from the App Dashboard
      channelUrl : '//localhost:8000/static/channel.html', // Channel File for x-domain communication
      status     : true, // check the login status upon init?
      cookie     : true, // set sessions cookies to allow your server to access the session?
      xfbml      : true  // parse XFBML tags on this page?
    });

    AJ.html({ selector:'#main', template:'initializing' });

    FB.Event.subscribe('auth.statusChange', function(response) {
        if (response.authResponse) {
          // user has auth'd your app and is logged into Facebook
          AJ.html({ selector:'#main', template:'authenticated' });
          AJ.emit({ event:'load', type:'client', params:response.authResponse });
        } else {
          AJ.html({ selector:'#main', template:'login_required' });
          $('#login').click(function() {
            AJ.html({ selector:'#main', template:'authenticating' });
            FB.login();
          });
        }
    });
  };
  
  AJ.on('load', function(ctx) {
    ctx.deferred();
    FB.api('/me', function(result) {
      ctx.exec([
        { cmd:'html', params:{ data:result, template:'hello', selector:'#message' }},
        { cmd:'html', params:{ template:'loading_friends', selector:'#contents' }},
        { cmd:'emit', params:{ event:'friends', type:'client' }},
      ]);
    });
  }).on('friends', function(ctx) {
    ctx.deferred();
    FB.api('/me/friends', function(result) {
      ctx.exec([
        { cmd:'html', params:{ template:'friends', selector:'#contents' }},
        { cmd:'html', params:{ data:result.data, template:'friend', selector:'#friends',
          bindings:[
            { selector:'.friend', actions:[
              { cmd:'hide', params: { selector:'#contents' } },
              { cmd:'emit', params: { event:'friend_selected', type:'client' } }
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
  
  (function(d) {
      var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
      if (d.getElementById(id)) {return;}
      js = d.createElement('script'); js.id = id; js.async = true;
      js.src = "//connect.facebook.net/en_US/all.js";
      ref.parentNode.insertBefore(js, ref);
  }(document));
});
