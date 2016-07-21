window.generateNodeCommand = (subscription, payload) => {
  let subscriptionString = JSON.stringify(subscription).replace(/"/g, "\\\"");
  let payloadString = payload.replace(/"/g, "\\\"");

  let args = `--subscription "${subscriptionString}" --payload "${payloadString}"`;

  let nodeCommand = `node ./test/data/node-backend/index.js ${args}`;

  return nodeCommand;
};

window.copyToClipboard = function(text) {
  let clipboardElement = document.querySelector('.js-hidden-clipboard');
  if (!clipboardElement) {
    clipboardElement = document.createElement('textarea');
    clipboardElement.classList.add('js-hidden-clipboard');
    clipboardElement.style.width = '1px';
    clipboardElement.style.height = '1px';
    clipboardElement.style.overflow = 'hidden';

    document.body.appendChild(clipboardElement);
  }

  clipboardElement.value = text;

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
