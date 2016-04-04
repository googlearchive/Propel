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

const removeAllNotifications = () => {
  return self.registration.getNotifications()
  .then(notifications => {
    return Promise.all(
      notifications.map(notification => {
        return notification.close();
      })
    );
  });
};

self.setUpTests = () => {
  describe('Test getNotifications() with \'default\' permission state', function() {
    // Ensure we start with no notifications between tests
    beforeEach(removeAllNotifications);
    after(removeAllNotifications);

    if (Notification.permission !== 'default') {
      console.warn('Skipping default - getNotifications() tests due to no Notification permission');
      return;
    }

    it('should resolve to an array regardless of permission state', function() {
      return self.goog.propel.worker.helpers.getNotifications()
      .then(notifications => {
        (notifications instanceof Array).should.equal(true);
      });
    });
  });
};
