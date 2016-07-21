// This is just for constructing CURL command
function getGCMInfo(subscription, payload, apiKey) {
  const headers = {};

  headers.Authorization = `key=${apiKey}`;
  headers['Content-Type'] = `application/json`;

  const endpointSections = subscription.endpoint.split('/');
  const subscriptionId = endpointSections[endpointSections.length - 1];
  const gcmAPIData = {
    to: subscriptionId,
    data: payload
  };

  return {
    headers: headers,
    body: JSON.stringify(gcmAPIData),
    endpoint: 'https://android.googleapis.com/gcm/send'
  };
}

window.generateCurlCommand = subscription => {
  const defaultPushData = {
    notification: {
      title: 'Hello',
      body: 'This is a test'
    },
    data: {
      example: 'I\'m example data'
    }
  };

  const gcmInfo = getGCMInfo(subscription, defaultPushData,
    'AIzaSyBBh4ddPa96rQQNxqiq_qQj7sq1JdsNQUQ');

  let curlCommand = `curl "${gcmInfo.endpoint}" --request POST`;

  Object.keys(gcmInfo.headers).forEach(header => {
    curlCommand += ` --header "${header}: ${gcmInfo.headers[header]}"`;
  });

  curlCommand += ` -d ${JSON.stringify(gcmInfo.body)}`;

  return curlCommand;
};

window.copyToClipboard = function(text) {
  let clipboardElement = document.querySelector('.js-hidden-clipboard');
  if (!clipboardElement) {
    clipboardElement = document.createElement('div');
    clipboardElement.classList.add('js-hidden-clipboard');
    clipboardElement.style.width = '1px';
    clipboardElement.style.height = '1px';
    clipboardElement.style.overflow = 'hidden';

    document.body.appendChild(clipboardElement);
  }

  clipboardElement.textContent = text;

  var range = document.createRange();
  range.selectNode(clipboardElement);
  window.getSelection().addRange(range);

  try {
    // Now that we've selected the anchor text, execute the copy command
    var successful = document.execCommand('copy');
    var msg = successful ? 'successful' : 'unsuccessful';
    console.log('Copy command was ' + msg);
  } catch (err) {
    console.log('Oops, unable to copy');
  }

  // Remove the selections - NOTE: Should use
  // removeRange(range) when it is supported
  // window.getSelection().removeAllRanges();
};
