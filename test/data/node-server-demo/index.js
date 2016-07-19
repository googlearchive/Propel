'use strict';

const webPush = require('web-push');

const subscription = '<Put subscription here>';

function doPush() {
  webPush.setGCMAPIKey('AIzaSyBBh4ddPa96rQQNxqiq_qQj7sq1JdsNQUQ');
  const payload = JSON.stringify({
    notification: {
      title: 'Test Title',
      body: 'Test Body'
    }
  });

  return webPush.sendNotification(subscription.endpoint, {
    userPublicKey: subscription.keys.p256dh,
    userAuth: subscription.keys.auth,
    payload: payload
  })
  .then(result => {
    console.log('Result: ', result);
  })
  .catch(err => {
    console.log(err);
  });
}

doPush();
