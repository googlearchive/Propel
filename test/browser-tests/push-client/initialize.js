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

describe('Test PushClient Constructor', function() {
  const EMPTY_SW_PATH = '/test/data/empty-sw.js';
  const getUrlAndScope = function() {
    const reg = propel._registration;
    const sw = reg.installing || reg.waiting || reg.active;
    return Promise.resolve({url: sw.scriptURL, scope: reg.scope});
  };

  it('should throw an error when no fcm server ID is passed in', function() {
    return propel.initialize()
      .then(() => {
        throw new Error('Initialize should have failed with no input.');
      }, err => {
        err.message.should.contain('requires an FCM server key');
      });
  });

  it('should throw an error when a bad fcm server ID is passed in', function() {
    const badInputs = [
      '',
      [],
      {},
      123456789,
      true,
      false,
      null
    ];

    const promises = badInputs.map(badInput => {
      return propel.initialize(badInput)
      .then(() => {
        throw new Error('Initialize should have failed with no input.');
      }, err => {
        err.message.should.contain('requires an FCM server key');
      });
    });
    return Promise.all(promises);
  });

  it('should throw an error when a bad fcm server ID is passed in', function() {
    const badInputs = [
      '',
      [],
      {},
      123456789,
      true,
      false,
      null
    ];

    const promises = badInputs.map(badInput => {
      return propel.initialize(badInput)
      .then(() => {
        throw new Error('Initialize should have failed with no input.');
      }, err => {
        err.message.should.contain('requires an FCM server key');
      });
    });
    return Promise.all(promises);
  });

  it('should register when a valid fcm server ID is passed in', function() {
    return propel.initialize('valid-id')
    .then(() => {
      return getUrlAndScope();
    })
    .then(result => {
      window.chai.expect(result.url).to.contain('/dist/propel.js');
      window.chai.expect(result.scope).to.contain('/propel-v1.0.0/');
    });
  });

  it('should register when a valid fcm server ID is passed in with a service worker registration', function() {
    navigator.serviceWorker.register(EMPTY_SW_PATH)
    .then(registration => {
      return propel.initialize('valid-id', registration);
    })
    .then(() => {
      return getUrlAndScope();
    })
    .then(result => {
      window.chai.expect(result.url).to.contain(EMPTY_SW_PATH);
      window.chai.expect(result.scope).to.contain('/test/data');
    });
  });
});
