'use strict';
angular.module('starter.factories', ["firebase"])
    //Service
    .service('UsuarioBatallaService', ["$firebaseArray", "$firebaseObject",
        function($firebaseArray, $firebaseObject){
            this.ref = firebase.database().ref('USUARIOBATALLA/');
            this.arrayUsuarioBatalla = $firebaseArray(this.ref);

            this.setOnline = function(uid){
                var self = this;
                var connectedRef = firebase.database().ref('.info/connected');
                var connected = $firebaseObject(connectedRef);
                var online =  $firebaseArray(self.ref.child(uid+'/online'));

                connected.$watch(function(){
                    if(connected.$value === true){
                        online.$add(true).then(function(connectedRef){
                            connectedRef.onDisconnect().remove();
                        });
                    }
                });
            }

            this.getAll = function(){
                    return this.arrayUsuarioBatalla.$loaded().then(function(datos){
                        return datos;
                    })
            };

            this.getByIndex = function(index){
                    return this.arrayUsuarioBatalla.$loaded().then(function(datos){
                        return datos[index];
                    })
            };

            this.getByUserId = function(id){
                    return this.arrayUsuarioBatalla.$loaded().then(function(datos){
                        return datos.$getRecord(id);
                    })
            };

            this.add = function(usuario){
                    var self = this;
                    var refUsuarios = firebase.database().ref().child('USUARIOBATALLA/' + usuario.id);
                    refUsuarios.set( {  credito: usuario.credito, 
                                        primerInicio: usuario.primerInicio, 
                                        nombre: usuario.nombre,
                                        email: usuario.email
                                    }, 
                        function(error){
                            if (error)
                                console.log("Error al guardar el usaurio. Detalle: " + error)
                            else {
                                console.log("Se agrego el usuario " + usuario.id + "a la base de datos."); 
                                self.addNewBatalla(usuario.id);
                            }
                        });
            };
            this.addNewBatalla = function(idUsuario){
                    var refNuevaBatalla = firebase.database().ref('USUARIOBATALLA/' + idUsuario + '/batalla');
                    return refNuevaBatalla.set( {  
                                                        idBatalla: idUsuario,
                                                        vigente: true,
                                                        etapa: 1,
                                                        quienJuega: '',
                                                        quienGano: '',
                                                        aceptada: false,
                                                        jugadorUno: { id: idUsuario,
                                                                      casilleroApostado: 0,
                                                                      valorApuesta: 0,
                                                                      casilleros: [ {"id":"1", "marcado":false},
                                                                                    {"id":"2", "marcado":false},
                                                                                    {"id":"3", "marcado":false},
                                                                                    {"id":"4", "marcado":false}]
                                                                    },
                                                        jugadorDos: { id: '',
                                                                      casilleroApostado: 0,
                                                                      valorApuesta: 0,
                                                                      casilleros: [ {"id":"1", "marcado":false},
                                                                                    {"id":"2", "marcado":false},
                                                                                    {"id":"3", "marcado":false},
                                                                                    {"id":"4", "marcado":false}]
                                                                    }
                                                
                    }, function(error){
                        if (error)
                                console.log("Error al generar una nueva batalla. Detalle: " + error)
                            else {
                                console.log("Se agrego la batalla al usuario " + idUsuario); 
                            }
                    })
                };

            this.save = function(index){
                    return this.arrayUsuarioBatalla.$loaded().then(function(datos){
                        return datos.$save(index);
                    })
            };

            this.saveById = function(id){
                var self = this;
                return this.arrayUsuarioBatalla.$loaded().then(function(datos){
                    self.getByUserId(id).then(function(item){
                        datos.$save(item);    
                    })
                    
                })
            };

            this.remove = function(id){
                var self = this;
                return this.arrayUsuarioBatalla.$loaded().then(function(datos){
                    self.getByUserId(id).then(function(item){
                        datos.$remove(item);    
                    })
                    
                })
            }
        }
    ])

.service('NotificationService', ["$http", 
    function ($http) {
      var url = "https://fcm.googleapis.com/fcm/send"; 

      function getURL(){
        return url;
      }

      this.sendNotification = function (uid, title, icon, body) {
        var http = new XMLHttpRequest();
        var url = getURL();
        var params = JSON.stringify(
                                    {
                                      to:"/topics/" + uid,
                                      notification:{
                                                      title : title,
                                                      icon : icon, 
                                                      body : body,
                                                      priority : 10
                                                    }
                                    });

        http.open("POST", url, true);
        http.setRequestHeader("Content-type", "application/json");
        http.setRequestHeader('Authorization', 'key=AIzaSyCijPiOGmmrAWQ8-liUaY-kAVdVBYuh880');

        http.onreadystatechange = function() {
            if(http.readyState == 4 && http.status == 200) {
                console.log(http.responseText);
            }
        }
        http.send(params);
      }
    }
])

