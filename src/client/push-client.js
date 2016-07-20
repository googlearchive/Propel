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

const supported = function() {
  return 'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window &&
    'showNotification' in ServiceWorkerRegistration.prototype;
};

const dispatchRegistrationToken = function() {
  if (this._callbacks.onRegistrationToken && this._subscription) {
    this._callbacks.onRegistrationToken(this._subscription);
  }
};

const subscribeForPush = function() {
  if (!supported()) {
    return Promise.reject(new Error('Your browser does not meet the ' +
      'requirement for this library'));
  }

  return navigator.serviceWorker
  .register(this._swPath, {
    scope: 'propel-v1.0.0'
  })
  .then(registration => {
    // TODO: What happens is user has blocked notifications?
    // TODO What happens if there is already a registration id
    // TODO: Is this the correct place to request permission?

    return registration.pushManager.getSubscription()
    .then(currentSubscription => {
      if (!currentSubscription) {
        return registration.pushManager.subscribe({
          userVisibleOnly: true
        });
      }

      return currentSubscription;
    });
  })
  .then(subscription => {
    // TODO: What to do with subscription?

    this._subscription = subscription;
    dispatchRegistrationToken.bind(this)();
  });
};

export default class PushClient {
  constructor(swPath) {
    // TODO: If the service worker path is changed, should the SDK delete
    // the previous service worker registration?

    if (typeof swPath !== 'string' || swPath.length <= 0) {
      return Promise.reject(new Error('propel.messaging() expects the ' +
        'second parameter to be a string to the path of your service ' +
        'worker file.'));
    }

    this._swPath = swPath;
    this._callbacks = {};

    navigator.serviceWorker.addEventListener('message', event => {
      console.log('Received Message. <-------', event);
    }, false);

    subscribeForPush.bind(this)()
    .catch(err => {
      // TODO: What to do with errors?

      console.error(err);
    });
  }

  onRegistrationToken(cb) {
    this._callbacks.onRegistrationToken = cb;
    dispatchRegistrationToken.bind(this)();
  }
}
