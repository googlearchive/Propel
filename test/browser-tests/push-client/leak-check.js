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

// This is a test and we want descriptions to be useful, if this
// breaks the max-length, it's ok.

/* eslint-disable max-len, no-unused-expressions */
/* eslint-env browser, mocha */

'use strict';

describe('Test for Leaks', function() {
  it('should load window.propel without leaks', function(done) {
    // By leaks this is referring to the only thing Propel
    // should add to the global scope (i.e. window) is propel
    const scriptElement = document.createElement('script');
    scriptElement.setAttribute('type', 'text/javascript');
    scriptElement.src = '/dist/propel.js';
    document.querySelector('head').appendChild(scriptElement);
    scriptElement.onerror = () => {
      done(new Error('Unable to load script.'));
    };
    scriptElement.onload = () => {
      window.propel.should.be.defined;

      done();
    };
  });
});
