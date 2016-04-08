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

/* eslint-disable max-len, no-unused-expressions */
/* eslint-env worker, serviceworker, mocha */

importScripts('/test/libs/sw-mocha-runner.js');
importScripts('/dist/propel-worker.js');

self.setUpTests = () => {
  describe('Test getOpenWindows() Multiple Windows Tests', function() {
    const testPage = self.location.origin +
      '/test/browser-tests/push-worker/get-open-windows/test.html';
    const fakePage = self.location.origin + '/test/browser-tests/non-existant';

    it('should reject when argument is an array', function(done) {
      return self.goog.propel.worker.helpers.getOpenWindows([])
      .then(done => done(new Error('Should have rejected')))
      .catch(() => done());
    });

    it('should reject when argument is an object', function(done) {
      return self.goog.propel.worker.helpers.getOpenWindows({})
      .then(done => done(new Error('Should have rejected')))
      .catch(() => done());
    });

    it('should resolve to an array with any page matching current origin', function() {
      return self.goog.propel.worker.helpers.getOpenWindows()
      .then(windows => {
        (windows instanceof Array).should.equal(true);
        windows.forEach(windowClient => {
          windowClient.url.indexOf(self.location.origin).should.equal(0);
        });
      });
    });

    it('should resolve to an empty array when passing in a non-existant path', function() {
      return self.goog.propel.worker.helpers.getOpenWindows(fakePage)
      .then(windows => {
        (windows instanceof Array).should.equal(true);
        windows.length.should.equal(0);
      });
    });

    it('should resolve to an array of two when passing in the known path', function() {
      return self.goog.propel.worker.helpers.getOpenWindows(testPage)
      .then(windows => {
        (windows instanceof Array).should.equal(true);
        windows.length.should.equal(2);
      });
    });

    it('should resolve to an array of two when passing in the service worker scope path', function() {
      return self.goog.propel.worker.helpers.getOpenWindows(self.registration.scope)
      .then(windows => {
        (windows instanceof Array).should.equal(true);
        windows.length.should.equal(2);
      });
    });

    it('should resolve to an single item array for regex of known path', function() {
      return self.goog.propel.worker.helpers.getOpenWindows(
        /\/test\/browser-tests\/push-worker\/get-open-windows\/test.html/)
      .then(windows => {
        (windows instanceof Array).should.equal(true);
        windows.length.should.equal(2);
      });
    });

    it('should resolve to an array of /test/ urls from regex', function() {
      return self.goog.propel.worker.helpers.getOpenWindows(/\/test\/.*/)
      .then(windows => {
        (windows instanceof Array).should.equal(true);
        windows.forEach(windowClient => {
          windowClient.url.indexOf(self.location.origin + '/test')
            .should.equal(0);
        });
      });
    });
  });
};
