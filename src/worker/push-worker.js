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
/* eslint-env browser, serviceworker */

/**
 * PushWorker is a front end library that simplifies adding push to your
 * site.
 */
export default class PushWorker {
  constructor() {
    self.addEventListener('push', this._onPushReceived.bind(this));
    self.addEventListener('pushsubscriptionchange',
      this._onSubscriptionChange.bind(this));

    // TODO: If subscriptionlost event is created should implement that as well
  }

  _isClientFocused() {
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
  }

  _onPushReceived(event) {
    // TODO: Check if window in clients is for this origin and focused
    const notificationPromiseChain = this._isClientFocused()
    .then(focusedClient => {
      if (focusedClient === false) {
        return this._showNotification(event);
      }

      console.log('Sending message to client', focusedClient);
      focusedClient.postMessage('test', []);
    })
    .catch(err => {
      // TODO: Offer developer ability to handle this (i.e. onMessage)
      console.error(err);
    });

    event.waitUntil(notificationPromiseChain);
  }

  _showNotification(event) {
    return Promise.resolve()
    .then(() => {
      if (!event.data) {
        throw new Error('No data sent with message');
      }

      return event.data.json();
    })
    .then(data => {
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
  }

  _onSubscriptionChange() {
    // TODO: Current behaviour mixed with upcoming behaviour changes.
    // Manage resubscribing
    // Manage Updating backend
  }
}
