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

(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _workerNotificationHandler = require('./worker/notification-handler');

var _workerNotificationHandler2 = _interopRequireDefault(_workerNotificationHandler);

self.goog = self.goog || {};
self.goog.propel = self.goog.propel || {};
self.goog.propel.worker = { notificationHandler: _workerNotificationHandler2['default'] };

},{"./worker/notification-handler":2}],2:[function(require,module,exports){
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
/* global PushEvent */

/**
 * A handler for push events that shows notifications based on the content of
 * the payload.
 *
 * The payload must be a JSON-encoded Object with a `notification` key. The
 * value of the `notification` property will be used as the NotificationOptions
 * object passed to showNotification. Additionally, the `title` property of the
 * notification object will be used as the title.
 *
 * If there is no notification data in the payload, or if there is no body or
 * title specified, then no notification will be shown.
 *
 * @param  {PushEvent} event The event that we are handling
 * @param  {Object} defaults If an option is not provided in the payload then
 *   the value of the same key in the defaults object will be used instead.
 * @return {boolean}         true if a notification was shown, false otherwise
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = notificationHandler;

function notificationHandler(event) {
  var defaults = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  if (!event || !(event instanceof PushEvent)) {
    throw new Error('notificationHandler expects argument 1 to be a PushEvent');
  }

  if (!event.data) {
    // Nothing to do, no payload
    return false;
  }

  var data = undefined;

  try {
    data = JSON.parse(event.data);
  } catch (e) {
    console.log('Couldn\'t parse notification data as JSON, ignoring');
    return false;
  }

  if (!data.notification) {
    // Nothing to do, the payload didn't include any notification details
    return false;
  }

  var options = Object.assign({}, defaults, data.notification);

  if (!options.title || !options.body) {
    console.log('WARN: Notification data found, but no title or body provided');
    return false;
  }

  event.waitUntil(self.registration.showNotification(options.title, options));

  return true;
}

module.exports = exports['default'];

},{}]},{},[1]);
