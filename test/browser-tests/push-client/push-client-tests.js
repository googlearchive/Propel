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

let stateStub;

const EXAMPLE_SUBSCRIPTION = {
  endpoint: '/endpoint'
};

const buildSWRegistration = subscription => {
  let innerSubscription = subscription;
  if (innerSubscription) {
    innerSubscription.unsubscribe = () => {
      innerSubscription = null;
    };
  }
  return {
    scope: './',
    active: {
      // This is to skip handling of SW lifecycle.
    },
    pushManager: {
      subscribe: options => {
        if (!options.userVisibleOnly) {
          throw new Error('Test Stub Error: User Visible Required');
        }

        return Promise.resolve(innerSubscription);
      },
      getSubscription: () => {
        if (typeof subscription === 'undefined') {
          return Promise.reject(new Error('Test Generated Error'));
        }

        return Promise.resolve(innerSubscription);
      }
    }
  };
};

describe('Test PushClient', () => {
  beforeEach(() => {
    if (stateStub) {
      stateStub.restore();
    }
  });

  after(() => {
    if (stateStub) {
      stateStub.restore();
    }
  });

  it('should be able to find window.goog.propel.Client', function() {
    window.goog.propel.Client.should.be.defined;
  });

  describe('Test supported()', () => {
    it('should return true or false', () => {
      (typeof window.goog.propel.Client.supported()).should.equal('boolean');
    });
  });

  if (!window.goog.propel.Client.supported()) {
    console.warn('This browser doesn\'t support Propel so bail early');
    return;
  }

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
      stateStub = new window.StateStub();
      stateStub.permissionState = 'prompt';
      stateStub.registration = null;

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
      stateStub = new window.StateStub();
      stateStub.permissionState = 'granted';
      stateStub.registration = null;

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
      stateStub = new window.StateStub();
      stateStub.permissionState = 'granted';
      stateStub.registration = buildSWRegistration(EXAMPLE_SUBSCRIPTION);

      const pushClient = new window.goog.propel.Client();
      pushClient.addEventListener('statuschange', event => {
        window.chai.expect(event).to.not.equal(null);
        window.chai.expect(event.permissionState).to.equal('granted');
        window.chai.expect(event.currentSubscription).to.equal(EXAMPLE_SUBSCRIPTION);
        window.chai.expect(event.isSubscribed).to.equal(true);

        done();
      });
    });

    it('should dispatch a \'statuschange\' event when the constructor is created (permission: blocked, subscription: null)', done => {
      stateStub = new window.StateStub();
      stateStub.permissionState = 'blocked';
      stateStub.registration = null;

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

  describe('Test getRegistration()', () => {
    it('should resolve with a registration', () => {
      stateStub = new window.StateStub();
      stateStub.registration = buildSWRegistration();

      const pushClient = new window.goog.propel.Client();
      return pushClient.getRegistration()
      .then(reg => {
        window.chai.expect(reg).to.not.equal(null);
      });
    });

    it('should resolve with null due to no registration', () => {
      stateStub = new window.StateStub();
      stateStub.registration = null;

      const pushClient = new window.goog.propel.Client();
      return pushClient.getRegistration()
      .then(reg => {
        window.chai.expect(reg).to.equal(null);
      });
    });
  });

  describe('Test requestPermission()', () => {
    it('should dispatch a \'requestingpermission\' event when the permission state is prompt', function(done) {
      stateStub = new window.StateStub();
      stateStub.permissionState = 'prompt';

      const pushClient = new window.goog.propel.Client();
      pushClient.addEventListener('requestingpermission', () => {
        done();
      });
      pushClient.requestPermission();
    });

    it('should resolve to prompt', function() {
      stateStub = new window.StateStub();
      stateStub.permissionState = 'prompt';

      const pushClient = new window.goog.propel.Client();
      return pushClient.requestPermission()
      .then(permissionState => {
        permissionState.should.equal('prompt');
      });
    });

    it('should not dispatch a \'requestingpermission\' event because permission is granted', function(done) {
      stateStub = new window.StateStub();
      stateStub.permissionState = 'granted';

      const pushClient = new window.goog.propel.Client();
      pushClient.addEventListener('requestingpermission', () => {
        done(new Error('This should not be called when the state is granted'));
      });
      pushClient.requestPermission()
      .then(() => done());
    });

    it('should resolve to permission state of granted', function() {
      stateStub = new window.StateStub();
      stateStub.permissionState = 'granted';

      const pushClient = new window.goog.propel.Client();
      return pushClient.requestPermission()
      .then(permissionState => {
        permissionState.should.equal('granted');
      });
    });

    it('should not dispatch a \'requestingpermission\' event because permission is blocked', function(done) {
      stateStub = new window.StateStub();
      stateStub.permissionState = 'blocked';

      const pushClient = new window.goog.propel.Client();
      pushClient.addEventListener('requestingpermission', () => {
        done(new Error('This should not be called'));
      });
      pushClient.requestPermission()
      .then(() => done());
    });

    it('should resolve to blocked', function() {
      stateStub = new window.StateStub();
      stateStub.permissionState = 'blocked';

      const pushClient = new window.goog.propel.Client();
      pushClient.requestPermission()
      .then(permissionState => {
        permissionState.should.equal('blocked');
      });
    });

    it('should dispatch a \'statuschange\' event when called directly', function(done) {
      stateStub = new window.StateStub();
      stateStub.permissionState = 'granted';
      stateStub.registration = null;

      let counter = 0;

      const pushClient = new window.goog.propel.Client();
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

  describe('Test getSubscription()', () => {
    it('should return null when the user isn\'t subscribed', function() {
      stateStub = new window.StateStub();
      stateStub.registration = null;

      const pushClient = new window.goog.propel.Client();
      return pushClient.getSubscription()
      .then(subscription => {
        window.chai.expect(subscription).to.equal(null);
      });
    });

    it('should return a subscription when the user is subscribed', function() {
      stateStub = new window.StateStub();
      stateStub.registration = buildSWRegistration(EXAMPLE_SUBSCRIPTION);

      const pushClient = new window.goog.propel.Client();
      return pushClient.getSubscription()
      .then(subscription => {
        window.chai.expect(subscription).to.equal(EXAMPLE_SUBSCRIPTION);
      });
    });

    it('should manage a failing pushManager.getSubscription() call', function(done) {
      stateStub = new window.StateStub();
      // Empty function will caused an error to be throw
      stateStub.registration = buildSWRegistration();

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
      stateStub = new window.StateStub();
      stateStub.permissionState = 'prompt';
      stateStub.registration = buildSWRegistration(null);

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
      stateStub = new window.StateStub();
      stateStub.permissionState = 'prompt';
      stateStub.registration = buildSWRegistration(null);

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
      stateStub = new window.StateStub();
      stateStub.permissionState = 'blocked';
      stateStub.registration = buildSWRegistration(null);

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
      stateStub = new window.StateStub();
      stateStub.permissionState = 'blocked';
      stateStub.registration = buildSWRegistration(null);

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

    it('should dispatch a status event with the subscription when the permission is granted', done => {
      stateStub = new window.StateStub();
      stateStub.permissionState = 'granted';
      stateStub.registration = buildSWRegistration(EXAMPLE_SUBSCRIPTION);

      let eventCounter = 0;

      const pushClient = new window.goog.propel.Client();
      pushClient.addEventListener('statuschange', event => {
        eventCounter++;

        if (eventCounter < 2) {
          return;
        }

        window.chai.expect(event).to.not.equal(null);
        window.chai.expect(event.permissionState).to.equal('granted');
        window.chai.expect(event.currentSubscription).to.equal(EXAMPLE_SUBSCRIPTION);
        window.chai.expect(event.isSubscribed).to.equal(true);

        done();
      });
      pushClient.subscribe();
    });

    it('should resolve the promise with a subscription when notifications are granted', (done) => {
      stateStub = new window.StateStub();
      stateStub.permissionState = 'granted';
      stateStub.registration = buildSWRegistration(EXAMPLE_SUBSCRIPTION);

      const pushClient = new window.goog.propel.Client();
      pushClient.subscribe()
      .then(subscriptionObject => {
        window.chai.expect(subscriptionObject).to.not.equal(null);
        window.chai.expect(subscriptionObject).to.equal(EXAMPLE_SUBSCRIPTION);

        done();
      })
      .catch(err => {
        done(err);
      });
    });

    it('should dispath events in order, requestingpermission, requestingsubscription and statuschange', (done) => {
      stateStub = new window.StateStub();
      stateStub.permissionState = 'prompt';
      stateStub.registration = buildSWRegistration(EXAMPLE_SUBSCRIPTION);

      let statuschangeCounter = 0;
      let eventTypes = [];
      const pushClient = new window.goog.propel.Client();
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
        window.chai.expect(event.currentSubscription).to.equal(EXAMPLE_SUBSCRIPTION);
        window.chai.expect(event.isSubscribed).to.equal(true);

        eventTypes.length.should.equal(4);
        eventTypes[0].should.equal('statuschange');
        eventTypes[1].should.equal('requestingpermission');
        eventTypes[2].should.equal('requestingsubscription');
        eventTypes[3].should.equal('statuschange');

        done();
      });
      pushClient.addEventListener('requestingpermission', event => {
        stateStub.permissionState = 'granted';

        eventTypes.push(event.type);
      });
      pushClient.addEventListener('requestingsubscription', event => {
        eventTypes.push(event.type);
      });
    });
  });

  describe('Test unsubscribe()', () => {
    it('should unsubscribe the current subscription', (done) => {
      stateStub = new window.StateStub();
      stateStub.registration = buildSWRegistration(EXAMPLE_SUBSCRIPTION);

      const pushClient = new window.goog.propel.Client();
      pushClient.unsubscribe()
      .then(() => done());
    });

    it('should unsubscribe the current subscription and dispatch a statuschange event', (done) => {
      stateStub = new window.StateStub();
      stateStub.permissionState = 'prompt';
      stateStub.registration = buildSWRegistration(EXAMPLE_SUBSCRIPTION);

      let statuschangeCounter = 0;

      const pushClient = new window.goog.propel.Client();
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
      pushClient.unsubscribe();
    });

    it('should resolve promise when no registration is available', (done) => {
      stateStub = new window.StateStub();
      stateStub.permissionState = 'prompt';
      stateStub.registration = null;

      const pushClient = new window.goog.propel.Client();
      pushClient.unsubscribe()
      .then(() => done());
    });

    it('should dispatch a status event when no registration is available', (done) => {
      stateStub = new window.StateStub();
      stateStub.permissionState = 'prompt';
      stateStub.registration = null;

      let statuschangeCounter = 0;

      const pushClient = new window.goog.propel.Client();
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
      pushClient.unsubscribe();
    });

    it('should resolve promise when no subscription is available', (done) => {
      stateStub = new window.StateStub();
      stateStub.permissionState = 'prompt';
      stateStub.registration = buildSWRegistration(null);

      const pushClient = new window.goog.propel.Client();
      pushClient.unsubscribe()
      .then(() => done());
    });

    it('should dispatch a status event when no subscription is available', (done) => {
      stateStub = new window.StateStub();
      stateStub.permissionState = 'prompt';
      stateStub.registration = buildSWRegistration(null);

      let statuschangeCounter = 0;

      const pushClient = new window.goog.propel.Client();
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
      pushClient.unsubscribe();
    });
  });

  describe('Test getPermissionState()', () => {
    it('should return permission status of granted', () => {
      stateStub = new window.StateStub();
      stateStub.permissionState = 'granted';

      return window.goog.propel.Client.getPermissionState()
      .then(permissionState => {
        permissionState.state.should.equal('granted');
      });
    });

    it('should return permission status of prompt', () => {
      stateStub = new window.StateStub();
      stateStub.permissionState = 'prompt';

      return window.goog.propel.Client.getPermissionState()
      .then(permissionState => {
        permissionState.state.should.equal('prompt');
      });
    });

    it('should return permission status of denied', () => {
      stateStub = new window.StateStub();
      stateStub.permissionState = 'blocked';

      return window.goog.propel.Client.getPermissionState()
      .then(permissionState => {
        permissionState.state.should.equal('blocked');
      });
    });
  });
});
