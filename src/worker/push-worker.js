/*
  Copyright 2015 Google Inc. All Rights Reserved.
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

/* eslint-env serviceworker */

const isClientFocused = function() {
  return clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  })
  .then(clientList => {
    let focusedClient = null;
    for (var i = 0; i < clientList.length; i++) {
      const client = clientList[i];
      if (client.focused) {
        focusedClient = client;
      }
    }

    if (focusedClient) {
      return focusedClient;
    }

    return false;
  });
};

const attemptToMessageClient = function(client, msgData) {
  return new Promise(resolve => {
    client.postMessage(msgData);

    resolve(true);
  });
};

const showNotification = function(data) {
  if (!data) {
    return Promise.reject(new Error('No data sent with message'));
  }

  return Promise.resolve()
  .then(() => {
    if (!data.notification) {
      throw new Error('No notification data with message');
    }

    const notificationData = {
      body: data.notification.body,
      icon: data.notification.icon,
      badge: data.notification.bage,
      tag: data.notification.tag,
      vibrate: data.notification.vibrate
    };

    if (data.notification.click_action) {
      notificationData.data = {
        click_action: data.notification.click_action // eslint-disable-line camelcase
      };
    }

    return self.registration.showNotification(data.notification.title,
      notificationData);
  });
};

const onPushReceived = function(event) {
  const notificationPromiseChain = Promise.resolve()
  .then(() => {
    if (!event.data) {
      return null;
    }

    return event.data.json();
  })
  .then(data => {
    return isClientFocused()
    .then(focusedClient => {
      if (focusedClient === false) {
        return false;
      }

      return attemptToMessageClient(focusedClient, {
        propelcmd: 'propel-message',
        data: data
      });
    })
    .then(pushMessageHandled => {
      if (!pushMessageHandled) {
        return showNotification(data);
      }
    })
    .catch(err => {
      if (this._callbacks.onMessage) {
        this._callbacks.onMessage(data);
      } else {
        console.error('Propel was unable to handle the notification' +
          'data. Define a onMessage callback in the service worker to ' +
          'define a default notification.', err);
      }
    });
  });

  event.waitUntil(notificationPromiseChain);
};

const onSubscriptionChange = function() {
  // TODO: Current behaviour mixed with upcoming behaviour changes.
  // Manage resubscribing
  // Manage Updating backend
};

/**
 * PushWorker is a front end library that simplifies adding push to your
 * site.
 */
export default class PushWorker {
  constructor() {
    this._callbacks = {};

    self.addEventListener('push', onPushReceived.bind(this));
    self.addEventListener('pushsubscriptionchange',
      onSubscriptionChange.bind(this));
  }

  onMessage(cb) {
    this._callbacks.onMessage = cb;
  }
}
