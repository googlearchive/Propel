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

describe('Test unsubscribe()', function() {
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

  it('should unsubscribe the current subscription', function() {
    stateStub = window.StateStub.getStub();
    stateStub.stubNotificationPermissions('granted');
    stateStub.stubSWRegistration();
    stateStub.stubSubscription(stateStub.VALID_SUBSCRIPTION);

    // Subscribe before we initialise propel to see if it picks up the subscription
    return navigator.serviceWorker.register(EMPTY_SW_PATH)
    .then(reg => {
      return reg.pushManager.subscribe({userVisibleOnly: true});
    })
    .then(subscription => {
      window.chai.expect(subscription).to.not.equal(null);

      return window.goog.propel.PropelClient.createClient(EMPTY_SW_PATH)
      .then(pushClient => {
        return pushClient.unsubscribe();
      });
    });
  });

  it('should unsubscribe the current subscription and dispatch a statuschange event', function(done) {
    stateStub = window.StateStub.getStub();
    stateStub.stubNotificationPermissions('granted');
    stateStub.stubSWRegistration();
    stateStub.stubSubscription(stateStub.VALID_SUBSCRIPTION);

    let statuschangeCounter = 0;

    // Subscribe before we initialise propel to see if it picks up the subscription
    return navigator.serviceWorker.register(EMPTY_SW_PATH)
    .then(reg => {
      return reg.pushManager.subscribe({userVisibleOnly: true});
    })
    .then(subscription => {
      window.chai.expect(subscription).to.not.equal(null);

      return window.goog.propel.PropelClient.createClient(EMPTY_SW_PATH);
    })
    .then(pushClient => {
      pushClient.addEventListener('statuschange', event => {
        statuschangeCounter++;
        if (statuschangeCounter < 2) {
          return;
        }

        window.chai.expect(event).to.not.equal(null);
        window.chai.expect(event.currentSubscription).to.equal(null);
        window.chai.expect(event.isSubscribed).to.equal(false);

        done();
      });
      return pushClient.unsubscribe();
    });
  });

  it('should dispatch a status event when no subscription is available', function(done) {
    stateStub = window.StateStub.getStub();
    stateStub.stubNotificationPermissions('default');

    let statuschangeCounter = 0;

    return window.goog.propel.PropelClient.createClient(EMPTY_SW_PATH)
    .then(pushClient => {
      pushClient.addEventListener('statuschange', event => {
        statuschangeCounter++;
        if (statuschangeCounter < 2) {
          return;
        }

        window.chai.expect(event).to.not.equal(null);
        window.chai.expect(event.currentSubscription).to.equal(null);
        window.chai.expect(event.isSubscribed).to.equal(false);

        done();
      });
      return pushClient.unsubscribe();
    });
  });

  it('should resolve promise when no subscription is available', function() {
    stateStub = window.StateStub.getStub();
    stateStub.stubNotificationPermissions('default');
    stateStub.stubSWRegistration();
    stateStub.stubSubscription(stateStub.NULL_SUBSCRIPTION);

    return window.goog.propel.PropelClient.createClient(EMPTY_SW_PATH)
    .then(pushClient => {
      return pushClient.unsubscribe();
    });
  });

  it('should reject promise when getSubscription throws an error', function(done) {
    stateStub = window.StateStub.getStub(true);
    stateStub.stubNotificationPermissions('default');
    stateStub.stubSWRegistration();
    stateStub.stubSubscription(stateStub.ERROR_SUBSCRIPTION);

    return window.goog.propel.PropelClient.createClient(EMPTY_SW_PATH)
    .then(pushClient => {
      return pushClient.unsubscribe()
      .then(() => done(new Error('Shouldnt have resolved')))
      .catch(() => done());
    });
  });

  it('should dispatch a status event when getSubscription throws an error', function(done) {
    stateStub = window.StateStub.getStub();
    stateStub.stubNotificationPermissions('default');
    stateStub.stubSWRegistration();
    stateStub.stubSubscription(stateStub.ERROR_SUBSCRIPTION);

    let statuschangeCounter = 0;

    return window.goog.propel.PropelClient.createClient(EMPTY_SW_PATH)
    .then(pushClient => {
      pushClient.addEventListener('statuschange', event => {
        statuschangeCounter++;
        if (statuschangeCounter < 2) {
          return;
        }

        window.chai.expect(event).to.not.equal(null);
        window.chai.expect(event.currentSubscription).to.equal(null);
        window.chai.expect(event.isSubscribed).to.equal(false);

        done();
      });
      return pushClient.unsubscribe();
    });
  });

  it('should dispatch a status event when no subscription is available', function(done) {
    stateStub = window.StateStub.getStub();
    stateStub.stubNotificationPermissions('default');
    stateStub.stubSWRegistration();

    let statuschangeCounter = 0;

    return window.goog.propel.PropelClient.createClient(EMPTY_SW_PATH)
    .then(pushClient => {
      pushClient.addEventListener('statuschange', event => {
        statuschangeCounter++;
        if (statuschangeCounter < 2) {
          return;
        }

        window.chai.expect(event).to.not.equal(null);
        window.chai.expect(event.currentSubscription).to.equal(null);
        window.chai.expect(event.isSubscribed).to.equal(false);

        done();
      });
      return pushClient.unsubscribe();
    });
  });
});
