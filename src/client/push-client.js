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

import SubscriptionFailedError from './subscription-failed-error';
import Endpoint from './endpoint';
import PushClientEvent from './push-client-event';
import EventDispatch from './event-dispatch';

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

export default class PushClient extends EventDispatch {
  constructor({endpointUrl=null, userId=null, workerUrl=WORKER_URL,
      scope=SCOPE} = {}) {
    super();

    if (!PushClient.supported()) {
      throw new Error('Your browser does not support the web push API');
    }

    this.endpoint = endpointUrl ? new Endpoint(endpointUrl) : null;
    this.userId = userId;
    this.workerUrl = workerUrl;
    this.scope = scope;

    // It is possible for the subscription to change in between page loads. We
    // should re-send the existing subscription when we initialise (if there is
    // one)

    // TODO: use requestIdleCallback when available to defer to a time when we
    // are less busy. Need to fallback to something else (rAF?) if rIC is not
    // available.
    this.getSubscription().then(subscription => {
      if (!subscription) {
        this.dispatchEvent(new PushClientEvent('stateChange', {
          'state': PushClient.STATE_UNSUBSCRIBED
        }));
        return;
      }

      this.onSubscriptionUpdate(subscription);
    });
  }

  onSubscriptionUpdate(subscription) {
    if (this.endpoint) {
      this.endpoint.send({
        action: 'subscribe',
        subscription: subscription,
        userId: this.userId
      });
    }

    this.dispatchEvent(new PushClientEvent('subscriptionUpdate', {
      'subscription': subscription
    }));

    this.dispatchEvent(new PushClientEvent('stateChange', {
      'state': PushClient.STATE_SUBSCRIBED
    }));
  }

  async subscribe() {
    // Check for permission
    let permission = await this.requestPermission();

    if (permission === 'denied') {
      this.dispatchEvent(new PushClientEvent('stateChange', {
        'state': PushClient.STATE_PERMISSION_BLOCKED
      }));

      throw new SubscriptionFailedError('denied');
    } else if (permission === 'default') {
      this.dispatchEvent(new PushClientEvent('stateChange', {
        'state': PushClient.STATE_UNSUBSCRIBED
      }));

      throw new SubscriptionFailedError('dismissed');
    }

    // Make sure we have a service worker and subscribe for push
    let reg = await navigator.serviceWorker.register(this.workerUrl, {
      scope: this.scope
    });
    await registrationReady(reg);
    let sub = await reg.pushManager.subscribe({userVisibleOnly: true})
      .catch((err) => {
        this.dispatchEvent(new PushClientEvent('stateChange', {
          'state': PushClient.STATE_UNSUBSCRIBED
        }));

        // This is provide a more helpful message when work with Chrome + GCM
        let errorToThrow = err;
        if (err.message === 'Registration failed - no sender id provided') {
          errorToThrow = new SubscriptionFailedError('nogcmid');
        }
        throw errorToThrow;
      });

    // Set up message listener for SW comms
    navigator.serviceWorker.addEventListener('message', messageHandler);

    this.onSubscriptionUpdate(sub);

    return sub;
  }

  async unsubscribe() {
    let registration = await this.getRegistration();
    let subscription;

    if (registration) {
      subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
      }
    }

    if (this.endpoint) {
      // POST subscription details
      this.endpoint.send({
        action: 'unsubscribe',
        subscription: subscription,
        userId: this.userId
      });
    }
  }

  async getRegistration() {
    let reg = await navigator.serviceWorker.getRegistration(this.scope);

    if (reg && reg.scope === this.scope) {
      return reg;
    }
  }

  async getSubscription() {
    let registration = await this.getRegistration();

    if (!registration) {
      return;
    }

    return registration.pushManager.getSubscription();
  }

  static supported() {
    return SUPPORTED;
  }

  async requestPermission() {
    return new Promise(resolve => Notification.requestPermission(resolve));
  }

  static hasPermission() {
    return Notification.permission === 'granted';
  }

  static get STATE_PERMISSION_BLOCKED() {
    return 'STATE_PERMISSION_BLOCKED';
  }

  static get STATE_UNSUBSCRIBED() {
    return 'STATE_UNSUBSCRIBED';
  }

  static get STATE_SUBSCRIBED() {
    return 'STATE_SUBSCRIBED';
  }
}
