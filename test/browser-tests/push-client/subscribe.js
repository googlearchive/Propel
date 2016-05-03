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

describe('Test subscribe()', function() {
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

  it('should return an error that the user dismissed the notification', function(done) {
    stateStub = window.StateStub.getStub(true);
    stateStub.stubNotificationPermissions('default');
    stateStub.stubSWRegistration();

    return window.goog.propel.PropelClient.createClient(EMPTY_SW_PATH)
    .then(pushClient => {
      return pushClient.subscribe()
      .then(() => {
        done(new Error('This shouldn\'t have resolved'));
      })
      .catch(err => {
        err.message.should.equal('Subscription failed. The user dismissed the notification permission dialog.');
        done();
      });
    });
  });

  it('should dispatch a status event if the notification permission is blocked', function(done) {
    stateStub = window.StateStub.getStub();
    stateStub.stubNotificationPermissions('denied');
    stateStub.stubSWRegistration();

    let eventCounter = 0;

    return window.goog.propel.PropelClient.createClient(EMPTY_SW_PATH)
    .then(pushClient => {
      pushClient.addEventListener('statuschange', event => {
        eventCounter++;

        if (eventCounter < 2) {
          return;
        }

        window.chai.expect(event).to.not.equal(null);
        window.chai.expect(event.permissionState).to.equal('denied');
        window.chai.expect(event.currentSubscription).to.equal(null);
        window.chai.expect(event.isSubscribed).to.equal(false);

        done();
      });
      console.log('subscribe');
      return pushClient.subscribe()
      .then(() => {
        console.log('subscribe then');
      })
      .catch(err => {
        console.log('subscribe err', err);
      });
    });
  });

  it('should reject the promise with an error that the user has blocked notifications', function(done) {
    stateStub = window.StateStub.getStub();
    stateStub.stubNotificationPermissions('denied');
    stateStub.stubSWRegistration();

    return window.goog.propel.PropelClient.createClient(EMPTY_SW_PATH)
    .then(pushClient => {
      return pushClient.subscribe()
      .then(() => {
        done(new Error('This shouldn\'t have resolved'));
      })
      .catch(err => {
        err.message.should.equal('Subscription failed. The user denied permission to show notifications.');
        done();
      });
    });
  });

  it('should dispatch a status event with the subscription when the permission is granted', function(done) {
    stateStub = window.StateStub.getStub();
    stateStub.stubNotificationPermissions('granted');
    stateStub.stubSWRegistration();
    stateStub.stubSubscription(stateStub.VALID_SUBSCRIPTION);

    let eventCounter = 0;

    return window.goog.propel.PropelClient.createClient(EMPTY_SW_PATH)
    .then(pushClient => {
      pushClient.addEventListener('statuschange', event => {
        eventCounter++;

        if (eventCounter < 2) {
          return;
        }

        window.chai.expect(event).to.not.equal(null);
        window.chai.expect(event.permissionState).to.equal('granted');
        window.chai.expect(event.currentSubscription).to.not.equal(null);
        window.chai.expect(event.isSubscribed).to.equal(true);

        done();
      });
      return pushClient.subscribe();
    });
  });

  it('should resolve the promise with a subscription when notifications are granted', function(done) {
    stateStub = window.StateStub.getStub();
    stateStub.stubNotificationPermissions('granted');
    stateStub.stubSWRegistration();
    stateStub.stubSubscription(stateStub.VALID_SUBSCRIPTION);

    return window.goog.propel.PropelClient.createClient(EMPTY_SW_PATH)
    .then(pushClient => {
      return pushClient.subscribe()
      .then(subscriptionObject => {
        window.chai.expect(subscriptionObject).to.not.equal(null);

        done();
      })
      .catch(err => {
        done(err);
      });
    });
  });

  it('should reject the promise when subscribe throws an error', function(done) {
    stateStub = window.StateStub.getStub(true);
    stateStub.stubNotificationPermissions('granted');
    stateStub.stubSWRegistration();
    stateStub.stubSubscription(stateStub.ERROR_SUBSCRIPTION);

    return window.goog.propel.PropelClient.createClient(EMPTY_SW_PATH)
    .then(pushClient => {
      return pushClient.subscribe()
      .then(() => {
        done(new Error('This should have rejected'));
      })
      .catch(() => done());
    });
  });

  it('should dispath a status event when subscribe throws an error', function(done) {
    stateStub = window.StateStub.getStub(true);
    stateStub.stubNotificationPermissions('granted');
    stateStub.stubSWRegistration();
    stateStub.stubSubscription(stateStub.ERROR_SUBSCRIPTION);

    let eventCounter = 0;

    return window.goog.propel.PropelClient.createClient(EMPTY_SW_PATH)
    .then(pushClient => {
      pushClient.addEventListener('statuschange', event => {
        eventCounter++;

        if (eventCounter < 2) {
          return;
        }

        window.chai.expect(event).to.not.equal(null);
        window.chai.expect(event.permissionState).to.equal('granted');
        window.chai.expect(event.currentSubscription).to.equal(null);
        window.chai.expect(event.isSubscribed).to.equal(false);

        done();
      });
      return pushClient.subscribe();
    });
  });

  it('should dispath events in order, requestingpermission, requestingsubscription and statuschange', function(done) {
    stateStub = window.StateStub.getStub(true);
    stateStub.stubNotificationPermissions('default');
    stateStub.stubSWRegistration();
    stateStub.stubSubscription(stateStub.VALID_SUBSCRIPTION);

    let statuschangeCounter = 0;
    let eventTypes = [];

    return window.goog.propel.PropelClient.createClient(EMPTY_SW_PATH)
    .then(pushClient => {
      pushClient.addEventListener('statuschange', event => {
        eventTypes.push(event.type);

        statuschangeCounter++;

        if (statuschangeCounter < 2) {
          // Called here so we can guarentee statuschange occurs first
          // from constructor
          pushClient.subscribe();
          return;
        }

        window.chai.expect(event).to.not.equal(null);
        window.chai.expect(event.currentSubscription).to.not.equal(null);
        window.chai.expect(event.isSubscribed).to.equal(true);

        eventTypes.length.should.equal(4);
        eventTypes[0].should.equal('statuschange');
        eventTypes[1].should.equal('requestingpermission');
        eventTypes[2].should.equal('requestingsubscription');
        eventTypes[3].should.equal('statuschange');

        done();
      });
      pushClient.addEventListener('requestingpermission', event => {
        stateStub.stubNotificationPermissions('granted');

        eventTypes.push(event.type);
      });
      pushClient.addEventListener('requestingsubscription', event => {
        eventTypes.push(event.type);
      });
    });
  });
});
