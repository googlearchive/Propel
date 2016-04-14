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

describe('Test PushWorker.getNotifications()', function() {
  const serviceWorkersFolder = '/test/browser-tests/push-worker/get-notifications/serviceworkers';

  it('should pass all get notification tests', function() {
    this.timeout(60000);
    const loadedSW = serviceWorkersFolder + '/get-notifications.js';
    return window.goog.mochaUtils.startServiceWorkerMochaTests(loadedSW)
    .then(testResults => {
      if (testResults.failed.length > 0) {
        const errorMessage = window.goog.mochaUtils
          .prettyPrintErrors(loadedSW, testResults);
        throw new Error(errorMessage);
      }
    });
  });
});
