/*
  Copyright 2015 Google Inc. All Rights Reserved.
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
/* eslint-env browser */

/**
 * PushWorker is a front end library that simplifies adding push to your
 * site.
 */
export default class PushWorker {
  getNotifications(tagName) {
    if (typeof tagName !== 'undefined' && typeof tagName !== 'string') {
      throw new Error('The optional tagName argument must be a string if set');
    }

    if (tagName && tagName.length === 0) {
      throw new Error('The optional tagName cannot be an empty String');
    }

    return self.registration.getNotifications({
      tag: tagName
    });
  }

  getOpenWindows(filter) {
    if (typeof filter !== 'undefined') {
      if (typeof filter !== 'string' && !(filter instanceof RegExp)) {
        return Promise.reject('getOpenWindows expects the optional filter ' +
          'to be either a string of a url or a regex.');
      }
    }

    // Filter should be a string or regex
    return self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    })
    .then(clientWindows => {
      if (!filter) {
        return clientWindows;
      }

      return clientWindows.filter(clientWindow => {
        if (typeof filter === 'string') {
          if (clientWindow.url === filter) {
            return true;
          }
        } else if (filter instanceof RegExp) {
          if (filter.test(clientWindow.url)) {
            return true;
          }
        }

        return false;
      });
    });
  }

  getVisibleWindows(filter) {
    return this.getWindows(filter)
    .then(openWindows => {
      return openWindows.filter(openWindow => {
        console.log(openWindow);
        return true;
      });
    });
  }
}
