'use strict';

/* eslint-env serviceworker */

importScripts('/dist/propel-sw.js');

propel.messaging();

// Dispatch a fake push message when requested
self.addEventListener('message', function(event) {
  switch (event.data.command) {
    case 'dummy-push': {
      const pushData = {data: JSON.stringify(event.data.data)};
      const pushEvent = new self.PushEvent('push', pushData);
      this.dispatchEvent(pushEvent);

      event.ports[0].postMessage({status: 'ok'});
      break;
    }
    default:
      // This will be handled by the outer .catch().
      event.ports[0].postMessage({
        error: 'Unknown command: ' + event.data.command
      });
  }
});
