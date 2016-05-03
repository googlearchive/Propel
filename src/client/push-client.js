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

const SUPPORTED = 'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window &&
    'showNotification' in ServiceWorkerRegistration.prototype;

const ERROR_MESSAGES = {
  'bad factory': 'The PushClient.createClient() method expects a service ' +
    'worker path and an option scope string.',
  'bad constructor': 'The PushClient constructor expects a service ' +
    'worker registration. Alternatively, you can use ' +
    'PropelClient.createClient() to create a PropelClient with a service ' +
    'worker path string and an optional scope string.',
  'redundant worker': 'Worker became redundant'
};

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
        reject(new Error(ERROR_MESSAGES['redundant worker']));
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
   * @param {ServiceWorkerRegistration} registration - Registration of a
   *  service worker to be used for push messages
   */
  constructor(registration) {
    super();

    if (!PushClient.isSupported()) {
      throw new Error('Your browser does not support the web push API');
    }

    if (!(registration instanceof ServiceWorkerRegistration)) {
      throw new Error(ERROR_MESSAGES['bad constructor']);
    }

    this._registration = registration;

    // It is possible for the subscription to change in between page loads. We
    // should re-send the existing subscription when we initialise (if there is
    // one)
    this._dispatchStatusUpdate();
  }

  _dispatchStatusUpdate() {
    return Promise.all([
      this.getSubscription().catch(() => {
        return null;
      }),
      PushClient.getPermissionState()
    ])
    .then(results => {
      return {
        isSubscribed: (results[0] !== null),
        currentSubscription: results[0],
        permissionState: results[1]
      };
    })
    .then(status => {
      this.dispatchEvent(new PushClientEvent('statuschange', status));
    })
    .catch(err => {
      console.warn('Unable to dispatch a status event ' +
        'getSubscription() failed.', err);
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
  subscribe() {
    // Check for permission
    return this.requestPermission(false)
    .then(permissionStatus => {
      if (permissionStatus !== 'granted') {
        this._dispatchStatusUpdate();
        throw new SubscriptionFailedError(permissionStatus);
      }

      this.dispatchEvent(new PushClientEvent('requestingsubscription'));

      // Make sure we have a service worker and subscribe for push
      return this._registration;
    })
    .then(registrationReady)
    .then(registration => {
      return registration.pushManager.subscribe({userVisibleOnly: true})
      .catch(err => {
        return this._dispatchStatusUpdate()
        .then(() => {
          // This is provide a more helpful message when work with Chrome + GCM
          if (err.message === 'Registration failed - no sender id provided') {
            throw new SubscriptionFailedError('nogcmid');
          } else {
            throw err;
          }
        });
      });
    })
    .then(subscription => {
      this._dispatchStatusUpdate();

      return subscription;
    });
  }

  /**
   * This method will unsubscribe the user from push on the client side.
   *
   * @return {Promise} A Promise that
   *  resolves once the user is unsubscribed.
   */
  unsubscribe() {
    const registration = this.getRegistration();
    if (!registration) {
      return this._dispatchStatusUpdate();
    }

    return registration.pushManager.getSubscription()
    .then(subscription => {
      if (subscription) {
        return subscription.unsubscribe();
      }
    })
    .then(() => {
      this._dispatchStatusUpdate();
    })
    .catch(err => {
      return this._dispatchStatusUpdate()
      .then(() => {
        throw err;
      });
    });
  }

  /**
   * Get the registration of the service worker being used for push.
   *
   * @return {ServiceWorkerRegistration} The ServiceWorkerRegistration used
   * for push messaging.
   */
  getRegistration() {
    return this._registration;
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
  getSubscription() {
    const registration = this.getRegistration();
    if (!registration) {
      return Promise.resolve(null);
    }

    return registration.pushManager.getSubscription();
  }

  /**
   * Will manage requesting permission for push messages, resolving
   * with the final permission status.
   * @param {Boolean} dispatchStatusChange - Optional parameter with a
   * default value of true. If true, a `statuschange` event will be
   * dispatched once the permission state has resolved (i.e. use interacted
   * with the permission dialog).
   * @return {Promise<String>} Permission status of granted, default or denied
   */
  requestPermission(dispatchStatusChange = true) {
    return PushClient.getPermissionState()
    .then(permissionState => {
      // Check if requesting permission will show a prompt
      if (permissionState === 'default') {
        this.dispatchEvent(new PushClientEvent('requestingpermission'));
      }

      return new Promise(resolve => Notification.requestPermission(resolve))
      .then(resolvedState => {
        if (dispatchStatusChange) {
          this._dispatchStatusUpdate();
        }
        return resolvedState;
      });
    });
  }

  /**
   * If you want a quick way to create Propel Client this factory method
   * just takes a service worker file path and optional scope and
   * returns promise that resolves to a PropelClient or errors if there
   * was a problem.
   * @param {String} swPath - This needs to be the path of a service worker
   * that will be used to handle push messages,
   * @param {String} scope - Optional parameter that can be used to define
   * the scope of a service worker.
   * @return {Promise<PropelClient>} Resolves if the service worker could be
   * registered successfully
   */
  static createClient(swPath, scope) {
    if (!swPath || typeof swPath !== 'string' || swPath.length === 0) {
      return Promise.reject(new Error(ERROR_MESSAGES['bad factory']));
    }

    let options;
    if (scope) {
      options = {scope};
    }
    return navigator.serviceWorker.register(swPath, options)
    .then(reg => {
      return new PushClient(reg);
    });
  }

  /**
   * You can use this to decide whether to construct a new PushClient or not.
   * @return {Boolean} Whether the current browser has everything needed
   *  to use push messaging.
   */
  static isSupported() {
    return SUPPORTED;
  }

  /**
   * This method can be used to check if subscribing the user will display
   * the permission dialog or not.
   * @return {Promise<PermissionStatus>} PermistionStatus will be
   * 'granted', 'denied' or 'default' to reflect the current permission state
   */
  static getPermissionState() {
    return new Promise(resolve => {
      resolve(Notification.permission);
    });
  }
}
