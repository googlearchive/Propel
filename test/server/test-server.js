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

var express = require('express');

class TestServer {
  constructor(addDefaultRoutes) {
    if (
      typeof addDefaultRoutes !== 'undefined' &&
      typeof addDefaultRoutes !== 'boolean'
    ) {
      throw new Error('addDefaultRoutes must be a boolean value');
    }

    this._server = null;
    this._app = express();
    this._useDefaults = false;

    if (typeof addDefaultRoutes === 'undefined' || addDefaultRoutes) {
      this._useDefaults = true;
      this.addDefaultRoutes();
    }
  }

  addDefaultRoutes() {
    // If the user tries to go to the root of the server, redirect them
    // to the browser test path
    this._app.get('/', function(req, res) {
      res.redirect('/test/browser-tests/');
    });

    this._app.get('/test/iframe/*', function(req, res) {
      res.send('hello');
    });
  }

  getExpressApp() {
    return this._app;
  }

  startServer(path, portNumber, host) {
    if (this._server) {
      this._server.close();
    }

    // 0 will pick a random port number
    if (typeof portNumber === 'undefined') {
      portNumber = 0;
    }

    if (typeof host === 'undefined') {
      host = 'localhost';
    }

    // Allow all assets in the project to be served, including any
    // required js code from the project
    //
    // Add service worker allowed header to avoid any scope restrictions
    // NOTE: NOT SAFE FOR PRODUCTION!!!
    if (this._useDefaults) {
      this._app.use('/', express.static(path, {
        setHeaders: function(res) {
          res.setHeader('Service-Worker-Allowed', '/');
        }
      }));
    }

    return new Promise(resolve => {
      // Start service on desired port
      this._server = this._app.listen(portNumber, host, () => {
        resolve(this._server.address().port);
      });
    });
  }

  killServer() {
    if (this._server) {
      this._server.close();
      this._server = null;
    }
  }
}

module.exports = TestServer;
