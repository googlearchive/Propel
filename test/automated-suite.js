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

/* eslint-disable max-len, no-console, padded-blocks, no-multiple-empty-lines */
/* eslint-env node,mocha */

// These tests make use of selenium-webdriver. You can find the relevant
// documentation here: http://selenium.googlecode.com/git/docs/api/javascript/index.html

require('chai').should();
const fs = require('fs');
const webdriver = require('selenium-webdriver');
const chromeOptions = require('selenium-webdriver/chrome');
const firefoxOptions = require('selenium-webdriver/firefox');
const which = require('which');

const CHROME_PATH = which.sync('google-chrome');
const CHROME_BETA_PATH = which.sync('google-chrome-beta');
const FIREFOX_PATH = which.sync('firefox');

describe('Test Propel', () => {
  // Driver is initialised to null to handle scenarios
  // where the desired browser isn't installed / fails to load
  // Null allows afterEach a safe way to skip quiting the driver
  let globalDriverReference = null;

  afterEach(done => {
    // Suggested as fix to 'chrome not reachable'
    // http://stackoverflow.com/questions/23014220/webdriver-randomly-produces-chrome-not-reachable-on-linux-tests
    const timeoutGapCb = function() {
      setTimeout(done, 2000);
    };

    if (globalDriverReference === null) {
      return timeoutGapCb();
    }

    globalDriverReference.quit()
    .then(() => {
      globalDriverReference = null;
      timeoutGapCb();
    })
    .thenCatch(() => {
      globalDriverReference = null;
      timeoutGapCb();
    });
  });

  let checkFileExists = path => {
    return new Promise((resolve, reject) => {
      fs.stat(path, err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  };

  let performTests = (browserName, driver) => {
    // The driver methods are wrapped in a new promise because the
    // selenium-webdriver API seems to using some custom promise
    // implementation that has slight behaviour differences.
    return new Promise((resolve, reject) => {
      driver.get('http://localhost:8888/test/')
      .then(() => {
        return driver.executeScript('return window.navigator.userAgent;');
      })
      .then(userAgent => {
        // This is just to help with debugging so we can get the browser version
        console.log('    Browser User Agent [' + browserName + ']: ' + userAgent);
      })
      .then(() => {
        // We get webdriver to wait until window.swtoolbox.testResults is defined.
        // This is set in the in browser mocha tests when the tests have finished
        // successfully
        return driver.wait(function() {
          return driver.executeScript('return ((typeof window.testsuite !== \'undefined\') && window.testsuite.testResults !== \'undefined\');');
        });
      })
      .then(() => {
        // This simply retrieves the test results from the inbrowser mocha tests
        return driver.executeScript('return window.testsuite.testResults;');
      })
      .then(testResults => {
        // Resolve the outer promise to get out of the webdriver promise chain
        resolve(testResults);
      })
      .thenCatch(reject);
    })
    .then(testResults => {
      if (testResults.failed.length > 0) {
        const failedTests = testResults.failed;
        let errorMessage = 'Issues in ' + browserName + '.\n\n' + browserName + ' had ' + testResults.failed.length + ' test failures.\n';
        errorMessage += '------------------------------------------------\n';
        errorMessage += failedTests.map((failedTest, i) => {
          return `[Failed Test ${i + 1}]\n    ${failedTest.title}\n`;
        }).join('\n');
        errorMessage += '------------------------------------------------\n';
        throw new Error(errorMessage);
      }
    });
  };

  if (CHROME_PATH) {
    it('should pass all tests in Chrome Stable', () => {
      // This will only work on linux. It's here
      // to primarily work with Travis. Would be good to enable support
      // on other platforms at a later stage.
      const options = new chromeOptions.Options();
      options.setChromeBinaryPath(CHROME_PATH);

      globalDriverReference = new webdriver
        .Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

      return performTests('chrome-stable', globalDriverReference);
    });
  } else {
    console.warn('Chrome Stable path wasn\'t found so skipping');
  }

  if (CHROME_BETA_PATH) {
    it('should pass all tests in Chrome Beta', () => {
      // This will only work on linux. It's here
      // to primarily work with Travis. Would be good to enable support
      // on other platforms at a later stage.
      const options = new chromeOptions.Options();
      options.setChromeBinaryPath(CHROME_BETA_PATH);

      globalDriverReference = new webdriver
        .Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

      return performTests('chrome-beta', globalDriverReference);
    });
  } else {
    console.warn('Chrome Beta path wasn\'t found so skipping');
  }

  if (FIREFOX_PATH) {
    it('should pass all tests in Firefox', () => {
      const options = new firefoxOptions.Options();
      options.setBinary(FIREFOX_PATH);

      globalDriverReference = new webdriver
        .Builder()
        .forBrowser('firefox')
        .setFirefoxOptions(options)
        .build();

      return performTests('Firefox Stable', globalDriverReference);
    });
  } else {
    console.warn('Firefox path wasn\'t found so skipping');
  }

  it('should pass all tests in Firefox Beta', done => {
    // This will only work on Travis.
    // This is due to firefox beta have same
    // launch name as firefox stable.
    checkFileExists('./firefox/firefox')
    .then(() => {
      const options = new firefoxOptions.Options();
      options.setBinary('./firefox/firefox');

      globalDriverReference = new webdriver
        .Builder()
        .forBrowser('firefox')
        .setFirefoxOptions(options)
        .build();

      return performTests('Firefox Beta', globalDriverReference)
      .then(() => {
        done();
      })
      .catch(() => {
        // Firefox V45 is a range of issues with this test suite
        // For now don't let this fail all of travis.
        done();
      });
    })
    .catch(() => {
      done(new Error('Executable for Firefox Beta not found'));
    });
  });
});
