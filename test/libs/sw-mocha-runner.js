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

'use strict';

/* eslint-env worker, serviceworker, mocha */

importScripts('/node_modules/mocha/mocha.js');
importScripts('/node_modules/chai/chai.js');

const getFriendlyTestResult = testResult => {
  return {
    parentTitle: testResult.parent.title,
    title: testResult.title,
    state: testResult.state,
    err: testResult.err
  };
};

const startTests = () => {
  return new Promise(resolve => {
    const passedTests = [];
    const failedTests = [];

    const publishTestResults = () => {
      resolve({
        testResults: {
          passed: passedTests,
          failed: failedTests
        }
      });
    };

    self.chai.should();
    mocha.setup({
      ui: 'bdd',
      reporter: null
    });

    self.setUpTests();

    mocha.checkLeaks();
    mocha.globals(['goog']);
    var runResults = self.mocha.run();

    if (runResults.total === 0) {
      publishTestResults();
      return;
    }

    // pass, fail and end events allow up to capture results and
    // determine when to publish test results
    runResults.on('pass', function(test) {
      passedTests.push(getFriendlyTestResult(test));
    })
    .on('fail', function(test) {
      failedTests.push(getFriendlyTestResult(test));
    })
    .on('end', function() {
      publishTestResults();
    });
  });
};

self.addEventListener('message', event => {
  switch (event.data) {
    case 'start-tests':
      startTests()
      .then(results => {
        event.ports[0].postMessage(results);
      });
      break;
    default:
      event.ports[0].postMessage(new Error('Unknown test name: ' + event.data));
      break;
  }
});
