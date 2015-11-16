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
/* eslint-env serviceworker */

'use strict';

self.addEventListener('notificationclick', function(event) {
  event.waitUntil(event.notification.close());
});

let pushWorker = {
  async getClientWindows({visibleOnly=false, url=null} = {}) {
    try {
      let windows = clients.matchAll({
        type: 'window',
        includeUncontrolled: true
      });

      if (url) {
        windows = windows.filter((c) => c.url === url);
      }

      if (visibleOnly) {
        windows =
            windows.filter((c) => c.focused && c.visibilityState === 'visible');
      }

      return windows;
    } catch (error) {
      // Couldn't get client list, possibly not yet implemented in the browser
      return [];
    }
  }
};

self.goog = self.goog || {};
self.goog.push = self.goog.push || {};
self.goog.push.worker = pushWorker;
