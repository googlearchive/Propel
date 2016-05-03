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

describe('Test requestPermission()', function() {
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

  // We can't surpress a dialog after requesting it so force stub
  it('should dispatch a \'requestingpermission\' event when the permission state is default', function(done) {
    stateStub = window.StateStub.getStub(true);
    stateStub.stubNotificationPermissions('default');
    stateStub.stubSWRegistration();

    return window.goog.propel.PropelClient.createClient(EMPTY_SW_PATH)
    .then(pushClient => {
      pushClient.addEventListener('requestingpermission', () => {
        done();
      });
      pushClient.requestPermission();
    });
  });

  // We can't surpress a dialog after requesting it so force stub
  it('should resolve to default', function() {
    stateStub = window.StateStub.getStub(true);
    stateStub.stubNotificationPermissions('default');
    stateStub.stubSWRegistration();

    return window.goog.propel.PropelClient.createClient(EMPTY_SW_PATH)
    .then(pushClient => {
      return pushClient.requestPermission()
      .then(permissionState => {
        permissionState.should.equal('default');
      });
    });
  });

  it('should not dispatch a \'requestingpermission\' event because permission is granted', function(done) {
    stateStub = window.StateStub.getStub();
    stateStub.stubNotificationPermissions('granted');
    stateStub.stubSWRegistration();

    return window.goog.propel.PropelClient.createClient(EMPTY_SW_PATH)
    .then(pushClient => {
      pushClient.addEventListener('requestingpermission', () => {
        done(new Error('This should not be called when the state is granted'));
      });
      pushClient.requestPermission()
      .then(() => done());
    });
  });

  it('should resolve to permission state of granted', function() {
    stateStub = window.StateStub.getStub();
    stateStub.stubNotificationPermissions('granted');
    stateStub.stubSWRegistration();

    return window.goog.propel.PropelClient.createClient(EMPTY_SW_PATH)
    .then(pushClient => {
      return pushClient.requestPermission()
      .then(permissionState => {
        permissionState.should.equal('granted');
      });
    });
  });

  it('should not dispatch a \'requestingpermission\' event because permission is blocked', function(done) {
    stateStub = window.StateStub.getStub();
    stateStub.stubNotificationPermissions('denied');
    stateStub.stubSWRegistration();

    return window.goog.propel.PropelClient.createClient(EMPTY_SW_PATH)
    .then(pushClient => {
      pushClient.addEventListener('requestingpermission', () => {
        done(new Error('This should not be called'));
      });
      return pushClient.requestPermission()
      .then(() => done());
    });
  });

  it('should resolve to blocked', function() {
    stateStub = window.StateStub.getStub();
    stateStub.stubNotificationPermissions('denied');
    stateStub.stubSWRegistration();

    return window.goog.propel.PropelClient.createClient(EMPTY_SW_PATH)
    .then(pushClient => {
      return pushClient.requestPermission()
      .then(permissionState => {
        permissionState.should.equal('denied');
      });
    });
  });

  it('should dispatch a \'statuschange\' event when called directly', function(done) {
    stateStub = window.StateStub.getStub();
    stateStub.stubNotificationPermissions('granted');
    stateStub.stubSWRegistration();

    let counter = 0;

    return window.goog.propel.PropelClient.createClient(EMPTY_SW_PATH)
    .then(pushClient => {
      pushClient.addEventListener('statuschange', event => {
        counter++;

        if (counter < 2) {
          return;
        }

        window.chai.expect(event).to.not.equal(null);
        window.chai.expect(event.permissionState).to.equal('granted');
        window.chai.expect(event.currentSubscription).to.equal(null);
        window.chai.expect(event.isSubscribed).to.equal(false);

        done();
      });
      pushClient.requestPermission();
    });
  });
});
