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
import PushClientEvent from './push-client-event';
import EventDispatch from './event-dispatch';

// document.currentScript is not supported in all browsers, but it IS supported
// in all browsers that support Push.
// TODO(mscales): Ensure that this script will not cause errors in unsupported
// browsers.
let currentScript = document.currentScript.src;

// Make the dummy service worker scope be relative to the library script. This
// means that you can have multiple projects hosted on the same origin without
// them interfering with each other, as long as they each use a different URL
// for the script.
const SCOPE = new URL('./goog.push.scope/', currentScript).href;
const WORKER_URL = new URL('./worker.js', currentScript).href;
const SUPPORTED = 'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window &&
    'permissions' in navigator &&
    'showNotification' in ServiceWorkerRegistration.prototype;

const registrationReady = function(registration) {
  if (registration.active) {
    return Promise.resolve(registration.active);
  }

  let serviceWorker = registration.installing || registration.waiting;

  return new Promise(function(resolve, reject) {
    // Because the Promise function is called on next tick there is a
    // small chance that the worker became active already.
    if (serviceWorker.state === 'activated') {
      resolve(serviceWorker);
      return;
    }

    let stateChangeListener = function() {
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
export default class PushClient extends EventDispatch {
  /**
   * Constructs a new PushClient.
   *
   * If the current browser has a push subscription then it will be
   * obtained in the constructor and a subscriptionChange event will be
   * dispatched.
   *
   * @param {Object} options - Options object should be included if you
   *  want to define any of the following.
   * @param {String} options.workerUrl - Service worker URL to be
   *  registered that will receive push events.
   * @param {String} options.scope - The scope that the Service worker should be
   *  registered with.
   */
  constructor(options) {
    super();

    if (!PushClient.supported()) {
      throw new Error('Your browser does not support the web push API');
    }

    if (options) {
      if (options instanceof ServiceWorkerRegistration) {
        const serviceWorker = options.installing ||
          options.waiting ||
          options.active;
        this._workerUrl = serviceWorker.scriptURL;
        this._scope = options.scope;
      } else if (options instanceof Object) {
        this._workerUrl = options.workerUrl || WORKER_URL;
        this._scope = options.scope || SCOPE;
      } else {
        throw new Error('Invalid input into Client constructor.');
      }
    } else {
      this._workerUrl = WORKER_URL;
      this._scope = SCOPE;
    }

    // It is possible for the subscription to change in between page loads. We
    // should re-send the existing subscription when we initialise (if there is
    // one)
    this._dispatchStatusUpdate();
  }

  _dispatchStatusUpdate() {
    return Promise.all([
      this.getSubscription(),
      PushClient.getPermissionState()
    ])
    .then(results => {
      return {
        isSubscribed: (results[0] !== null),
        currentSubscription: results[0],
        permissionStatus: results[1].state
      };
    })
    .then(status => {
      this.dispatchEvent(new PushClientEvent('statuschange', status));
    });
  }

  /**
   * This method will subscribe a use for push messaging.
   *
   * If permission isn't granted for push, this method will show the
   * permissions dialog before attempting to subscribe the user to push.
   *
   * @return {Promise<PushSubscription>} A Promise that
   *  resolves with a PushSubscription if successful.
   */
  async subscribe() {
    // Check for permission
    const permissionStatus = await this.requestPermission();

    if (permissionStatus !== 'granted') {
      this._dispatchStatusUpdate();

      throw new SubscriptionFailedError(permissionStatus);
    }

    this.dispatchEvent(new PushClientEvent('requestingsubscription'));

    // Make sure we have a service worker and subscribe for push
    let reg = await navigator.serviceWorker.register(this._workerUrl, {
      scope: this._scope
    });

    await registrationReady(reg);

    let sub = await reg.pushManager.subscribe({userVisibleOnly: true})
    .catch(err => {
      this._dispatchStatusUpdate()
      .then(() => {
        // This is provide a more helpful message when work with Chrome + GCM
        if (err.message === 'Registration failed - no sender id provided') {
          throw new SubscriptionFailedError('nogcmid');
        } else {
          throw err;
        }
      });
    });

    this._dispatchStatusUpdate();

    return sub;
  }

  /**
   * This method will unsubscribe the user from push on the client side.
   *
   * @return {Promise} A Promise that
   *  resolves once the user is unsubscribed.
   */
  async unsubscribe() {
    let registration = await this.getRegistration();
    let subscription;
    let unsubscribePromise = Promise.resolve();

    if (registration) {
      subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        unsubscribePromise = await subscription.unsubscribe();
      }
    }

    this._dispatchStatusUpdate();

    return unsubscribePromise;
  }

  /**
   * Get the registration of the service worker being used for push.
   *
   * @return {Promise<ServiceWorkerRegistration>} A Promise that
   *  resolves to either a ServiceWorkerRegistration or to null if none.
   */
  async getRegistration() {
    let reg = await navigator.serviceWorker.getRegistration(this._scope);

    if (reg && reg.scope === this._scope) {
      return reg;
    }
  }

  /**
   * If the user is currently subscribed for push then the returned promise will
   * resolve with a PushSubscription object, otherwise it will resolve to null.
   *
   * This will not display the permission dialog.
   *
   * @return {Promise<PushSubscription>} A Promise that resolves with
   *  a PushSubscription or null.
   */
  async getSubscription() {
    let registration = await this.getRegistration();

    if (!registration) {
      return null;
    }

    return registration.pushManager.getSubscription();
  }

  /**
   * Will manage requesting permission for push messages, resolving
   * with the final permission status.
   * @return {Promise<String>} Permission status of granted, default or denied
   */
  async requestPermission() {
    return navigator.permissions.query({name: 'push', userVisibleOnly: true})
    .then(permissionState => {
      // Check if requesting permission will show a prompt
      if (permissionState.state === 'prompt') {
        this.dispatchEvent(new PushClientEvent('requestingpermission'));
      }

      return new Promise(resolve => Notification.requestPermission(resolve));
    });
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
   * @return {Boolean} 'true' if you have permission to subscribe
   *  the user for push messages.
   */
  static getPermissionState() {
    return navigator.permissions.query({name: 'push', userVisibleOnly: true});
  }
}
