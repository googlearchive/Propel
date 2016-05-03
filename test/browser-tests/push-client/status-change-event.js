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

// This is a test and we want descriptions to be useful, if this
// breaks the max-length, it's ok.

/* eslint-disable max-len, no-unused-expressions */
/* eslint-env browser, mocha */

'use strict';

describe('Test \'statuschange\' event', function() {
  if (!window.isPropelClientSupported) {
    return;
  }

  const EMPTY_SW_PATH = '/test/browser-tests/push-client/empty-sw.js';
  const EXAMPLE_SUBSCRIPTION = {
    endpoint: '/endpoint'
  };

  let stateStub;

  beforeEach(function() {
    if (stateStub) {
      stateStub.restore();
    }
  });

  after(function() {
    if (stateStub) {
      stateStub.restore();
    }
  });

  it('should dispatch a \'statuschange\' event when the constructor is created (permission: default, subscription: null)', function(done) {
    stateStub = window.StateStub.getStub();
    stateStub.stubNotificationPermissions('default');
    stateStub.stubSWRegistration();

    return window.goog.propel.PropelClient.createClient(EMPTY_SW_PATH)
    .then(pushClient => {
      pushClient.addEventListener('statuschange', event => {
        window.chai.expect(event).to.not.equal(null);
        window.chai.expect(event.permissionState).to.equal('default');
        window.chai.expect(event.currentSubscription).to.equal(null);
        window.chai.expect(event.isSubscribed).to.equal(false);

        done();
      });
    });
  });

  it('should dispatch a \'statuschange\' event when the constructor is created (permission: blocked, subscription: null)', function(done) {
    stateStub = window.StateStub.getStub();
    stateStub.stubNotificationPermissions('denied');
    stateStub.stubSWRegistration();

    return window.goog.propel.PropelClient.createClient(EMPTY_SW_PATH)
    .then(pushClient => {
      pushClient.addEventListener('statuschange', event => {
        window.chai.expect(event).to.not.equal(null);
        window.chai.expect(event.permissionState).to.equal('denied');
        window.chai.expect(event.currentSubscription).to.equal(null);
        window.chai.expect(event.isSubscribed).to.equal(false);

        done();
      });
    });
  });

  it('should dispatch a \'statuschange\' event when the constructor is created (permission: granted, subscription: null)', function(done) {
    stateStub = window.StateStub.getStub();
    stateStub.stubNotificationPermissions('granted');
    stateStub.stubSWRegistration();

    return window.goog.propel.PropelClient.createClient(EMPTY_SW_PATH)
    .then(pushClient => {
      pushClient.addEventListener('statuschange', event => {
        window.chai.expect(event).to.not.equal(null);
        window.chai.expect(event.permissionState).to.equal('granted');
        window.chai.expect(event.currentSubscription).to.equal(null);
        window.chai.expect(event.isSubscribed).to.equal(false);

        done();
      });
    });
  });

  it('should dispatch a \'statuschange\' event when the constructor is created (permission: granted, subscription: {STUBBED})', function(done) {
    stateStub = window.StateStub.getStub();
    stateStub.stubNotificationPermissions('granted');
    stateStub.stubSWRegistration();
    stateStub.stubSubscription(stateStub.VALID_SUBSCRIPTION);

    let browserSubscription;

    // Subscribe before we initialise propel to see if it picks up the subscription
    return navigator.serviceWorker.register(EMPTY_SW_PATH)
    .then(reg => {
      return reg.pushManager.subscribe({userVisibleOnly: true});
    })
    .then(subscription => {
      browserSubscription = subscription;
      return window.goog.propel.PropelClient.createClient(EMPTY_SW_PATH);
    })
    .then(pushClient => {
      pushClient.addEventListener('statuschange', event => {
        window.chai.expect(event).to.not.equal(null);
        window.chai.expect(event.permissionState).to.equal('granted');
        window.chai.expect(event.currentSubscription.endpoint).to.equal(browserSubscription.endpoint);
        window.chai.expect(event.isSubscribed).to.equal(true);
        done();
      });
    });
  });
});
