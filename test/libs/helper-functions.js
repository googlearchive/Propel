/**
 * Copyright 2016 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

/* eslint-env browser */

window.testHelper = {
  unregisterAllRegistrations: function() {
    return navigator.serviceWorker.getRegistrations()
      .then(registrations => {
        return Promise.all(registrations.map(registration => {
          registration.unregister();
        }));
      });
  },

  clearAllCaches: function() {
    return window.caches.keys()
      .then(cacheNames => {
        return Promise.all(cacheNames.map(cacheName => {
          window.caches.delete(cacheName);
        }));
      });
  },

  // Helper to unregister all service workers and clean all caches
  // This should be called before each test
  cleanState: function() {
    return Promise.all([
      this.unregisterAllRegistrations(),
      this.clearAllCaches()
    ])
    .then(() => {
      var iframeList = document.querySelectorAll('.js-test-iframe');
      for (var i = 0; i < iframeList.length; i++) {
        iframeList[i].parentElement.removeChild(iframeList[i]);
      }
    });
  }
};
