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
    this._eventTypes = new Map();
  }

  addEventListener(eventType, listener) {
    if (!this._eventTypes.has(eventType)) {
      // Create a new set for this event type
      this._eventTypes.set(eventType, new Set());
    }

    this._eventTypes.get(eventType).add(listener);
  }

  removeEventListener(eventType, listener) {
    if (!this._eventTypes.has(eventType)) {
      // No events of this type so nothing to do.
      return;
    }

    this._eventTypes.get(eventType).delete(listener);
  }

  dispatchEvent(event) {
    let eventListeners = this._eventTypes.get(event.type);
    eventListeners.forEach(eventListener => {
      eventListener(event);
    });
  }
}
