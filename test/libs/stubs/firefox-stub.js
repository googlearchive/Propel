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

class FFStateStub extends window.BaseStateStub {
  constructor() {
    super();
  }

  restore() {
    window.netscape.security.PrivilegeManager
      .enablePrivilege('UniversalXPConnect');
    window.Components.utils.import('resource://gre/modules/Services.jsm');

    const uri = Services.io.newURI(window.location.origin, null, null);
    const principal = Services.scriptSecurityManager
      .getNoAppCodebasePrincipal(uri);
    Services.perms.addFromPrincipal(principal, 'desktop-notification',
      Services.perms.PROMPT_ACTION);
  }

  stubNotificationPermissions(newState) {
    let permissionState;
    switch (newState) {
      case 'granted':
        permissionState = Services.perms.ALLOW_ACTION;
        break;
      case 'denied':
        permissionState = Services.perms.DENY_ACTION;
        break;
      case 'default':
        permissionState = Services.perms.PROMPT_ACTION;
        break;
      default:
        throw new Error(`Unexpected permission state given: '${newState}' `);
    }

    window.netscape.security.PrivilegeManager
      .enablePrivilege('UniversalXPConnect');
    window.Components.utils.import('resource://gre/modules/Services.jsm');

    // ALLOW_ACTION, DENY_ACTION, PROMPT_ACTION
    const uri = Services.io.newURI(window.location.origin, null, null);
    const principal = Services.scriptSecurityManager
      .getNoAppCodebasePrincipal(uri);
    Services.perms.addFromPrincipal(principal, 'desktop-notification',
      permissionState);
  }

  stubSWRegistration() {
    // NOOP - We use actual SW registration etc
  }

  stubSubscription() {
    // NOOP - We use actual push manage subscriptions etc
  }
}

window.FFStateStub = FFStateStub;
