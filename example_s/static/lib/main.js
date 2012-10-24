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
          AJ.emit({ event:'load', params:response.authResponse });
        } else {
          AJ.html({ selector:'#main', template:'login_required' });
          $('#login').click(function() {
            AJ.html({ selector:'#main', template:'authenticating' });
            FB.login();
          });
        }
    });
  };
  
  (function(d) {
      var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
      if (d.getElementById(id)) {return;}
      js = d.createElement('script'); js.id = id; js.async = true;
      js.src = "//connect.facebook.net/en_US/all.js";
      ref.parentNode.insertBefore(js, ref);
  }(document));
});