//
// serviceWorkerService.js
//

// .service('serviceWorkerService', ['$q', '$http', '$location', '$timeout',
//   function($q, $http, $location, $timeout) {
//     var noTokenError = new Error('No Instance ID token available');
//     var noPermissionError = new Error('Unable to get permission to notify');
//     this.messaging = firebase.messaging();

//     this.unsubscribe = null;
//     this.unsubscribeTokenRefresh = null;
//     this.registerWorkerPromise = null;
//     this.tokenPermissionPromise = null;

//     this.registerWorker = function () {
//       return this.getRegistration();
//     };

//     this.setUpHandlers = function (onTokenRefresh, onMessage) {
//       // Callback fired if Instance ID token is updated.
//       var self = this;

//       this.unsubscribeTokenRefresh = this.messaging.onTokenRefresh(function() {
//         // token just refreshed, lets delete our saved Promise
//         delete self.tokenPermissionPromise;
//         self.getSubscription()
//           .then(function(refreshedToken) {
//             console.log('Token refreshed.');
//             onTokenRefresh(refreshedToken);
//           })
//           .catch(function(err) {
//             console.log('Unable to retrieve refreshed token ', err);
//           });
//       });

//       this.unsubscribeMessages = this.messaging.onMessage(function(payload) {
//         console.log("Message received. ", payload);
//         onMessage(payload);
//       });
//     }

//     this.subscribe = function (onUI, onLog, onToken, onMessage) {
//       var deferred = $q.defer();
//       var self = this;

//       onUI = onUI || function() {};
//       onLog = onLog || console.log;
//       onToken = onToken || function() {};
//       onMessage = onMessage || function() {};

//       // we dont want to cache this promise, because user may have changed the permission anytime
//       this.messaging.requestPermission()
//         .then(function() {
//           onLog('Notification permission granted.');
//           self.getSubscription()
//             .then(function(currentToken) {
//               if (currentToken) {
//                 deferred.resolve(currentToken);
//                 onLog('Notification token retrieved.');
//                 onToken(currentToken);
//               } else {
//                 // Show permission UI.
//                 //updateUIForPushPermissionRequired();
//                 deferred.reject(noTokenError);
//                 onUI({action: 'showPermissionUI'});
//               }
//             })
//             .catch(function(err) {
//               deferred.reject(noTokenError);
//               onLog('An error occurred while retrieving token. ', err);
//             });
//         })
//         .catch(function(err) {
//           deferred.reject(noPermissionError);
//           onLog('An error occurred while retrieving token. ', err);
//         });

//       this.setUpHandlers(onToken, onMessage);
//       return deferred.promise;
//     };

//     this.unsubscribe = function() {
//       this.unsubscribeTokenRefresh();
//       this.unsubscribeMessages();
//       delete this.registerWorkerPromise;
//       delete this.tokenPermissionPromise;
//       var deferred = $q.defer();
//       deferred.resolve();
//       return deferred.promise;
//     };

//     this.getRegistration = function () {
//       if (this.registerWorkerPromise) return this.registerWorkerPromise;

//       var self = this;
//       var deferred = $q.defer();

//       if ('serviceWorker' in navigator) {
//         //console.log('Service Worker is supported');
//         navigator.serviceWorker.register('service-worker.js')
//           .then(function (reg) {
//             self.messaging.useServiceWorker(reg);
//             deferred.resolve();
//             //console.log('Registration successful', reg);
//           }).catch(function (e) {
//             deferred.reject(e);
//             console.error('Registration unsuccessful', e);
//           });
//       } else {
//           deferred.resolve();
//       }

//       this.registerWorkerPromise = deferred.promise;
//       return this.registerWorkerPromise;
//     }

//     this.getSubscription = function () {
//       if (this.tokenPermissionPromise) return this.tokenPermissionPromise;
//       this.tokenPermissionPromise = this.messaging.getToken();
//       return this.tokenPermissionPromise;
//     };

//   }
// ]);
