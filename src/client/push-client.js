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
  'bad_sw_path': 'propel.messaging() expects the second parameter to be a ' +
    'string to the path of your service worker file.',
  'bad_fcm_api_key': 'propel.messaging() requires an FCM API key as the ' +
    'first parameter.'
};
/* eslint-enable quote-prop */

export default class PushClient {
  constructor(swPath) {
    // TODO: If the service worker path is changed, should the SDK delete
    // the previous service worker registration?
    if (swPath) {
      if (typeof swPath !== 'string' || swPath.length <= 0) {
        return Promise.reject(new Error(ERROR_MESSAGES.bad_sw_path));
      }
    } else {
      swPath = '/push-sw.js';
    }
    this._swPath = swPath;

    this._subscribeForPush();
  }

  _subscribeForPush() {
    if (!this.supported) {
      return Promise.reject(new Error('Your browser does not meet the ' +
        'requirement for this library'));
    }

    return navigator.serviceWorker
    .register(this._swPath, {
      scope: 'propel-v1.0.0'
    })
    .then(registration => {
      // TODO: Whaht happens is user has blocked notifications?
      // TODO What happens if there is already a registration id
      // TODO: Is this the correct place to request permission?

      return registration.pushManager.subscribe({
        userVisibleOnly: true
      })
      .then(subscription => {
        // TODO: What to do with subscription?
        console.log(JSON.stringify(subscription));
      });
    })
    .catch(err => {
      // TODO: What to do with errors?
      console.error(err);
    });
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
