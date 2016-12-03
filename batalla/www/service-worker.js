//
// * ********* * Service worker code: firebase-messaging-sw.js * ********* *
//
'use strict';
console.log('Starting service worker');

if( 'function' === typeof importScripts) {

  importScripts('https://www.gstatic.com/firebasejs/3.5.0/firebase-app.js');
  importScripts('https://www.gstatic.com/firebasejs/3.5.0/firebase-messaging.js');
  //importScripts('core/decoder.js');

  // Initialize the Firebase app in the service worker by passing in the
  // messagingSenderId.
  firebase.initializeApp({
    'messagingSenderId': '156549433397'
  });

  // Retrieve an instance of Firebase Messaging so that it can handle background
  // messages.
  const messaging = firebase.messaging();

  //var decoder = new Decoder();


  messaging.setBackgroundMessageHandler(function(payload) {
    var data = payload || {};
    //var shinyData = decoder.run(data);

    console.log('[firebase-messaging-sw.js] Received background message ', payload, shinyData);

    /*
    return self.registration.showNotification(shinyData.title, {
      body: shinyData.body,
      icon: shinyData.icon,
      data: {url: shinyData.tag}
    })
    */
    return self.registration.showNotification( payload );

  });

  /*
  self.addEventListener('push', function(event) {
    console.log('Received a push message', event);
    var data = {};
    if (event.data) {
      // Chrome does not seem to support it for now
      data = event.data.json();
      console.log('Data received in push message', data);
      // if (port) port.postMessage(data);
    }
    var shinyData = decoder.run(data);
    show(event, shinyData);
  });
*/
  self.addEventListener('notificationclick', function(event) {
    console.log('On notification click: ', event.notification.data.url);
    // Android doesn’t close the notification when you click on it
    // See: http://crbug.com/463146
    event.notification.close();

    // This looks to see if the current is already open and
    // focuses if it is
    console.log('Notification click: data.url ', event.notification.data.url);
    event.notification.close();
    var url = /localhost:3999|dev-piquemeup.firebaseapp.com/;
    var newurl = "/chat";
    if (event.notification.data.url) {
        newurl = event.notification.data.url;
    }

    function endsWith(str, suffix) {
      return str.indexOf(suffix, str.length - suffix.length) !== -1;
    }

    event.waitUntil(
        clients.matchAll({
            type: 'window'
        })
        .then(function(windowClients) {
            for (var i = 0; i < windowClients.length; i++) {
                var client = windowClients[i];
                if (url.test(client.url) && 'focus' in client) {
                    if (endsWith(client.url, "/app.html#" + newurl)) {
                      console.log("******** Yes it matched *******");
                      return client.focus();
                    }
                    return client.navigate("/app.html#" + newurl)
                      .then(client => client.focus());
                }
            }
            if (clients.openWindow) {
                return clients.openWindow("/app.html#" + newurl);
            }
        })
    );

  });

}