/*
  Copyright 2016 Google Inc. All Rights Reserved.

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

'use strict';

/* global sinon */
/* eslint-env browser */

class FullStateStub extends window.BaseStateStub {
  constructor() {
    super();

    this.permissionStubs = [];
    this.swStubs = [];
  }

  restore() {
    this.permissionStubs.forEach(stub => {
      stub.restore();
    });
    this.permissionStubs = [];

    this.swStubs.forEach(stub => {
      stub.restore();
    });
    this.swStubs = [];
  }

  stubNotificationPermissions(newState) {
    this._currentPermission = newState;

    if (this.permissionStubs.length === 0) {
      // Fallbacks for browsers where we can't pre-select the permission dialog
      const permissionQueryStub = sinon.stub(window.goog.propel.PropelClient,
        'getPermissionState',
        () => {
          return Promise.resolve(this._currentPermission);
        }
      );

      // Notification.requestPermission
      const permissionRequestStub = sinon.stub(Notification,
        'requestPermission',
        cb => {
          cb(this._currentPermission);
        });

      this.permissionStubs.push(permissionQueryStub);
      this.permissionStubs.push(permissionRequestStub);
    }
  }

  // setUpRegistration(subscription) {
  stubSWRegistration(registrationType) {
    // this._currentRegistration = this._buildSWRegistration(subscription);
    this._registrationType = registrationType;

    if (this.swStubs.length === 0) {
      const origRegister = navigator.serviceWorker.register;
      const registerStub = sinon.stub(
        navigator.serviceWorker, 'register', (swurl, options) => {
          if (this._registrationType === this.ERROR_REGISTRATION) {
            return Promise.reject(new Error('No valid SW registered'));
          }

          return origRegister.call(navigator.serviceWorker, swurl, options)
          .then(registration => {
            if (this._currentRegistration) {
              return this._currentRegistration;
            }

            const subscribeStub = sinon.stub(
              registration.pushManager, 'subscribe', options => {
                if (!options.userVisibleOnly) {
                  throw new Error('Test Stub Error: User Visible Required');
                }

                if (this._subscription) {
                  return Promise.resolve(this._subscription);
                }

                if (typeof this._subscription === 'undefined') {
                  return Promise.reject(new Error('Test Generated Error'));
                }

                return Promise.resolve(null);
              });
            this.swStubs.push(subscribeStub);

            const getSubscriptionStub = sinon.stub(
              registration.pushManager, 'getSubscription', () => {
                if (typeof this._subscription === 'undefined') {
                  return Promise.reject(new Error('Test Generated Error'));
                }

                return Promise.resolve(this._subscription);
              });
            this.swStubs.push(getSubscriptionStub);

            this._currentRegistration = registration;

            return registration;
          });
        }
      );

      // navigator.serviceWorker.getRegistration
      const getRegistrationStub = sinon.stub(
        navigator.serviceWorker, 'getRegistration', () => {
          return Promise.resolve(this._currentRegistration);
        }
      );

      this.swStubs.push(registerStub);
      this.swStubs.push(getRegistrationStub);
    }
  }

  stubSubscription(subscriptionType) {
    switch (subscriptionType) {
      case this.ERROR_SUBSCRIPTION:
        this._subscription = undefined;
        break;
      case this.NULL_SUBSCRIPTION:
        this._subscription = null;
        break;
      case this.VALID_SUBSCRIPTION:
        this._subscription = {
          endpoint: '/endpoint'
        };
        break;
      default:
        throw new Error('Unknown subscription type.');
    }

    if (this._subscription) {
      this._subscription.unsubscribe = () => {
        this._subscription = null;
      };
    }
  }

  _buildSWRegistration() {
    console.log('_buildSWRegistration <-----------------');
    return {
      scope: './',
      active: {
        // This is to skip handling of SW lifecycle.
      },
      pushManager: {
        subscribe: options => {
          console.log('pushManage.subscribe() <-----------------');
          if (!options.userVisibleOnly) {
            throw new Error('Test Stub Error: User Visible Required');
          }

          if (this._subscription) {
            return Promise.resolve(this._subscription);
          }

          if (typeof this._subscription === 'undefined') {
            return Promise.reject(new Error('Test Generated Error'));
          }

          return Promise.resolve(null);
        },
        getSubscription: () => {
          if (typeof this._subscription === 'undefined') {
            return Promise.reject(new Error('Test Generated Error'));
          }

          return Promise.resolve(this._subscription);
        }
      }
    };
  }
}

window.FullStateStub = FullStateStub;
