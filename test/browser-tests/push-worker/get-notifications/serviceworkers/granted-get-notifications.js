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
  describe('Test getNotifications() with \'granted\' permission state', function() {
    // Ensure we start with no notifications between tests
    beforeEach(removeAllNotifications);
    after(removeAllNotifications);

    it('should resolve to an array regardless of permission state', function() {
      return self.goog.propel.worker.helpers.getNotifications()
      .then(notifications => {
        (notifications instanceof Array).should.equal(true);
      });
    });

    if (Notification.permission !== 'granted') {
      console.warn('Skipping getNotifications() tests due to no Notification permission');
      return;
    }

    it('should resolve to an empty array ', function() {
      return self.goog.propel.worker.helpers.getNotifications()
      .then(notifications => {
        (notifications instanceof Array).should.equal(true);
        notifications.length.should.equal(0);
      });
    });

    it('should resolve to an array containing a single notification', function() {
      const currentTime = new Date().getTime().toString();

      return self.registration.showNotification(currentTime)
      .then(() => {
        return self.goog.propel.worker.helpers.getNotifications();
      })
      .then(notifications => {
        (notifications instanceof Array).should.equal(true);
        notifications.length.should.equal(1);

        const titles = notifications.map(notification => {
          return notification.title;
        });
        titles.indexOf(currentTime).should.not.equal(-1);
      });
    });

    it('should resolve to an array containing three notifications', function() {
      const currentTime = new Date().getTime().toString();

      return Promise.all([
        registration.showNotification(currentTime + '1'),
        registration.showNotification(currentTime + '2'),
        registration.showNotification(currentTime + '3')
      ])
      .then(() => {
        return self.goog.propel.worker.helpers.getNotifications();
      })
      .then(notifications => {
        (notifications instanceof Array).should.equal(true);
        notifications.length.should.equal(3);

        const titles = notifications.map(notification => {
          return notification.title;
        });
        titles.indexOf(currentTime + '1').should.not.equal(-1);
        titles.indexOf(currentTime + '2').should.not.equal(-1);
        titles.indexOf(currentTime + '3').should.not.equal(-1);
      });
    });

    it('should resolve to an empty array due to no notifications, with example-tag passed in', function() {
      return self.goog.propel.worker.helpers.getNotifications('example-tag')
      .then(notifications => {
        (notifications instanceof Array).should.equal(true);
        notifications.length.should.equal(0);
      });
    });

    it('should resolve to an empty array due to no notifications with the same tag', function() {
      const currentTime = new Date().getTime().toString();

      return Promise.all([
        registration.showNotification(currentTime + '1'),
        registration.showNotification(currentTime + '2'),
        registration.showNotification(currentTime + '3')
      ])
      .then(() => {
        return self.goog.propel.worker.helpers.getNotifications('example-tag');
      })
      .then(notifications => {
        (notifications instanceof Array).should.equal(true);
        notifications.length.should.equal(0);
      });
    });

    it('should resolve to an array with single notification matching tag', function() {
      const currentTime = new Date().getTime().toString();
      const tagName = currentTime + '-tag';
      return Promise.all([
        registration.showNotification(currentTime + '1'),
        registration.showNotification(currentTime + '2'),
        registration.showNotification(currentTime + '3', {
          tag: tagName
        })
      ])
      .then(() => {
        return self.goog.propel.worker.helpers.getNotifications(tagName);
      })
      .then(notifications => {
        (notifications instanceof Array).should.equal(true);
        notifications.length.should.equal(1);
        const titles = notifications.map(notification => {
          return notification.title;
        });
        titles.indexOf(currentTime + '3').should.not.equal(-1);
      });
    });

    it('should resolve to an array with single notification matching tag ignoring other tagged notifications', function() {
      const currentTime = new Date().getTime().toString();
      const tagName = currentTime + '-tag';
      return Promise.all([
        registration.showNotification(currentTime + '1', {
          tag: 'other-tag'
        }),
        registration.showNotification(currentTime + '2', {
          tag: 'other-tag'
        }),
        registration.showNotification(currentTime + '3', {
          tag: tagName
        })
      ])
      .then(() => {
        return self.goog.propel.worker.helpers.getNotifications(tagName);
      })
      .then(notifications => {
        (notifications instanceof Array).should.equal(true);
        notifications.length.should.equal(1);
        const titles = notifications.map(notification => {
          return notification.title;
        });
        titles.indexOf(currentTime + '3').should.not.equal(-1);
      });
    });

    it('should resolve to an array with two notifications matching tag', function() {
      const currentTime = new Date().getTime().toString();
      const tagName = currentTime + '-tag';
      return Promise.all([
        registration.showNotification(currentTime + '1', {
          tag: tagName
        }),
        registration.showNotification(currentTime + '2'),
        registration.showNotification(currentTime + '3', {
          tag: tagName
        })
      ])
      .then(() => {
        return self.goog.propel.worker.helpers.getNotifications(tagName);
      })
      .then(notifications => {
        (notifications instanceof Array).should.equal(true);
        notifications.length.should.equal(2);
        const titles = notifications.map(notification => {
          return notification.title;
        });
        titles.indexOf(currentTime + '1').should.not.equal(-1);
        titles.indexOf(currentTime + '3').should.not.equal(-1);
      });
    });

    it('should resolve to an array with two notifications matching tag ignoring other tagged notifications', function() {
      const currentTime = new Date().getTime().toString();
      const tagName = currentTime + '-tag';
      return Promise.all([
        registration.showNotification(currentTime + '1', {
          tag: tagName
        }),
        registration.showNotification(currentTime + '2', {
          tag: 'other-tag'
        }),
        registration.showNotification(currentTime + '3', {
          tag: tagName
        })
      ])
      .then(() => {
        return self.goog.propel.worker.helpers.getNotifications(tagName);
      })
      .then(notifications => {
        (notifications instanceof Array).should.equal(true);
        notifications.length.should.equal(2);
        const titles = notifications.map(notification => {
          return notification.title;
        });
        titles.indexOf(currentTime + '1').should.not.equal(-1);
        titles.indexOf(currentTime + '3').should.not.equal(-1);
      });
    });
  });
};
