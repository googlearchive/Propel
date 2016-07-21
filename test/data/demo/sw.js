'use strict';

/* eslint-env serviceworker */

importScripts('/test/third_party/sinon-1.17.3.js');
importScripts('/dist/propel-sw.js');

// Set stubs if needed
if (self.location.search.indexOf('force-notification=true') !== -1) {
  const stub = self.sinon.stub(clients, 'matchAll');
  stub.returns(
    Promise.resolve()
    .then(() => {
      console.warn('Using stubbed clients.matchAll');
      return [];
    })
  );
}

const messaging = propel.messaging();
messaging.onMessage(() => {
  // This will pass in the data for the message - just not used here for testing
  return self.registration.showNotification('Default Title', {
    body: 'Default Body',
    icon: 'http://dummyimage.com/600/000/ffffff.jpg&text=Default'
  });
});

// Dispatch a fake push message when requested
self.addEventListener('message', function(event) {
  console.log('Received message');
  switch (event.data.command) {
    case 'dummy-push': {
      console.log('Got a message from window -  creating fake push event');
      const pushData = {data: JSON.stringify(event.data.data)};
      const pushEvent = new self.PushEvent('push', pushData);
      this.dispatchEvent(pushEvent);

      event.ports[0].postMessage({status: 'ok'});
      break;
    }
    default:
      console.error('Unknown push command: ', event);
      // This will be handled by the outer .catch().
      event.ports[0].postMessage({
        error: 'Unknown command: ' + event.data.command
      });
  }
});
