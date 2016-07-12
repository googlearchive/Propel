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

describe('Test getSubscription()', function() {
  if (!window.isPropelClientSupported) {
    return;
  }

  const EMPTY_SW_PATH = '/test/browser-tests/push-client/empty-sw.js';

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

  it('should return null when the user isn\'t subscribed', function() {
    stateStub = window.StateStub.getStub();
    stateStub.stubSWRegistration();
    stateStub.stubSubscription(stateStub.NULL_SUBSCRIPTION);

    return window.goog.propel.PropelClient.createClient(EMPTY_SW_PATH)
    .then(pushClient => {
      return pushClient.getSubscription()
      .then(subscription => {
        window.chai.expect(subscription).to.equal(null);
      });
    });
  });

  it('should return a subscription when the user is subscribed', function() {
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
      return pushClient.getSubscription()
      .then(innerSubscription => {
        window.chai.expect(innerSubscription.endpoint).to.equal(browserSubscription.endpoint);
      });
    });
  });

  it('should manage a failing pushManager.getSubscription() call', function(done) {
    stateStub = window.StateStub.getStub(true);
    stateStub.stubSWRegistration();

    return window.goog.propel.PropelClient.createClient(EMPTY_SW_PATH)
    .then(pushClient => {
      return pushClient.getSubscription()
      .then(() => {
        done(new Error('getSubscription should have thrown an error'));
      })
      .catch(err => {
        err.message.should.equal('Test Generated Error');
        done();
      });
    });
  });
});
