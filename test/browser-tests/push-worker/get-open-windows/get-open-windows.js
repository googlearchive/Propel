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

describe('Test PushWorker.getOpenWindows()', function() {
  const swUtils = window.goog.SWHelper;

  const serviceWorkersFolder = '/test/browser-tests/push-worker/get-open-windows/serviceworkers';

  beforeEach(function() {
    const testIframes = document.querySelectorAll('.test-iframe');
    for (let i = 0; i < testIframes.length; i++) {
      const testIframe = testIframes[i];
      testIframe.parentElement.removeChild(testIframe);
    }

    return swUtils.cleanState();
  });

  after(function() {
    const allIframes = document.querySelectorAll('iframe');
    for (let i = 0; i < allIframes.length; i++) {
      console.log(allIframes[i]);
    }

    const testIframes = document.querySelectorAll('.test-iframe');
    for (let i = 0; i < testIframes.length; i++) {
      const testIframe = testIframes[i];
      testIframe.parentElement.removeChild(testIframe);
    }

    return swUtils.cleanState();
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

  it('should pass all no windows tests', function() {
    this.timeout(6000);
    const loadedSW = serviceWorkersFolder + '/no-windows.js';
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
            return `[Failed Test ${i + 1}]\n    ${failedTest.title}\n`;
          }).join('\n');
          errorMessage += '------------------------------------------------\n';
          throw new Error(errorMessage);
        }
      });
    });
  });

  it('should pass all single windows tests', function() {
    this.timeout(6000);

    const loadedSW = serviceWorkersFolder + '/single-window.js';
    return swUtils.activateSW(loadedSW)
    .then(iframe => {
      // Open a page with the correct scope for the service worker
      const testPage = self.location.origin +
        '/test/browser-tests/push-worker/get-open-windows/test.html';

      // We need a page to be loaded for the getOpenWindows() method to detect
      const testIframe = document.createElement('iframe');
      testIframe.classList.add('test-iframe');
      document.body.appendChild(testIframe);

      return new Promise(resolve => {
        testIframe.addEventListener('load', resolve);
        testIframe.src = testPage;
      })
      .then(() => iframe);
    })
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
            return `[Failed Test ${i + 1}]\n    ${failedTest.title}\n`;
          }).join('\n');
          errorMessage += '------------------------------------------------\n';
          throw new Error(errorMessage);
        }
      });
    });
  });

  it('should pass all multiple windows tests', function() {
    this.timeout(6000);

    const loadedSW = serviceWorkersFolder + '/multiple-windows.js';
    const testPage = self.location.origin +
      '/test/browser-tests/push-worker/get-open-windows/test.html';

    return swUtils.activateSW(loadedSW)
    .then(iframe => {
      return Promise.all([
        new Promise(resolve => {
          // We need a page to be loaded for the getOpenWindows() method to detect
          const testIframe = document.createElement('iframe');
          testIframe.classList.add('test-iframe');
          document.body.appendChild(testIframe);

          testIframe.addEventListener('load', resolve);
          testIframe.src = testPage;
        }),
        new Promise(resolve => {
          // We need a page to be loaded for the getOpenWindows() method to detect
          const testIframe = document.createElement('iframe');
          testIframe.classList.add('test-iframe');
          document.body.appendChild(testIframe);

          testIframe.addEventListener('load', resolve);
          testIframe.src = testPage;
        }),
        new Promise(resolve => {
          // We need a page to be loaded for the getOpenWindows() method to detect
          const testIframe = document.createElement('iframe');
          testIframe.classList.add('test-iframe');
          document.body.appendChild(testIframe);

          testIframe.addEventListener('load', resolve);
          testIframe.src = iframe.src;
        })
      ])
      .then(() => iframe);
    })
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
            return `[Failed Test ${i + 1}]\n    ${failedTest.title}\n`;
          }).join('\n');
          errorMessage += '------------------------------------------------\n';
          throw new Error(errorMessage);
        }
      });
    });
  });
});
