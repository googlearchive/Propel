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

'use strict';

export default class EventDispatch {
  constructor() {
    this._eventTypes = {};
  }

  addEventListener(eventType, listener) {
    if (!this._eventTypes[eventType]) {
      this._eventTypes[eventType] = [];
    }

    if (this._eventTypes[eventType].indexOf(listener) === -1) {
      // Need to add listener to the array
      this._eventTypes[eventType].push(listener);
    }
  }

  removeEventListener(eventType, listener) {
    if (!this._eventTypes[eventType]) {
      // No events of this type so nothing to do.
      return;
    }

    var indexOfListener = this._eventTypes[eventType].indexOf(listener);
    if (indexOfListener !== -1) {
      // Need to add listener to the array
      this._eventTypes[eventType].splice(indexOfListener, 1);
    }
  }

  dispatchEvent(event) {
    var eventListeners = this._eventTypes[event.type];
    eventListeners.map(eventListener => {
      eventListener(event);
    });
  }
}
