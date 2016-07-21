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

// Service worker must be active before a user can be subscribed
const registrationReady = function(registration) {
  if (registration.active) {
    return Promise.resolve(registration);
  }

  let serviceWorker = registration.installing || registration.waiting;

  return new Promise(function(resolve, reject) {
    // Because the Promise function is called on next tick there is a
    // small chance that the worker became active already.
    if (serviceWorker.state === 'activated') {
      resolve(registration);
      return;
    }

    let stateChangeListener = function() {
      if (serviceWorker.state === 'activated') {
        resolve(registration);
      } else if (serviceWorker.state === 'redundant') {
        reject(new Error('Registration has a redundant service worker.'));
      } else {
        return;
      }
      serviceWorker.removeEventListener('statechange', stateChangeListener);
    };
    serviceWorker.addEventListener('statechange', stateChangeListener);
  });
};

const subscribeForPush = function() {
  // TODO: What happens if the browser doesn't support the APIS
  // required for this library
  if (!supported()) {
    return Promise.reject(new Error('Your browser does not meet the ' +
      'requirement for this library'));
  }

  return navigator.serviceWorker
  .register(this._swPath, {
    scope: 'propel-v1.0.0'
  })
  .catch(() => {
    throw new Error('Unable to register service worker');
  })
  .then(registration => {
    return registrationReady(registration);
  })
  .then(registration => {
    // TODO: What happens is user has blocked notifications?
    // TODO: Is this the correct place to request permission?

    return registration.pushManager.getSubscription()
    .then(currentSubscription => {
      if (!currentSubscription) {
        return registration.pushManager.subscribe({
          userVisibleOnly: true
        })
        .catch(err => {
          throw new Error(`Unable to subscribe user for push messages.` +
            ` [${err.message}]`);
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

const dispatchError = function(error) {
  if (this._callbacks.onError) {
    this._callbacks.onError(error);
  }
};

const dispatchMessage = function(msg) {
  if (this._callbacks.onMessage) {
    this._callbacks.onMessage(msg);
  }
};

export default class PushClient {
  constructor(swPath) {
    // TODO: If the service worker path is changed, should the SDK delete
    // the previous service worker registration?

    if (typeof swPath !== 'string' || swPath.length <= 0) {
      throw new Error('propel.messaging() expects the ' +
        'first parameter to be a string to the path of your service ' +
        'worker file.');
    }

    this._swPath = swPath;
    this._callbacks = {};

    navigator.serviceWorker.addEventListener('message', event => {
      switch (event.data.propelcmd) {
        case 'propel-message':
          dispatchMessage.bind(this)(event.data.data);
          break;
        default:
          // Noop.
          console.warn('Unknown message received from service worker', event);
          break;
      }
    }, false);

    subscribeForPush.bind(this)()
    .catch(err => {
      dispatchError.bind(this)(err);
    });
  }

  onRegistrationToken(cb) {
    this._callbacks.onRegistrationToken = cb;
    dispatchRegistrationToken.bind(this)();
  }

  onError(cb) {
    this._callbacks.onError = cb;
  }

  onMessage(cb) {
    this._callbacks.onMessage = cb;
  }
}
