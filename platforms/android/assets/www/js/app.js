// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', [
  'ionic', 
  'starter.controllers', 
  'starter.factories',
  'timer',
  'menu.controllers'
  ])

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
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('app', {
    url: '/app',
    abstract: true,
    cache: false,
    templateUrl: 'templates/menu.html',
    controller: 'controlMenu'
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

    .state('app.desafio', {
    url: '/desafio',
    views: {
      'menuContent': {
          templateUrl: 'templates/desafio.html',
          controller: 'controlDesafio'
        }
      }
    })

    .state('app.apuesta', {
    url: '/apuesta/:desafio',
    views: {
      'menuContent': {
          templateUrl: 'templates/apuesta.html',
          controller: 'controlApuesta'
        }
      }
  })

    .state('app.aceptados', {
    url: '/aceptados',
    cache: false,
    views: {
      'menuContent': {
          templateUrl: 'templates/mostrar.html',
          controller: 'controlAceptados'
        }
      }
  })

    .state('app.misDesafios', {
    url: '/misDesafios',
    cache: false,
    views: {
      'menuContent': {
          templateUrl: 'templates/mostrar.html',
          controller: 'controlMisDesafios'
        }
      }
  })

  .state('app.creditos', {
    url: '/creditos',
    views: {
      'menuContent': {
          templateUrl: 'templates/creditos.html',
          controller: 'CreditosCtrl'
        }
      }
  })

  .state('app.perfil', {
    url: '/perfil',
    cache: false,
    views: {
      'menuContent': {
        templateUrl: 'templates/perfil.html',
        controller: 'controlPerfil'
      }
    }
  })

  .state('app.cargar', {
    url: '/cargar',
    cache: false,
    views: {
      'menuContent': {
        templateUrl: 'templates/cargar.html',
        controller: 'controlCargar'
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
