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

// Services is available in FF if we have correct flags set
// (See automated-test-suite.js for what is set)
/* global Services */
/* eslint-env browser */

window.StateStub = {
  getStub: forceFullStub => {
    if (forceFullStub) {
      return new window.FullStateStub();
    }

    let useFFPermissions = false;

    if (
      typeof window.netscape !== 'undefined' &&
      typeof window.netscape.security !== 'undefined' &&
      typeof window.netscape.security.PrivilegeManager !== 'undefined'
    ) {
      // IF here we are in FF with ability to alter permission state
      window.netscape.security.PrivilegeManager
        .enablePrivilege('UniversalXPConnect');
      window.Components.utils.import('resource://gre/modules/Services.jsm');

      useFFPermissions = (typeof Services !== 'undefined');
    }

    if (useFFPermissions) {
      return new window.FFStateStub();
    }

    return new window.FullStateStub();
  }
};
