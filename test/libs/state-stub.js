'use strict';

/* eslint-env browser */

const sinon = window.sinon;

const DEFAULT_PERMISSION_STATE = 'prompt';

class StateStub {
  constructor() {
    this.allStubs = [];

    this._currentPermission = DEFAULT_PERMISSION_STATE;
    this._currentRegistration = null;

    // navigator.permissions.query
    const permissionQueryStub = sinon.stub(navigator.permissions, 'query',
      opts => {
        if (opts && opts.name === 'push' && opts.userVisibleOnly === true) {
          return Promise.resolve({
            state: this.permissionState
          });
        }

        return Promise.reject(new Error('Unexpected input to ' +
          'navigator.permissions.query'));
      });

    // Notification.requestPermission
    const permissionRequestStub = sinon.stub(Notification, 'requestPermission',
      cb => {
        cb(this.permissionState);
      });

    // navigator.serviceWorker.register
    const registerStub = sinon.stub(
      navigator.serviceWorker, 'register', (swurl, options) => {
        if (this._currentRegistration) {
          this._currentRegistration.scope = options.scope;
        }
        return Promise.resolve(this._currentRegistration);
      });

    // navigator.serviceWorker.getRegistration
    const getRegistrationStub = sinon.stub(
      navigator.serviceWorker, 'getRegistration', scope => {
        if (this._currentRegistration) {
          this._currentRegistration.scope = scope;
        }
        return Promise.resolve(this._currentRegistration);
      });

    this.allStubs.push(permissionQueryStub);
    this.allStubs.push(permissionRequestStub);
    this.allStubs.push(registerStub);
    this.allStubs.push(getRegistrationStub);
  }

  restore() {
    this.allStubs.forEach(stub => {
      stub.restore();
    });
  }

  get permissionState() {
    return this._currentPermission;
  }

  set permissionState(newState) {
    this._currentPermission = newState;
  }

  get registration() {
    return this._currentRegistration;
  }

  set registration(reg) {
    this._currentRegistration = reg;
  }
}

window.StateStub = StateStub;
