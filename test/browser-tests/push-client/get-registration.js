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

describe('Test getRegistration()', function() {
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

  it('should reject due to a bad registration', function(done) {
    stateStub = window.StateStub.getStub();

    const pushClient = new window.goog.propel.PropelClient('/non-existant/sw.js');
    pushClient.getRegistration()
    .then(() => {
      done(new Error('getRegistration should reject for a bad SW'));
    })
    .catch(() => {
      done();
    });
  });

  it('should resolve with a registration', function() {
    stateStub = window.StateStub.getStub();
    stateStub.setUpRegistration(null);

    const pushClient = new window.goog.propel.PropelClient(EMPTY_SW_PATH);
    return pushClient.getRegistration()
    .then(reg => {
      window.chai.expect(reg).to.not.equal(null);
    });
  });
});
