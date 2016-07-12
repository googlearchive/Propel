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

describe('Test PushClient.createClient()', function() {
  if (!window.isPropelClientSupported) {
    return;
  }

  const EMPTY_SW_PATH = '/test/browser-tests/push-client/empty-sw.js';
  const ERROR_MESSAGES = {
    'bad factory': 'The PushClient.createClient() method expects a service ' +
      'worker path and an option scope string.',
    'bad constructor': 'The PushClient constructor expects a service ' +
      'worker registration. Alternatively, you can use ' +
      'PropelClient.createClient() to create a PropelClient with a service ' +
      'worker path string and an optional scope string.',
    'redundant worker': 'Worker became redundant'
  };

  const getUrlAndScope = function(client) {
    const reg = client.getRegistration();
    const sw = reg.installing || reg.waiting || reg.active;
    return Promise.resolve({url: sw.scriptURL, scope: reg.scope});
  };

  it('should throw an error for no arguments', function(done) {
    return window.goog.propel.PropelClient.createClient()
    .then(done)
    .catch(err => {
      err.message.should.equal(ERROR_MESSAGES['bad factory']);
      done();
    });
  });

  it('should throw an error for Object as argument', function(done) {
    return window.goog.propel.PropelClient.createClient({})
    .then(done)
    .catch(err => {
      err.message.should.equal(ERROR_MESSAGES['bad factory']);
      done();
    });
  });

  it('should throw an error for Array as argument', function(done) {
    return window.goog.propel.PropelClient.createClient([])
    .then(done)
    .catch(err => {
      err.message.should.equal(ERROR_MESSAGES['bad factory']);
      done();
    });
  });

  it('should throw an error for null as argument', function(done) {
    return window.goog.propel.PropelClient.createClient(null)
    .then(done)
    .catch(err => {
      err.message.should.equal(ERROR_MESSAGES['bad factory']);
      done();
    });
  });

  it('should throw an error for an empty string as argument', function(done) {
    return window.goog.propel.PropelClient.createClient('')
    .then(done)
    .catch(err => {
      err.message.should.equal(ERROR_MESSAGES['bad factory']);
      done();
    });
  });

  it('should be able to create a new push client with a workerUrl', function(done) {
    return window.goog.propel.PropelClient.createClient(EMPTY_SW_PATH)
    .then(pushClient => {
      return getUrlAndScope(pushClient)
      .then(result => {
        window.chai.expect(result.url).to.contain(EMPTY_SW_PATH);
        window.chai.expect(result.scope).to.contain('/test/browser-tests/push-client');

        done();
      });
    })
    .catch(done);
  });

  it('should be able to create a new push client with a workerUrl and scope', function(done) {
    return window.goog.propel.PropelClient.createClient(EMPTY_SW_PATH, './push-service')
    .then(pushClient => {
      return getUrlAndScope(pushClient)
      .then(result => {
        window.chai.expect(result.url).to.contain(EMPTY_SW_PATH);
        window.chai.expect(result.scope).to.contain('/test/browser-tests/push-service');

        done();
      });
    })
    .catch(done);
  });
});
