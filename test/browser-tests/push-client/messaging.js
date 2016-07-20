describe('Test Messaging Function', function() {
  const expect = window.chai.expect;

  const addManifest = function() {
    const currentLink = document.querySelector('link[rel=manifest]');
    if (currentLink) {
      return;
    }

    const linkElement = document.createElement('link');
    linkElement.rel = 'manifest';
    linkElement.href = '/test/data/demo/manifest.json';
    document.head.appendChild(linkElement);
  };

  const sendMessage = function(serviceworker, command, message) {
    // This wraps the message posting/response in a promise, which will resolve if the response doesn't
    // contain an error, and reject with the error if it does. If you'd prefer, it's possible to call
    // controller.postMessage() and set up the onmessage handler independently of a promise, but this is
    // a convenient wrapper.
    return new Promise(function(resolve, reject) {
      var messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = function(event) {
        if (event.data.error) {
          reject(event.data.error);
        } else {
          resolve(event.data);
        }
      };

      // This sends the message data as well as transferring messageChannel.port2 to the service worker.
      // The service worker can then use the transferred port to reply via postMessage(), which
      // will in turn trigger the onmessage handler on messageChannel.port1.
      // See https://html.spec.whatwg.org/multipage/workers.html#dom-worker-postmessage
      serviceworker.postMessage({
        command: command,
        data: message
      }, [messageChannel.port2]);
    });
  };

  before(function() {
    return new Promise((resolve, reject) => {
      const scriptElement = document.createElement('script');
      scriptElement.setAttribute('type', 'text/javascript');
      scriptElement.src = '/dist/propel.js';
      document.querySelector('head').appendChild(scriptElement);
      scriptElement.onerror = () => {
        reject(new Error('Unable to load script.'));
      };
      scriptElement.onload = () => {
        resolve();
      };
    });
  });

  beforeEach(function() {
    const linkElements = document.querySelectorAll('link[rel=manifest]');
    for (let i = 0; i < linkElements.length; i++) {
      linkElements[i].parentElement.removeChild(linkElements[i]);
    }

    return window.goog.swUtils.cleanState();
  });

  it('should throw an error on bad input', function() {
    const badInputs = [
      {},
      [],
      1,
      -1,
      null
    ];

    badInputs.forEach(badInput => {
      expect(() => {
        window.propel.messaging(badInput);
      }).to.throw('propel.messaging() expects the ' +
        'first parameter to be a string to the path of your service ' +
        'worker file.');
    });
  });

  it('should throw an error on no input', function() {
    expect(() => {
      window.propel.messaging();
    }).to.throw('propel.messaging() expects the ' +
      'first parameter to be a string to the path of your service ' +
      'worker file.');
  });

  it('should throw an error on a non-existant service worker file', function() {
    return new Promise(resolve => {
      const messaging = window.propel.messaging('/non/existant/path/sw.js');
      messaging.onError(err => {
        (err.message.indexOf('Unable to register service worker')).should.not.equal(-1);
        resolve();
      });
    });
  });

  it('should throw an error on subscribe failing', function() {
    // Currently fails due to no web app manifest
    return new Promise(resolve => {
      const messaging = window.propel.messaging('/test/data/demo/sw.js');
      messaging.onError(err => {
        (err.message.indexOf('Unable to subscribe user for push messages.')).should.not.equal(-1);
        resolve();
      });
    });
  });

  it('should receive registration token with valid service worker', function() {
    return new Promise((resolve, reject) => {
      addManifest();

      const messaging = window.propel.messaging('/test/data/demo/sw.js');
      messaging.onError(err => {
        reject(err);
      });

      messaging.onRegistrationToken(token => {
        token.should.be.defined;
        resolve();
      });
    });
  });

  it('should receive a message while the page is focused', function() {
    this.timeout(5000);

    window.focus();

    const pushData = {
      test: 'Hello, World'
    };

    return new Promise((resolve, reject) => {
      addManifest();

      const messaging = window.propel.messaging('/test/data/demo/sw.js');
      messaging.onError(err => {
        reject(err);
      });

      messaging.onRegistrationToken(token => {
        token.should.be.defined;

        navigator.serviceWorker.getRegistrations()
        .then(registrations => {
          registrations.forEach(registration => {
            const serviceWorker = registration.installing ||
              registration.active;
            if (serviceWorker.scriptURL === window.location.origin + '/test/data/demo/sw.js' &&
              registration.scope.indexOf('propel-v1.0.0') !== -1) {
              sendMessage(serviceWorker, 'dummy-push', pushData);
            }
          });
        });
      });

      messaging.onMessage(msg => {
        msg.test.should.equal(pushData.test);

        resolve();
      });
    });
  });
});
