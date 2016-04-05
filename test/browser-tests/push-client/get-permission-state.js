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

describe('Test getPermissionState()', function() {
  if (!window.isPropelClientSupported) {
    return;
  }

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

  it('should return permission status of granted', function() {
    stateStub = window.StateStub.getStub();
    stateStub.stubNotificationPermissions('granted');

    return window.goog.propel.PropelClient.getPermissionState()
    .then(permissionState => {
      permissionState.should.equal('granted');
    });
  });

  it('should return permission status of default', function() {
    stateStub = window.StateStub.getStub();
    stateStub.stubNotificationPermissions('default');

    return window.goog.propel.PropelClient.getPermissionState()
    .then(permissionState => {
      permissionState.should.equal('default');
    });
  });

  it('should return permission status of denied', function() {
    stateStub = window.StateStub.getStub();
    stateStub.stubNotificationPermissions('denied');

    return window.goog.propel.PropelClient.getPermissionState()
    .then(permissionState => {
      permissionState.should.equal('denied');
    });
  });
});
