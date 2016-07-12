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

const path = require('path');
const seleniumAssistant = require('selenium-assistant');
const chalk = require('chalk');
const swTestingHelpers = require('sw-testing-helpers');
const TestServer = swTestingHelpers.TestServer;
const mochaUtils = swTestingHelpers.mochaUtils;

require('chai').should();

describe('Test Propel', function() {
  // Browser tests can be slow
  this.timeout(60000);
  this.retries(3);

  // Driver is initialised to null to handle scenarios
  // where the desired browser isn't installed / fails to load
  // Null allows afterEach a safe way to skip quiting the driver
  let globalDriverReference = null;
  let testServer;
  let testServerURL;

  before(function() {
    testServer = new TestServer();
    return testServer.startServer(path.join(__dirname, '..'))
    .then(portNumber => {
      testServerURL = `http://localhost:${portNumber}`;
    });
  });

  after(function() {
    testServer.killServer();
  });

  afterEach(function() {
    this.timeout(10000);

    return seleniumAssistant.killWebDriver(globalDriverReference);
  });

  const queueUnitTest = browserInfo => {
    it(`should pass all tests in ${browserInfo.getPrettyName()}`, () => {
      if (browserInfo.getSeleniumBrowserId() === 'chrome') {
        /* eslint-disable camelcase */
        const chromePreferences = {
          profile: {
            content_settings: {
              exceptions: {
                notifications: {}
              }
            }
          }
        };
        chromePreferences.profile.content_settings
        .exceptions.notifications[testServerURL + ',*'] = {
          setting: 1
        };
        browserInfo.getSeleniumOptions().setUserPreferences(chromePreferences);
        /* eslint-enable camelcase */
      }

      return browserInfo.getSeleniumDriver()
      .then(driver => {
        globalDriverReference = driver;
      })
      .then(() => {
        return mochaUtils.startWebDriverMochaTests(
          browserInfo.getPrettyName(),
          globalDriverReference,
          `${testServerURL}/test/browser-tests/`
        );
      })
      .then(testResults => {
        if (testResults.failed.length > 0) {
          const errorMessage = mochaUtils.prettyPrintErrors(
            browserInfo.getPrettyName(),
            testResults
          );
          throw new Error(errorMessage);
        }
      });
    });
  };

  const automatedBrowsers = seleniumAssistant.getAvailableBrowsers();
  automatedBrowsers.forEach(browser => {
    if (browser.getSeleniumBrowserId() !== 'chrome' &&
      browser.getSeleniumBrowserId() !== 'firefox') {
      return;
    }

    if (browser.getSeleniumBrowserId() === 'firefox' &&
      process.env.TRAVIS === 'true') {
      console.log('');
      console.warn(chalk.red(
        'Running on Travis so skipping firefox tests as ' +
        'they don\'t currently work.'
      ));
      console.log('');
      return;
    }

    if (browser.getSeleniumBrowserId() === 'firefox' &&
      browser.getVersionNumber() <= 47) {
      // There is a bug in FF 47 that prevents Marionette working - skipping;
      console.log('');
      console.warn(chalk.red(
        'Firefox 47 has an issue with getting values out of the window. ' +
        'Skipping test as a result.'
      ));
      console.log('');
      return;
    }

    queueUnitTest(browser);
  });
});
