# Adding Propel to Your Web App

There are two options for adding Propel to your Web App.

The simplest approach is to use the pre-built versions of Propel which are
minified and transpiled.

If you have a build process to work with ES2015 JavaScrtipt you might
want to try using the Propel source by importing the library.

## Use Pre-Built

Each release of Propel will come with transpiled and minified builds of the
scripts which you can add to your web app like so:

```html
<script src="/node_modules/propel-web-push/dist/propel-client.js"></script>
```

## Use Source

To use the source import the PropelClient in your JavaScriptlike so:

```javascript
import PropelClient from '/node_modules/propel-web-push/src/client/push-client';

// Make use of PropelClient as usual - See next section
```

# PropelClient Constructor

There are two ways to construct a PropelClient:

1. Pass in the path of a service worker file. Propel will register
the service worker and use it for push notifications.

1. If an existing service worker is registered, that can be used for
push notifications by passing the registration into the
constructor of PropelClient.

Below is an example of these approaches.

## Service Worker File

The simplest way to use Propel in your web app is to pass in the path
to your service worker like so:

```javascript
var PropelClient = window.goog.propel.PropelClient;

// Check if push is supported by the current browsers
if (PropelClient.supported()) {
  // Initialise Push Client
  var propelClient = new PropelClient('/sw.js');

  // TODO: Use propelClient
}
```

If you want to create a service worker file specifically for push notifications
you can pass in a scope variable to restrict it's use.

```javascript
var propelClient = new PropelClient('/push-sw.js', '/.goog.propel.sw/');
```

If you aren't sure how the scope affects a service worker then [check out
MDN's docs on Registering a service worker](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers#Registering_your_worker).

## Use an Existing Registration

To use an existing service worker registration, just pass it into the
constructor of PropelClient.

```javascript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
  .then(function(reg) {
    if (PropelClient.supported()) {
      var propelClient = new PropelClient(reg);

      // TODO: Use propelClient
    }
  })
  .catch(function(error) {
    // registration failed
    console.log('Registration failed with ' + error);
  });
};
```
