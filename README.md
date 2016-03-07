# Propel

[![Build Status](https://travis-ci.org/GoogleChrome/Propel.svg?branch=master)](https://travis-ci.org/GoogleChrome/Propel)

> A library to support developers implementing Web Push notifications

## Getting Started

To use the Propel library do the following:

1. Put the `client.js` file on your server.
2. Add `client.js` to your web page.
3. Use the `Client` object in your javscript.

        var PropelClient = window.goog.propel.Client;

        // Check if push is supported by the current browsers
        if (PropelClient.supported()) {
          // Initialise Push Client
          var propelClient = new PropelClient();
          propelClient.addEventListener('statuschange', function(event) {
            if (event.permissionStatus === 'denied') {
              // Disable UI
            } else if (event.currentSubscription){
              // Enable UI
              // Show that user is subscribed

              // Send the subscription object to your server
              fetch('/your-backend-api', {
                method: 'post',
                headers: new Headers().append('Content-Type', 'application/json'),
                body: JSON.stringify(currentSubscription)
              });
            } else {
              // Enable UI
              // Show that user is not subscribed
            }
          });

          propelClient.subscribe();
          // OR
          propelClient.unsubscribe();
        }
4. Check out the [docs to learn more](http://googlechrome.github.io/Propel/).

## Support

If you’ve found an error in this library, please file an issue: https://github.com/GoogleChrome/Propel/issues

Patches are encouraged, and may be submitted by forking this project and submitting a pull request through GitHub.

## License

Copyright 2015 Google, Inc.

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
