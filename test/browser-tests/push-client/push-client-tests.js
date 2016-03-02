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

const testStubs = [];

const desiredSubscription = {
  endpoint: 'fake-endpoint'
};

const createStubsForPermission = desiredPermissionState => {
  let sinon = window.sinon;
  let permissionQueryStub = sinon.stub(navigator.permissions, 'query');
  permissionQueryStub.withArgs({name: 'push', userVisibleOnly: true})
    .returns(Promise.resolve({
      state: desiredPermissionState
    }));
  testStubs.push(permissionQueryStub);

  let permissionRequestStub = sinon.stub(Notification, 'requestPermission');
  permissionRequestStub.callsArgWithAsync(0, desiredPermissionState);
  testStubs.push(permissionRequestStub);
};

const createStubsForGetSubscription = (throwError, subscriptionResult) => {
  let sinon = window.sinon;
  //  STUB: navigator.serviceWorker.getRegistration
  //  STUB .pushManage on the result

  let getRegistrationStub = sinon.stub(navigator.serviceWorker, 'getRegistration', scope => {
    return {
      scope: scope,
      pushManager: {
        getSubscription: () => {
          if (throwError) {
            return Promise.reject(new Error('Test Generated Error'));
          }

          return Promise.resolve(subscriptionResult);
        }
      }
    };
  });
  testStubs.push(getRegistrationStub);
};

