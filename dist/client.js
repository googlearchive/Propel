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
/* eslint-env browser */

'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _clientPushClient = require('./client/push-client');

var _clientPushClient2 = _interopRequireDefault(_clientPushClient);

var _clientServerUpdater = require('./client/server-updater');

var _clientServerUpdater2 = _interopRequireDefault(_clientServerUpdater);

window.goog = window.goog || {};
window.goog.propel = window.goog.propel || {
  Client: _clientPushClient2['default'],
  serverUpdater: _clientServerUpdater2['default']
};

},{"./client/push-client":4,"./client/server-updater":5}],2:[function(require,module,exports){
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

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var EventDispatch = (function () {
  function EventDispatch() {
    _classCallCheck(this, EventDispatch);

    this._eventTypes = new Map();
  }

  _createClass(EventDispatch, [{
    key: 'addEventListener',
    value: function addEventListener(eventType, listener) {
      if (!this._eventTypes.has(eventType)) {
        // Create a new set for this event type
        this._eventTypes.set(eventType, new Set());
      }

      this._eventTypes.get(eventType).add(listener);
    }
  }, {
    key: 'removeEventListener',
    value: function removeEventListener(eventType, listener) {
      if (!this._eventTypes.has(eventType)) {
        // No events of this type so nothing to do.
        return;
      }

      this._eventTypes.get(eventType)['delete'](listener);
    }
  }, {
    key: 'dispatchEvent',
    value: function dispatchEvent(event) {
      if (!this._eventTypes.has(event.type)) {
        // No events of this type so nothing to do.
        return;
      }

      var eventListeners = this._eventTypes.get(event.type);
      eventListeners.forEach(function (eventListener) {
        eventListener(event);
      });
    }
  }]);

  return EventDispatch;
})();

exports['default'] = EventDispatch;
module.exports = exports['default'];

},{}],3:[function(require,module,exports){
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

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var PushClientEvent = function PushClientEvent(type, data) {
  var _this = this;

  _classCallCheck(this, PushClientEvent);

  this.type = type;

  if (data) {
    var dataKeys = Object.keys(data);
    dataKeys.forEach(function (key) {
      _this[key] = data[key];
    });
  }
};

exports['default'] = PushClientEvent;
module.exports = exports['default'];

},{}],4:[function(require,module,exports){
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

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _subscriptionFailedError = require('./subscription-failed-error');

var _subscriptionFailedError2 = _interopRequireDefault(_subscriptionFailedError);

var _pushClientEvent = require('./push-client-event');

var _pushClientEvent2 = _interopRequireDefault(_pushClientEvent);

var _eventDispatch = require('./event-dispatch');

var _eventDispatch2 = _interopRequireDefault(_eventDispatch);

// document.currentScript is not supported in all browsers, but it IS supported
// in all browsers that support Push.
// TODO(mscales): Ensure that this script will not cause errors in unsupported
// browsers.
var currentScript = document.currentScript.src;

// Make the dummy service worker scope be relative to the library script. This
// means that you can have multiple projects hosted on the same origin without
// them interfering with each other, as long as they each use a different URL
// for the script.
var SCOPE = new URL('./goog.push.scope/', currentScript).href;
var WORKER_URL = new URL('./worker.js', currentScript).href;
var SUPPORTED = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window && 'permissions' in navigator && 'showNotification' in ServiceWorkerRegistration.prototype;

var registrationReady = function registrationReady(registration) {
  if (registration.active) {
    return Promise.resolve(registration.active);
  }

  var serviceWorker = registration.installing || registration.waiting;

  return new Promise(function (resolve, reject) {
    // Because the Promise function is called on next tick there is a
    // small chance that the worker became active already.
    if (serviceWorker.state === 'activated') {
      resolve(serviceWorker);
      return;
    }

    var stateChangeListener = function stateChangeListener() {
      if (serviceWorker.state === 'activated') {
        resolve(serviceWorker);
      } else if (serviceWorker.state === 'redundant') {
        reject(new Error('Worker became redundant'));
      } else {
        return;
      }
      serviceWorker.removeEventListener('statechange', stateChangeListener);
    };
    serviceWorker.addEventListener('statechange', stateChangeListener);
  });
};

/**
 * PushClient is a front end library that simplifies adding push to your
 * site.
 */

var PushClient = (function (_EventDispatch) {
  _inherits(PushClient, _EventDispatch);

  /**
   * Constructs a new PushClient.
   *
   * If the current browser has a push subscription then it will be
   * obtained in the constructor and a subscriptionChange event will be
   * dispatched.
   *
   * @param {Object} options - Options object should be included if you
   *  want to define any of the following.
   * @param {String} options.workerUrl - Service worker URL to be
   *  registered that will receive push events.
   * @param {String} options.scope - The scope that the Service worker should be
   *  registered with.
   */

  function PushClient(options) {
    _classCallCheck(this, PushClient);

    _get(Object.getPrototypeOf(PushClient.prototype), 'constructor', this).call(this);

    if (!PushClient.supported()) {
      throw new Error('Your browser does not support the web push API');
    }

    if (options) {
      if (options instanceof ServiceWorkerRegistration) {
        var serviceWorker = options.installing || options.waiting || options.active;
        this._workerUrl = serviceWorker.scriptURL;
        this._scope = options.scope;
      } else if (options instanceof Object) {
        this._workerUrl = options.workerUrl || WORKER_URL;
        this._scope = options.scope || SCOPE;
      } else {
        throw new Error('Invalid input into Client constructor.');
      }
    } else {
      this._workerUrl = WORKER_URL;
      this._scope = SCOPE;
    }

    // It is possible for the subscription to change in between page loads. We
    // should re-send the existing subscription when we initialise (if there is
    // one)
    this._dispatchStatusUpdate();
  }

  _createClass(PushClient, [{
    key: '_dispatchStatusUpdate',
    value: function _dispatchStatusUpdate() {
      var _this = this;

      return Promise.all([this.getSubscription(), PushClient.getPermissionState()]).then(function (results) {
        return {
          isSubscribed: results[0] !== null,
          currentSubscription: results[0],
          permissionState: results[1].state
        };
      }).then(function (status) {
        _this.dispatchEvent(new _pushClientEvent2['default']('statuschange', status));
      })['catch'](function (err) {
        console.warn('Unable to dispatch a status event ' + 'getSubscription() failed.', err);
      });
    }

    /**
     * This method will subscribe a use for push messaging.
     *
     * If permission isn't granted for push, this method will show the
     * permissions dialog before attempting to subscribe the user to push.
     *
     * @return {Promise<PushSubscription>} A Promise that
     *  resolves with a PushSubscription if successful.
     */
  }, {
    key: 'subscribe',
    value: _asyncToGenerator(function* () {
      // Check for permission
      var permissionStatus = yield this.requestPermission(false);

      if (permissionStatus !== 'granted') {
        this._dispatchStatusUpdate();
        throw new _subscriptionFailedError2['default'](permissionStatus);
      }

      this.dispatchEvent(new _pushClientEvent2['default']('requestingsubscription'));

      // Make sure we have a service worker and subscribe for push
      var reg = yield navigator.serviceWorker.register(this._workerUrl, {
        scope: this._scope
      });
      yield registrationReady(reg);
      var sub = yield reg.pushManager.subscribe({ userVisibleOnly: true })['catch'](function (err) {
        // This is provide a more helpful message when work with Chrome + GCM
        if (err.message === 'Registration failed - no sender id provided') {
          throw new _subscriptionFailedError2['default']('nogcmid');
        } else {
          throw err;
        }
      });

      this._dispatchStatusUpdate();

      return sub;
    })

    /**
     * This method will unsubscribe the user from push on the client side.
     *
     * @return {Promise} A Promise that
     *  resolves once the user is unsubscribed.
     */
  }, {
    key: 'unsubscribe',
    value: _asyncToGenerator(function* () {
      var registration = yield this.getRegistration();
      var subscription = undefined;
      var unsubscribePromise = Promise.resolve();

      if (registration) {
        subscription = yield registration.pushManager.getSubscription();

        if (subscription) {
          unsubscribePromise = yield subscription.unsubscribe();
        }
      }

      this._dispatchStatusUpdate();

      return unsubscribePromise;
    })

    /**
     * Get the registration of the service worker being used for push.
     *
     * @return {Promise<ServiceWorkerRegistration>} A Promise that
     *  resolves to either a ServiceWorkerRegistration or to null if none.
     */
  }, {
    key: 'getRegistration',
    value: _asyncToGenerator(function* () {
      var reg = yield navigator.serviceWorker.getRegistration(this._scope);
      if (reg && reg.scope === this._scope) {
        return reg;
      }

      return null;
    })

    /**
     * If the user is currently subscribed for push then the returned promise will
     * resolve with a PushSubscription object, otherwise it will resolve to null.
     *
     * This will not display the permission dialog.
     *
     * @return {Promise<PushSubscription>} A Promise that resolves with
     *  a PushSubscription or null.
     */
  }, {
    key: 'getSubscription',
    value: _asyncToGenerator(function* () {
      var registration = yield this.getRegistration();
      if (!registration) {
        return null;
      }

      return registration.pushManager.getSubscription();
    })

    /**
     * Will manage requesting permission for push messages, resolving
     * with the final permission status.
     * @return {Promise<String>} Permission status of granted, default or denied
     */
  }, {
    key: 'requestPermission',
    value: _asyncToGenerator(function* () {
      var _this2 = this;

      var dispatchStatusChange = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

      return navigator.permissions.query({ name: 'push', userVisibleOnly: true }).then(function (permissionState) {
        // Check if requesting permission will show a prompt
        if (permissionState.state === 'prompt') {
          _this2.dispatchEvent(new _pushClientEvent2['default']('requestingpermission'));
        }

        return new Promise(function (resolve) {
          return Notification.requestPermission(resolve);
        }).then(function (resolvedState) {
          if (dispatchStatusChange) {
            _this2._dispatchStatusUpdate();
          }
          return resolvedState;
        });
      });
    })

    /**
     * You can use this to decide whether to construct a new PushClient or not.
     * @return {Boolean} Whether the current browser has everything needed
     *  to use push messaging.
     */
  }], [{
    key: 'supported',
    value: function supported() {
      return SUPPORTED;
    }

    /**
     * This method can be used to check if subscribing the user will display
     * the permission dialog or not.
     * @return {Promise<PermissionStatus>} PermistionStatus.state will be
     * 'granted', 'denied' or 'prompt' to reflect the current permission state
     */
  }, {
    key: 'getPermissionState',
    value: function getPermissionState() {
      return navigator.permissions.query({ name: 'push', userVisibleOnly: true });
    }
  }]);

  return PushClient;
})(_eventDispatch2['default']);

exports['default'] = PushClient;
module.exports = exports['default'];

},{"./event-dispatch":2,"./push-client-event":3,"./subscription-failed-error":6}],5:[function(require,module,exports){
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

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = serverUpdater;

function serverUpdater(url, data) {
  return function (event) {
    // We only really care about subscription changes
    if (event.type !== 'statuschange') {
      return;
    }

    send(url, {
      action: event.isSubscribed ? 'subscribe' : 'unsubscribe',
      subscription: event.currentSubscription,
      data: data
    });
  };
}

function send(url, message) {
  return fetch(url, {
    method: 'post',
    body: JSON.stringify(message),
    headers: {
      'Content-Type': 'application/json'
    }
  });
}
module.exports = exports['default'];

},{}],6:[function(require,module,exports){
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

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MESSAGES = {
  'not supported': 'Your browser doesn\'t support push messaging.',
  'blocked': 'The user denied permission to show notifications.',
  'prompt': 'The user dismissed the notification permission dialog.',
  'endpoint': 'No endpoint URL specified.',
  'nogcmid': 'Please ensure you have a Web App Manifest with ' + 'a "gcm_sender_id" defined.'
};

var SubscriptionFailedError = (function (_Error) {
  _inherits(SubscriptionFailedError, _Error);

  function SubscriptionFailedError(type) {
    _classCallCheck(this, SubscriptionFailedError);

    _get(Object.getPrototypeOf(SubscriptionFailedError.prototype), 'constructor', this).call(this);

    this.message = 'Subscription failed.';
    if (MESSAGES[type]) {
      this.message += ' ' + MESSAGES[type];
    }

    this.type = type;
  }

  return SubscriptionFailedError;
})(Error);

exports['default'] = SubscriptionFailedError;
module.exports = exports['default'];

},{}]},{},[1]);
