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

/* eslint-disable quote-props */
const ERROR_MESSAGES = {
  'bad_sw_reg': 'fcm.initialize() expects the second parameter to be a ' +
    'service worker registration.',
  'bad_fcm_server_key': 'fcm.initialize() requires an FCM server key as the ' +
    'first parameter.'
};
/* eslint-enable quote-prop */

const currentScript = document.currentScript;

/**
 * PushClient is a front end library that simplifies adding push to your
 * site.
 */
export default class PushClient {
  /**
   * [initialise description]
   * @param  {String} fcmServerKey   The FCM Server Key (ADD DOCS LINK)
   * @param  {ServiceWorkerRegistration} [swRegistration] Registration for a
   *   service worker to use for push. If not defined FCM will register a
   *   predefined service worker that will work with Firebase Notifications.
   * @return {Promise}                Resolves when FCM is initialized.
   */
  initialize(fcmServerKey, swRegistration) {
    if (!this.supported) {
      return Promise.reject(new Error('Your browser does not support the ' +
        'web push API'));
    }

    if (typeof fcmServerKey !== 'string' || fcmServerKey.length <= 0) {
      return Promise.reject(new Error(ERROR_MESSAGES.bad_fcm_server_key));
    }

    if (typeof swRegistration === 'undefined' || swRegistration === null) {
      // Register our own SW. We should use document.currentScript, but Babels
      // polyfill breaks it.
      return navigator.serviceWorker.register(currentScript.src, {
        scope: '/propel-v1.0.0/'
      })
      .then(registration => {
        this._registration = registration;
      });
    }

    if (!(swRegistration instanceof ServiceWorkerRegistration)) {
      return Promise.reject(new Error(ERROR_MESSAGES.bad_sw_reg));
    }

    this._registration = swRegistration;

    return Promise.resolve();
  }

  /**
   * Before calling initialise, check that the current browser supports
   * everything thats required by the library.
   * @return {Boolean} Whether the current browser has everything needed
   *  to use push messaging.
   */
  get supported() {
    return 'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window &&
      'showNotification' in ServiceWorkerRegistration.prototype;
  }
}