describe('Test PushClient', () => {
  const restoreStubs = () => {
    testStubs.forEach(stub => {
      stub.restore();
    });
  };

  beforeEach(() => {
    restoreStubs();
  });

  after(() => {
    restoreStubs();
  });

  it('should be able to find window.goog.propel.Client', function() {
    window.goog.propel.Client.should.be.defined;
  });

  describe('Test PushClient construction', () => {
    it('should be able to create a new push client', function() {
      const pushClient = new window.goog.propel.Client();
      window.chai.expect(pushClient._workerUrl).to.contain('dist/worker.js');
    });

    it('should be able to create a new push client with an empty object', function() {
      const pushClient = new window.goog.propel.Client({});
      window.chai.expect(pushClient._workerUrl).to.contain('dist/worker.js');
    });

    it('should be able to create a new push client with just workerUrl option', function() {
      const pushClient = new window.goog.propel.Client({
        workerUrl: '/sw.js'
      });

      window.chai.expect(pushClient._workerUrl).to.contain('/sw.js');
    });
  });

  describe('Test \'statuschange\' event', () => {
    it('should dispatch a \'statuschange\' event when the constructor is created (permission: prompt, subscription: null)', done => {
      createStubsForGetSubscription(false, null);
      createStubsForPermission('prompt');

      const pushClient = new window.goog.propel.Client();
      pushClient.addEventListener('statuschange', event => {
        window.chai.expect(event).to.not.equal(null);
        window.chai.expect(event.permissionState).to.equal('prompt');
        window.chai.expect(event.currentSubscription).to.equal(null);
        window.chai.expect(event.isSubscribed).to.equal(false);

        done();
      });
    });

    it('should dispatch a \'statuschange\' event when the constructor is created (permission: granted, subscription: null)', done => {
      createStubsForGetSubscription(false, null);
      createStubsForPermission('granted');

      const pushClient = new window.goog.propel.Client();
      pushClient.addEventListener('statuschange', event => {
        window.chai.expect(event).to.not.equal(null);
        window.chai.expect(event.permissionState).to.equal('granted');
        window.chai.expect(event.currentSubscription).to.equal(null);
        window.chai.expect(event.isSubscribed).to.equal(false);

        done();
      });
    });

    it('should dispatch a \'statuschange\' event when the constructor is created (permission: granted, subscription: {FAKE})', done => {
      createStubsForGetSubscription(false, desiredSubscription);
      createStubsForPermission('granted');

      const pushClient = new window.goog.propel.Client();
      pushClient.addEventListener('statuschange', event => {
        window.chai.expect(event).to.not.equal(null);
        window.chai.expect(event.permissionState).to.equal('granted');
        window.chai.expect(event.currentSubscription).to.equal(desiredSubscription);
        window.chai.expect(event.isSubscribed).to.equal(true);

        done();
      });
    });

    it('should dispatch a \'statuschange\' event when the constructor is created (permission: blocked, subscription: null)', done => {
      createStubsForGetSubscription(false, null);
      createStubsForPermission('blocked');

      const pushClient = new window.goog.propel.Client();
      pushClient.addEventListener('statuschange', event => {
        window.chai.expect(event).to.not.equal(null);
        window.chai.expect(event.permissionState).to.equal('blocked');
        window.chai.expect(event.currentSubscription).to.equal(null);
        window.chai.expect(event.isSubscribed).to.equal(false);

        done();
      });
    });
  });

  describe('Test requestPermission()', () => {
    it('requestPermission() should dispatch a \'requestingpermission\' event when state is prompt', function(done) {
      createStubsForPermission('prompt');

      const pushClient = new window.goog.propel.Client();
      pushClient.addEventListener('requestingpermission', () => {
        done();
      });
      pushClient.requestPermission();
    });

    it('requestPermission() should resolve to prompt', function() {
      createStubsForPermission('prompt');

      const pushClient = new window.goog.propel.Client();
      return pushClient.requestPermission()
      .then(permissionState => {
        permissionState.should.equal('prompt');
      });
    });

    it('requestPermission() should not dispatch a \'requestingpermission\' event because permission is granted', function(done) {
      createStubsForPermission('granted');

      const pushClient = new window.goog.propel.Client();
      pushClient.addEventListener('requestingpermission', () => {
        done(new Error('This should not be called when the state is granted'));
      });
      pushClient.requestPermission()
      .then(() => done());
    });

    it('requestPermission() should resolve to permission state of granted', function() {
      createStubsForPermission('granted');

      const pushClient = new window.goog.propel.Client();
      return pushClient.requestPermission()
      .then(permissionState => {
        permissionState.should.equal('granted');
      });
    });

    it('requestPermission() should not dispatch a \'requestingpermission\' event because permission is blocked', function(done) {
      createStubsForPermission('blocked');

      const pushClient = new window.goog.propel.Client();
      pushClient.addEventListener('requestingpermission', () => {
        done(new Error('This should not be called'));
      });
      pushClient.requestPermission()
      .then(() => done());
    });

    it('requestPermission() should resolve to blocked', function() {
      createStubsForPermission('blocked');

      const pushClient = new window.goog.propel.Client();
      pushClient.requestPermission()
      .then(permissionState => {
        permissionState.should.equal('blocked');
      });
    });

    it('requestPermission() should dispatch a statuschange event when called directly', function(done) {
      createStubsForPermission('granted');
      createStubsForGetSubscription(false, null);

      const pushClient = new window.goog.propel.Client();
      pushClient.addEventListener('statuschange', event => {
        window.chai.expect(event).to.not.equal(null);
        window.chai.expect(event.permissionState).to.equal('granted');
        window.chai.expect(event.currentSubscription).to.equal(null);
        window.chai.expect(event.isSubscribed).to.equal(false);

        done();
      });
      pushClient.requestPermission();
    });
  });

  describe('Test getSubscription()', () => {
    it('getSubscription() should return null when the user isn\'t subscribed yet', function() {
      const pushClient = new window.goog.propel.Client();
      return pushClient.getSubscription()
      .then(subscription => {
        window.chai.expect(subscription).to.equal(null);
      });
    });

    it('getSubscription() should return a subscription when the user is subscribed', function() {
      createStubsForGetSubscription(false, desiredSubscription);

      const pushClient = new window.goog.propel.Client();
      return pushClient.getSubscription()
      .then(subscription => {
        window.chai.expect(subscription).to.equal(desiredSubscription);
      });
    });

    it('getSubscription() should manage a failing pushManager.getSubscription() call', function(done) {
      createStubsForGetSubscription(true);

      const pushClient = new window.goog.propel.Client();
      pushClient.getSubscription()
      .then(() => {
        done(new Error('getSubscription should have thrown an error'));
      })
      .catch(err => {
        err.message.should.equal('Test Generated Error');
        done();
      });
    });
  });

  describe('Test subscribe()', () => {
    it('should dispatch a statuschange event with no subscription', (done) => {
      createStubsForPermission('prompt');
      createStubsForGetSubscription(false, null);

      let eventCounter = 0;

      const pushClient = new window.goog.propel.Client();
      pushClient.addEventListener('statuschange', event => {
        eventCounter++;

        if (eventCounter < 2) {
          return;
        }

        window.chai.expect(event).to.not.equal(null);
        window.chai.expect(event.permissionState).to.equal('prompt');
        window.chai.expect(event.currentSubscription).to.equal(null);
        window.chai.expect(event.isSubscribed).to.equal(false);

        done();
      });
      pushClient.subscribe();
    });

    it('should return an error that the user dismissed the notification', (done) => {
      createStubsForPermission('prompt');
      createStubsForGetSubscription(false, null);

      const pushClient = new window.goog.propel.Client();
      pushClient.subscribe()
      .then(() => {
        done(new Error('This shouldn\'t have resolved'));
      })
      .catch(err => {
        err.message.should.equal('Subscription failed. The user dismissed the notification permission dialog.');
        done();
      });
    });

    it('should dispatch a status event if the notification permission is blocked', (done) => {
      createStubsForPermission('blocked');
      createStubsForGetSubscription(false, null);

      let eventCounter = 0;

      const pushClient = new window.goog.propel.Client();
      pushClient.addEventListener('statuschange', event => {
        eventCounter++;

        if (eventCounter < 2) {
          return;
        }

        window.chai.expect(event).to.not.equal(null);
        window.chai.expect(event.permissionState).to.equal('blocked');
        window.chai.expect(event.currentSubscription).to.equal(null);
        window.chai.expect(event.isSubscribed).to.equal(false);

        done();
      });
      pushClient.subscribe();
    });

    it('should reject the promise with an error that the user has blocked notifications', (done) => {
      createStubsForPermission('blocked');
      createStubsForGetSubscription(false, null);

      const pushClient = new window.goog.propel.Client();
      pushClient.subscribe()
      .then(() => {
        done(new Error('This shouldn\'t have resolved'));
      })
      .catch(err => {
        err.message.should.equal('Subscription failed. The user denied permission to show notifications.');
        done();
      });
    });

    it('should dispatch a status event with the subscription when the permission is granted', (done) => {
      createStubsForPermission('granted');
      createStubsForGetSubscription(false, desiredSubscription);

      let eventCounter = 0;

      const pushClient = new window.goog.propel.Client();
      pushClient.addEventListener('statuschange', event => {
        eventCounter++;

        if (eventCounter < 2) {
          return;
        }

        window.chai.expect(event).to.not.equal(null);
        window.chai.expect(event.permissionState).to.equal('granted');
        window.chai.expect(event.currentSubscription).to.equal(desiredSubscription);
        window.chai.expect(event.isSubscribed).to.equal(true);

        done();
      });
      pushClient.subscribe();
    });

    it('should resolve the promise with a subscription when notifications are granted', (done) => {
      createStubsForPermission('granted');
      createStubsForGetSubscription(false, desiredSubscription);

      const pushClient = new window.goog.propel.Client();
      pushClient.subscribe()
      .then(subscriptionObject => {
        console.log(subscriptionObject);
        window.chai.expect(subscriptionObject).to.not.equal(null);
        window.chai.expect(subscriptionObject).to.equal(desiredSubscription);

        done();
      })
      .catch(err => {
        done(err);
      });
    });
  });
});
