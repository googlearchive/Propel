/*
  Copyright 2016 Google Inc. All Rights Reserved.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

'use strict';

function sendMessage(serviceworker, command, message) {
  // This wraps the message posting/response in a promise, which will resolve if the response doesn't
  // contain an error, and reject with the error if it does. If you'd prefer, it's possible to call
  // controller.postMessage() and set up the onmessage handler independently of a promise, but this is
  // a convenient wrapper.
  return new Promise(function(resolve, reject) {
    var messageChannel = new MessageChannel();
    messageChannel.port1.onmessage = function(event) {
      if (event.data.error) {
        reject(event.data.error);
      } else {
        resolve(event.data);
      }
    };

    // This sends the message data as well as transferring messageChannel.port2 to the service worker.
    // The service worker can then use the transferred port to reply via postMessage(), which
    // will in turn trigger the onmessage handler on messageChannel.port1.
    // See https://html.spec.whatwg.org/multipage/workers.html#dom-worker-postmessage
    serviceworker.postMessage({
      command: command,
      data: message
    }, [messageChannel.port2]);
  });
}

function waitForNotification(registration, attemptNumber, maxAttempts) {
  if (attemptNumber >= maxAttempts) {
    return Promise.reject('Reached max number of attempts');
  }

  return registration.getNotifications()
  .then(notifications => {
    if (notifications.length === 0) {
      return new Promise(resolve => {
        setTimeout(resolve, 500);
      })
      .then(() => {
        return waitForNotification(registration, attemptNumber + 1, maxAttempts);
      });
    }

    return notifications;
  });
}

describe('Test Notification', function() {
  beforeEach(() => {
    return window.goog.swUtils.cleanState();
  });

  it('should have permission to show notifications', function() {
    this.timeout(10000);

    return new Promise((resolve, reject) => {
      Notification.requestPermission(() => {
        if (Notification.permission === 'granted') {
          return resolve();
        }

        reject('Notification permission not granted');
      });
    });
  });

  it('should register sw and test fake push event result in expected notifications', function() {
    this.timeout(10000);

    const notificationValues = [
      {
        title: 'This is a Title',
        body: 'This is the body',
        icon: '/icon.png',
        badge: '/badge.png',
        tag: 'test-tag',
        vibrate: [500, 110, 500, 110, 450, 110, 200, 110, 170, 40, 450, 110, 200, 110, 170, 40, 500],
        click_action: 'https://google.com'
      }, {
        title: 'This is a Title as well',
        body: 'This is the body as well',
        icon: '/test/data/demos/notification-icon.png',
        badge: '/test/data/demos/badge.png'
      }
    ];
    console.log('Adding message listener');
    navigator.serviceWorker.addEventListener('message', event => {
      console.log('Received Message. <-------', event);
    }, false);

    return window.goog.swUtils.activateSW('/test/data/demos/sw.js')
    .then(() => {
      return navigator.serviceWorker.getRegistrations();
    })
    .then(registrations => {
      return registrations[0];
    })
    .then(registration => {
      return notificationValues.reduce((promiseChain, notificationValue) => {
        return promiseChain
        .then(() => {
          return sendMessage(registration.active, 'dummy-push', {
            notification: notificationValue
          });
        })
        .then(() => {
          return waitForNotification(registration, 0, 5);
        })
        .then(notifications => {
          notifications.length.should.equal(1);

          notifications.forEach(notification => {
            if (notificationValue.title) {
              notification.title.should.equal(notificationValue.title);
            }
            if (notificationValue.body) {
              notification.body.should.equal(notificationValue.body);
            }
            if (notificationValue.icon) {
              if (notification.icon.indexOf('http') === 0) {
                notification.icon.should.equal(window.location.origin + notificationValue.icon);
              } else {
                notification.icon.should.equal(notificationValue.icon);
              }
            }
            if (notificationValue.tag) {
              notification.tag.should.equal(notificationValue.tag);
            }
            if (notificationValue.click_action) {
              notification.data.click_action.should.equal(notificationValue.click_action);
            }

            if (notification.vibrate && notification.vibrate.length > 0) {
              (notification.vibrate instanceof Array).should.equal(true);
              for (let i = 0; i < notificationValue.vibrate.length; i++) {
                notificationValue.vibrate[i].should.equal(notification.vibrate[i]);
              }
            }
            if (notification.badge) {
              if (notification.badge.indexOf('http') === 0) {
                notification.badge.should.equal(window.location.origin + notificationValue.badge);
              } else {
                notification.badge.should.equal(notificationValue.badge);
              }
            }

            notification.close();
          });
        });
      }, Promise.resolve());
    });
  });
});
