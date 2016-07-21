


var messaging = window.propel.messaging('sw.js');

messaging.onError(err => {
  console.error('Error was received', err);
});

messaging.onMessage(msg => {
  console.log('onMessage?');
  const listElement = document.querySelector('.js-message-list');
  const listItemElement = document.createElement('li');
  listItemElement.textContent = JSON.stringify(msg);

  listElement.appendChild(listItemElement);
});

messaging.onRegistrationToken(subscription => {
  const regElement = document.querySelector('.js-reg-token');
  regElement.textContent = JSON.stringify(subscription);

  const curlButton = document.querySelector('.js-get-curl');
  curlButton.addEventListener('click', () => {
    const curlCommand = window.generateCurlCommand(subscription);
    window.copyToClipboard(curlCommand);
  });
});
