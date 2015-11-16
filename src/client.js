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
/* eslint-env browser */

import SubscriptionFailedError from './client/subscription-failed-error';

// document.currentScript is not supported in all browsers, but it IS supported
// in all browsers that support Push.
// TODO(mscales): Ensure that this script will not cause errors in unsupported
// browsers.
let currentScript = document.currentScript.src;

const SUPPORTED = 'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window &&
    'showNotification' in ServiceWorkerRegistration.prototype;
// Make the dummy service worker scope be relative to the library script. This
// means that you can have multiple projects hosted on the same origin without
// them interfering with each other, as long as they each use a different URL
// for the script.
const SCOPE = new URL('./goog.push.scope/', currentScript).href;
const WORKER_URL = new URL('./worker.js', currentScript).href;

let requestPermission = function() {
  return new Promise(resolve => Notification.requestPermission(resolve));
};

let messageHandler = (event) => {};

let registrationReady = function(registration) {
  if (registration.active) {
    return Promise.resolve(registration.active);
  }

  let serviceWorker = registration.installing || registration.waiting;

  return new Promise(function(resolve, reject) {
    // Because the Promise function is called on next tick there is a
    // small chance that the worker became active already.
    if (serviceWorker.state === 'activated') {
      resolve(serviceWorker);
    }
    let stateChangeListener = function(event) {
      if (serviceWorker.state === 'activated') {
        resolve(serviceWorker);
      } else if (serviceWorker.state === 'redundant') {
        reject(new Error('Worker became redundant'));
      } else {
        return;
      }
      serviceWorker.removeEventListener('statechange', stateChangeListener);
    };
    serviceWorker.addEventListener('statechange', stateChangeListener);
  });
};

let getRegistration = async function() {
  let reg = await navigator.serviceWorker.getRegistration(SCOPE);

  if (reg.scope === SCOPE) {
    return reg;
  }
};

let pushClient = {
  async subscribe({workerUrl=WORKER_URL, endpoint=null} = {}) {
    // Check for support
    if (!this.supported()) {
      throw new SubscriptionFailedError('not supported');
    }

    // Check for permission
    let permission = await requestPermission();

    if (permission === 'denied') {
      throw new SubscriptionFailedError('denied');
    } else if (permission === 'default') {
      throw new SubscriptionFailedError('dismissed');
    }

    // Install service worker and subscribe for push
    let reg = await navigator.serviceWorker.register(workerUrl, {scope: SCOPE});
    await registrationReady(reg);
    let sub = await reg.pushManager.subscribe({userVisibleOnly: true});

    // Set up message listener for SW comms
    navigator.serviceWorker.addEventListener('message', messageHandler);

    if (endpoint) {
      // POST subscription details
      await fetch(endpoint, {
        method: 'post',
        body: JSON.stringify({
          action: 'subscribe',
          subscription: sub
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    return sub;
  },

  async unsubscribe({endpoint=null} = {}) {
    if (!this.supported()) {
      return;
    }

    let registration = await getRegistration();

    if (!registration) {
      return;
    }

    let subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();

      if (endpoint) {
        // POST subscription details
        await fetch(endpoint, {
          method: 'post',
          body: JSON.stringify({
            action: 'unsubscribe',
            subscription: subscription
          }),
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }
    }

    await registration.unregister();

    navigator.serviceWorker.removeEventListener('message', messageHandler);
  },

  async getSubscription() {
    if (!this.supported()) {
      return;
    }

    let registration = await getRegistration();

    if (!registration) {
      return;
    }

    return await registration.pushManager.getSubscription();
  },

  supported() {
    return SUPPORTED;
  },

  hasPermission() {
    return Notification.permission === 'granted';
  }
};

window.goog = window.goog || {};
window.goog.push = window.goog.push || {};
window.goog.push.client = pushClient;
