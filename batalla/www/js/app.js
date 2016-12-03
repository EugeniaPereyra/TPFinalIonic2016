// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.factories','timer', 'ngCordova' ])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

    try {
        FCMPlugin.onNotification(
            function(data){
                if(data.wasTapped){
                    //Notification was received on device tray and tapped by the user.
                    alert("Tapped: " +  JSON.stringify(data) );
                }else{
                    //Notification was received in foreground. Maybe the user needs to be notified.
                    alert("Not tapped: " + JSON.stringify(data) );
                }
            },
            function(msg){
                //alert('onNotification callback successfully registered: ' + msg);
                console.log('onNotification callback successfully registered: ' + msg);
            },
            function(err){
                //alert('Error registering onNotification callback: ' + err);
                console.log('Error registering onNotification callback: ' + err);
            }
        );
    }
    catch (err) {
      console.log('No es Android. Error: '+ err);
    }

  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'controlLogin'
  })

  .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'controlLogin'
  })

  .state('app.mostrar', {
    url: '/mostrar',
    cache: false,
    views: {
      'menuContent': {
          templateUrl: 'templates/mostrar.html',
          controller: 'controlMostrar'
        }
      }
  })

  .state('app.batalla', {
    url: '/batalla/:Id',
    views: {
      'menuContent': {
          templateUrl: 'templates/batalla.html',
          controller: 'controlBatalla'
        }
      }
  })

  .state('app.perfil', {
    url: '/perfil',
    views: {
      'menuContent': {
        templateUrl: 'templates/perfil.html',
        controller: 'controlPerfil'
      }
    }
  })

  .state('app.autor', {
    url: '/autor',
    views: {
      'menuContent': {
          templateUrl: 'templates/autor.html',
          controller: 'AutorCtrl'
        }
      }
  })

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');
});
