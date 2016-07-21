'use strict';

const webPush = require('web-push');

const args = require('minimist')(process.argv.slice(2));

if (!args.subscription || !args.payload) {
  throw new Error('Bad Input - Sorry. Include --subscription and --payload');
}

// Just makes final output a little cleaner
console.log('');
console.log('');

const subscription = JSON.parse(args.subscription);
const payload = args.payload;

webPush.setGCMAPIKey('AIzaSyBBh4ddPa96rQQNxqiq_qQj7sq1JdsNQUQ');

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
})
.then(() => {
  // Just makes final output a little cleaner
  console.log('');
  console.log('');
});
