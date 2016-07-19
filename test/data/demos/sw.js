'use strict';

/* eslint-env browser, serviceworker */

importScripts('/dist/propel-sw.js');

console.log('Calling propel.messaging()');

// Needed to indicate propel should handle push
propel.messaging();
