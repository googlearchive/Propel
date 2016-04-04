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
  const swUtils = window.goog.SWHelper;
  const serviceWorkersFolder = '/test/browser-tests/push-worker/get-notifications/serviceworkers';

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

  const sendMessage = (swController, testName) => {
    return new Promise(function(resolve, reject) {
      var messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = function(event) {
        if (event.data.error) {
          reject(event.data.error);
        } else {
          resolve(event.data);
        }
      };

      swController.postMessage(testName,
        [messageChannel.port2]);
    });
  };

  const performTest = loadedSW => {
    return swUtils.activateSW(loadedSW)
    .then(iframe => {
      return iframe.contentWindow.navigator.serviceWorker.ready
      .then(registration => {
        return registration.active;
      })
      .then(sw => {
        return sendMessage(sw, 'start-tests');
      })
      .then(msgResponse => {
        if (!msgResponse.testResults) {
          throw new Error('Unexpected test result: ' + msgResponse);
        }

        // Print test failues
        let testResults = msgResponse.testResults;
        if (testResults.failed.length > 0) {
          const failedTests = testResults.failed;
          let errorMessage = 'Issues in ' + loadedSW + '.\n\n' + loadedSW +
            ' had ' + testResults.failed.length + ' test failures.\n';
          errorMessage += '------------------------------------------------\n';
          errorMessage += failedTests.map((failedTest, i) => {
            return `[Failed Test ${i + 1}]\n` +
                   `    - ${failedTest.parentTitle} > ${failedTest.title}\n` +
                   `        ${failedTest.err.message}\n`;
          }).join('\n');
          errorMessage += '------------------------------------------------\n';
          throw new Error(errorMessage);
        }
      });
    });
  };

  it('should pass all get notification tests when permission is default', function() {
    this.timeout(60000);

    stateStub = window.StateStub.getStub();
    stateStub.stubNotificationPermissions('default');

    performTest(serviceWorkersFolder + '/default-get-notifications.js');
  });

  it('should pass all get notification tests when permission is granted', function() {
    this.timeout(60000);

    stateStub = window.StateStub.getStub();
    stateStub.stubNotificationPermissions('granted');

    performTest(serviceWorkersFolder + '/granted-get-notifications.js');
  });

  it('should pass all get notification tests when permission is denied', function() {
    this.timeout(60000);

    stateStub = window.StateStub.getStub();
    stateStub.stubNotificationPermissions('denied');

    performTest(serviceWorkersFolder + '/denied-get-notifications.js');
  });
});
