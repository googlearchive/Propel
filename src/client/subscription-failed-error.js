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

const MESSAGES = {
  'not supported': 'Your browser doesn\'t support push messaging.',
  'denied': 'The user denied permission to show notifications.',
  'default': 'The user dismissed the notification permission dialog.',
  'endpoint': 'No endpoint URL specified.',
  'nogcmid': 'Please ensure you have a Web App Manifest with ' +
    'a "gcm_sender_id" defined.'
};

export default class SubscriptionFailedError extends Error {
  constructor(type) {
    super();

    this.message = 'Subscription failed.';
    if (MESSAGES[type]) {
      this.message += ' ' + MESSAGES[type];
    }

    this.type = type;
  }
}
