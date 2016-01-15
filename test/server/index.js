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

'use strict';

/* eslint-env node */

var path = require('path');
var express = require('express');
var app = express();

// Set up static assets and add service worker allowed header in case it's
// needed for registering SW during tests
app.use('/test/browser-tests/',
  express.static(path.join(__dirname, '..', 'browser-tests/'), {
    setHeaders: function(res) {
      res.setHeader('Service-Worker-Allowed', '/');
    }
  })
);

// Allow all assets in the project to be served, including any
// required js code from the project
app.use('/', express.static(path.join(__dirname, '..', '..')));

// If the user tries to go to the root of the test server, redirect them
// to /test/
app.get('/', function(req, res) {
  res.redirect('/test/');
});

// Start service on port 8888
var server = app.listen(8888, function() {
  console.log('Example app listening at http://localhost:%s',
    server.address().port);
});
