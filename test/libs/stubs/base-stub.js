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

/* eslint-env browser */

class BaseStateStub {
  constructor() {
    this.ERROR_REGISTRATION = 0;

    this.ERROR_SUBSCRIPTION = 0;
    this.NULL_SUBSCRIPTION = 1;
    this.VALID_SUBSCRIPTION = 2;
  }

  restore() {
    throw new Error('restore() must be overriden');
  }

  stubNotificationPermissions() {
    throw new Error('stubNotificationPermissions() must be overriden');
  }

  stubSWRegistration() {
    throw new Error('stubSWRegistration() must be overriden');
  }

  stubSubscription() {
    throw new Error('stubSubscription() must be overriden');
  }
}

window.BaseStateStub = BaseStateStub;
