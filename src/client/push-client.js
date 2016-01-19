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

/**
 * PushClient is a front end library that simplifies adding push to your
 * site.
 */
export default class PushClient {
  /**
   * Constructs a new PushClient.
   *
   * If the current browser has a push scription then it will be
   * obtained in the constructor and sent to the endpointUrl if supplied
   * and a subscriptionChange event will be dispatched.
   *
   * @param {Object} [options] - Options object should be included if you
   *  want to define any of the following.
   * @param {String} [options.endpointUrl] - If supplied this endpoint will be
   *  sent a POST request containing the users PushSubscription object.
   * @param {String} [options.userId] - If an endpointUrl is defined the
   *  userId will be passed with the request to that endpoint.
   * @param {String} [options.workerUrl] - Service worker URL to be
   *  registered that will receive push events.
   */
  constructor({endpointUrl=null, userId=null, workerUrl=WORKER_URL,
      scope=SCOPE} = {}) {
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
    if (this.endpoint) {
      // TODO: use requestIdleCallback when available to defer to a time when we
      // are less busy. Need to fallback to something else (rAF?) if rIC is not
      // available.
      this.getSubscription().then(subscription => {
        if (subscription) {
          this.endpoint.send({
            action: 'subscribe',
            subscription: subscription,
            userId: this.userId
          });
        }
      });
    }
  }

  /**
   * This method will subscribe a use for push messaging.
   *
   * If permission isn't granted for push, this method will show the
   * permissions dialog before attempting to subscribe the user to push.
   *
   * If an endpointUrl is supplied to the constructor, this will recieve
   * a subscribe event.
   *
   * @return {Promise<PushSubscription>} Returns a Promise that
   *  resolves with a PushSubscription if successful.
   */
  async subscribe() {
    // Check for permission
    let permission = await requestPermission();

    if (permission === 'denied') {
      throw new SubscriptionFailedError('denied');
    } else if (permission === 'default') {
      throw new SubscriptionFailedError('dismissed');
    }

    // Make sure we have a service worker and subscribe for push
    let reg = await navigator.serviceWorker.register(this.workerUrl, {
      scope: this.scope
    });
    await registrationReady(reg);
    let sub = await reg.pushManager.subscribe({userVisibleOnly: true})
      .catch((err) => {
        // This is provide a more helpful message when work with Chrome + GCM
        var errorToThrow = err;
        if (err.message === 'Registration failed - no sender id provided') {
          errorToThrow = new Error('Registration failed - Please ensure ' +
            'that you have a Web App Manifest and you\'ve included ' +
            'a \"gcm_sender_id\".');
        }
        throw errorToThrow;
      });

    // Set up message listener for SW comms
    navigator.serviceWorker.addEventListener('message', messageHandler);

    if (this.endpoint) {
      // POST subscription details
      this.endpoint.send({
        action: 'subscribe',
        subscription: sub,
        userId: this.userId
      });
    }

    return sub;
  }

  /**
   * This method will unsubscribe the user from push on the client side.
   *
   * If you supplied an endpoint, this method will call it with an
   * unsubscribe event, including the origin subscription object as well
   * as the userId if supplied.
   *
   * @return {Promise} Returns a Promise that
   *  resolves once the user is unsubscribed.
   */
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

  /**
   * If a service worker is registered for push, this method will return a
   * promise that will resolve with the registration for that service worker.
   *
   * If there is no registration null will be the resolved reponse.
   *
   * @return {Promise<ServiceWorkerRegistration>} Returns a Promise that
   *  resolves with a ServiceWorkerRegistration or null.
   */
  async getRegistration() {
    let reg = await navigator.serviceWorker.getRegistration(this.scope);

    if (reg && reg.scope === this.scope) {
      return reg;
    }
  }

  /**
   * If the user is currently subscribed for push then the returned promise will
   * resolve with a PushSubscription object, otherwise it will resolve to null.
   *
   * This will not display the permission dialog.
   *
   * @return {Promise<PushSubscription>} Returns a Promise that resolves with
   *  a PushSubscription or null.
   */
  async getSubscription() {
    let registration = await this.getRegistration();

    if (!registration) {
      return;
    }

    return registration.pushManager.getSubscription();
  }

  /**
   * You can use this to decide whether to construct a new PushClient or not.
   * @return {Boolean} Whether the current browser has everything needed
   *  to use push messaging.
   */
  static supported() {
    return SUPPORTED;
  }

  /**
   * This method can be used to check if subscribing the user will display
   * the permission dialog or not.
   * @return {Boolean} Returns true if you have permission to subscribe
   *  the user for push messages.
   */
  static hasPermission() {
    return Notification.permission === 'granted';
  }
}
