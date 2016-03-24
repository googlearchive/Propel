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

const DEFAULT_SCOPE = './';

const SUPPORTED = 'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window &&
    'permissions' in navigator &&
    'showNotification' in ServiceWorkerRegistration.prototype;

const ERROR_MESSAGES = {
  'bad constructor': 'The PushClient constructor expects either service ' +
    'worker registration or the path to a service worker file and an ' +
    'optional scope string.',
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
   * @param {Object} options - Options object should be included if you
   *  want to define any of the following.
   * @param {String} options.workerUrl - Service worker URL to be
   *  registered that will receive push events.
   * @param {String} options.scope - The scope that the Service worker should be
   *  registered with.
   */
  constructor() {
    super();

    if (!PushClient.supported()) {
      throw new Error('Your browser does not support the web push API');
    }

    // Initialise workerurl and scope from arguments
    if (arguments.length === 1) {
      if (arguments[0] instanceof ServiceWorkerRegistration) {
        const serviceWorker = arguments[0].installing ||
          arguments[0].waiting ||
          arguments[0].active;
        this._workerUrl = serviceWorker.scriptURL;
        this._scope = arguments[0].scope;
      } else if (typeof arguments[0] === 'string') {
        this._workerUrl = arguments[0];
        this._scope = DEFAULT_SCOPE;
      }
    } else if (arguments.length === 2) {
      this._workerUrl = arguments[0];
      this._scope = arguments[1];
    }

    // Ensure the worker url and scope are valid
    const validInput = [this._workerUrl, this._scope].reduce(
      (isValid, currentValue) => {
        if (typeof currentValue === 'undefined' ||
          currentValue === null ||
          typeof currentValue !== 'string' ||
          currentValue.length === 0) {
          return false;
        }

        return isValid;
      }, true);

    if (!validInput) {
      throw new Error(ERROR_MESSAGES['bad constructor']);
    }

    // Turn any relative scope into an absolute one, using the page URL as the base
    this._scope = new URL(this._scope, window.location.href).href;

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
        permissionState: results[1].state
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
      return navigator.serviceWorker.register(this._workerUrl, {
        scope: this._scope
      });
    })
    .then(registrationReady)
    .then(registration => {
      return registration.pushManager.subscribe({userVisibleOnly: true})
        .catch(err => {
          // This is provide a more helpful message when work with Chrome + GCM
          if (err.message === 'Registration failed - no sender id provided') {
            throw new SubscriptionFailedError('nogcmid');
          } else {
            throw err;
          }
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
    return this.getRegistration()
    .then(registration => {
      if (registration) {
        return registration.pushManager.getSubscription();
      }
    })
    .then(subscription => {
      if (subscription) {
        return subscription.unsubscribe();
      }
    })
    .then(() => {
      this._dispatchStatusUpdate();
    });
  }

  /**
   * Get the registration of the service worker being used for push.
   *
   * @return {Promise<ServiceWorkerRegistration>} A Promise that
   *  resolves to either a ServiceWorkerRegistration or to null if none.
   */
  getRegistration() {
    return navigator.serviceWorker.getRegistration(this._scope)
    .then(registration => {
      if (registration && registration.scope === this._scope) {
        return registration;
      }

      return null;
    });
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
    return this.getRegistration()
    .then(registration => {
      if (!registration) {
        return null;
      }

      return registration.pushManager.getSubscription();
    });
  }

  /**
   * Will manage requesting permission for push messages, resolving
   * with the final permission status.
   * @return {Promise<String>} Permission status of granted, default or denied
   */
  requestPermission(dispatchStatusChange = true) {
    return PushClient.getPermissionState()
    .then(permissionState => {
      // Check if requesting permission will show a prompt
      if (permissionState.state === 'prompt') {
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
   * @return {Promise<PermissionStatus>} PermistionStatus.state will be
   * 'granted', 'denied' or 'prompt' to reflect the current permission state
   */
  static getPermissionState() {
    return navigator.permissions.query({name: 'push', userVisibleOnly: true});
  }
}
