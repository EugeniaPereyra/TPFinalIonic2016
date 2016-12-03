angular.module('starter.controllers', ['starter.factories'])

.controller('controlLogin', function($scope, $state, $ionicLoading, $ionicPopup, $timeout, UsuarioBatallaService, serviceWorkerService, NotificationService ) {

  $scope.showLoading = function(textoParam) {
    if (textoParam)
    {
      $ionicLoading.show({
        template: '<div><ion-spinner icon="android"></ion-spinner><br><span>' + textoParam + '</span></div>'
      });
    }
    else
    {
      $ionicLoading.show({
      template: '<ion-spinner icon="android"></ion-spinner>'
      });
    }
  };

  $scope.hideLoading = function(){
        $ionicLoading.hide();
  };

  $scope.showPopup = function(titleParam, templateParam, okTypeParam){
    $ionicPopup.alert({
      title: titleParam,
      template: templateParam,
      okType: okTypeParam
    });
  };
  $scope.showPopup = function(titleParam, templateParam){
    $ionicPopup.alert({
      title: titleParam,
      template: templateParam
    });
  };
  $scope.MostrarEspera = function(mostrar){
    if (mostrar)
      $scope.showLoading('Aguardando al otro jugador...');
    else
      $scope.hideLoading();
  };

  $scope.loginData = {};

  $scope.Loguear = function() {
    // Start showing the progress
    $scope.showLoading();

    
    firebase.auth().signInWithEmailAndPassword($scope.loginData.username,$scope.loginData.password)
        .then(function(respuesta){
    
          $scope.loginData.username="";
          $scope.loginData.password="";
          $scope.hideLoading();



          try {
            // ES ANDROID
                      var tokenID;

                    FCMPlugin.getToken(
                        function (token) {
                            //alert('Token: ' + token);
                            console.log('Token: ' + token);
                        },
                        function (err) {
                            //alert('error retrieving token: ' + token);
                            console.log('error retrieving token: ' + err);
                        }
                    );

                    FCMPlugin.subscribeToTopic(respuesta.uid);
          }
          catch (err) {
            // ES WEB
                    serviceWorkerService.registerWorker();
                    serviceWorkerService.subscribe(function(){}, function(){}, function(token){
                      /*
                      UsuarioBatallaService.getByUserId(respuesta.uid).then(function(respuesta){
                          respuesta.token = token;

                          UsuarioBatallaService.saveById(respuesta.$id);

                        },function(error){
                          console.log(error);
                      })*/

                    }, 
                    function(mensaje){
                      $scope.showPopup('Mensaje entrante', 'Mensaje: ' + mensaje);
                    }); 


          }
  
          // SI EL USUARIO NO EXISTE O TIENE UNA BATALLA LE CREO UNA
          UsuarioBatallaService.getByUserId(respuesta.uid).then(function(resp){
                //console.info('Obtengo el usuario que inicio sesion para ver si tengo que crearle una batalla');
                //console.log(resp);
                
                if (!resp) {
                  var usuario = {};
                  usuario.id = respuesta.uid;
                  usuario.credito = 1000;
                  usuario.primerInicio = true;
                  usuario.nombre = respuesta.email;
                  usuario.email = respuesta.email;

                  
                  UsuarioBatallaService.add(usuario);
                  //console.log("usuario agregado");
                }
                else {
                  if (!resp.batalla) {
                    UsuarioBatallaService.addNewBatalla(respuesta.uid);
                  }
                }

                // PONGO EL USUARIO COMO ONLINE
                UsuarioBatallaService.setOnline(respuesta.uid);

              },function(error){
                console.log(error);
            })
          


          //if(firebase.auth().currentUser.emailVerified)
          //{
            $state.go('app.mostrar');
          //}
          //else
          //{
          //  Verificar();
          //}
          
        })
        .catch(function(error){
          console.info("Error: ",error);
          $scope.hideLoading();
          $scope.showPopup('Error', 'Usuario y/o password incorrectos!');
        });
  };

  $scope.Crear = function() {
    // Start showing the progress
    $scope.showLoading();

    firebase.auth().createUserWithEmailAndPassword($scope.loginData.username,$scope.loginData.password)
        .then(function(respuesta){
          //console.info("Respuesta: ",respuesta);
          $scope.loginData.username="";
          $scope.loginData.password="";
          
          var usuario = {};
          usuario.id = respuesta.uid;
          usuario.credito = 1000;
          usuario.primerInicio = true;
          usuario.nombre = respuesta.email;
          usuario.email = respuesta.email;

          
          UsuarioBatallaService.add(usuario);
          //console.log("usuario agregado");

          $scope.hideLoading(); 
          $scope.showPopup('Registrado!', 'Ya puede ingresar con su email y password');
        })
        .catch(function(error){
          console.info("Error: ",error);
          $scope.hideLoading();
          $scope.showPopup('Registro falló!', error);
        });
  };

  $scope.Resetear=function(){
    $scope.showLoading();
    firebase.auth().sendPasswordResetEmail($scope.loginData.username)
    .then(function(respuesta){
      $scope.hideLoading();
      console.info("Respuesta: ", respuesta);
      $scope.showPopup('Atencion', 'Por favor, revise su correo electronico!');
    })
    .catch(function(error){
      $scope.hideLoading();
      console.info("Error: ",error);
      $scope.showPopup('Error', 'Usuario y/o password incorrectos!');
    })
  }

  function Verificar(){
    $scope.showLoading();
    firebase.auth().currentUser.sendEmailVerification()
    .then(function(respuesta){
      $scope.hideLoading();
      console.info("Respuesta: ", respuesta);
      $scope.showPopup('Atencion', 'Necesita verificar su email. Por favor, revise su correo electronico!');
    })
    .catch(function(error){
      $scope.hideLoading();
      console.info("Error: ",error);
      $scope.showPopup('Error', 'Usuario y/o password incorrectos!');
    })
  }

  $scope.Logout = function() {
    UsuarioBatallaService.getByUserId(firebase.auth().currentUser.uid).then(function(respuesta){
      //console.info('Obtengo el usuario que inicio sesion');
      console.log("-- logout -- ");
      console.log(respuesta);
      respuesta.online = null;

      UsuarioBatallaService.saveById(respuesta.$id).then(function(){
        firebase.auth().signOut().then(function(){
          $state.go('login');
        })
      })
    },function(error){
      console.log(error);
      $state.go('login');
  })
    
  };

  $scope.Mostrar = function(){
    $state.go('app.misBatallas', {email: firebase.auth().currentUser.email} );
  }

  $scope.Aceptados = function(){
    $state.go('app.aceptados', {email: firebase.auth().currentUser.email} );
  }
  
  $scope.MostrarBatallas = function(){
    $state.go('app.mostrar');
  }

  $scope.NuevoBatalla = function(){
    $state.go('app.batalla');
  }

  $scope.Perfil = function(){
    $state.go('app.perfil');
  }

  $scope.Autor = function(){
    $state.go('app.autor');
  }
})

.controller('controlMostrar', function($scope, $state, $ionicPopup, $timeout, UsuarioBatallaService) {
  $scope.titulo="Usuarios Conectados";
  $scope.usuarios = [];
  $scope.userID = firebase.auth().currentUser.uid;
  $scope.UsuarioBatalla = {};
  $scope.primerVez = 1;
  $scope.MostrarNoHayUsuarios = false;
  $scope.idjugadorDos = '';

  $scope.showLoading();

  /* ----- SE PUEDE BORRAR -----*/
  UsuarioBatallaService.getAll().then(function(respuesta){
      //console.info('Obtengo todos los usuarios');
      //console.log(respuesta);
      $scope.usuarios = respuesta;

    },function(error){
      console.log(error);
  })
  
  UsuarioBatallaService.getByUserId($scope.userID).then(function(respuesta){
      //console.info('Obtengo el usuario que inicio sesion');
      console.log(respuesta);
      $scope.UsuarioBatalla = respuesta;

    },function(error){
      console.log(error);
  })

  $scope.hideLoading();  

  $scope.$watch('UsuarioBatalla.batalla.jugadorDos', function(new_fieldcontainer, old_fieldcontainer) {
      if ($scope.UsuarioBatalla.batalla && $scope.UsuarioBatalla.batalla.jugadorDos.id && !$scope.UsuarioBatalla.batalla.aceptada) {
        
        /* Cargo los datos del jugador desafiante para mostrar el mensaje */
        UsuarioBatallaService.getByUserId($scope.UsuarioBatalla.batalla.jugadorDos.id).then(function(respuesta){
            //$scope.showPopup('Nueva Batalla', 'El jugador ' + respuesta.nombre + ' te está desafiando.');
            var pregunta = $ionicPopup.confirm({
              title: 'Nueva Batalla',
              template: 'El jugador ' + respuesta.nombre + ' te está desafiando. ¿Aceptas?',
              cancelText: 'No acepto',
              okText: 'Acepto'
            });

            pregunta.then(function(res) {
              if(res) {

                //console.log('Se acepto el deafio');
                $scope.UsuarioBatalla.batalla.aceptada = true;
                $scope.UsuarioBatalla.batalla.quienJuega = $scope.UsuarioBatalla.batalla.jugadorDos.id;
              
              } 
              else {
                //console.log('No se acepto el desafio');
                $scope.UsuarioBatalla.batalla.aceptada = false;
                $scope.UsuarioBatalla.batalla.jugadorDos.id = '';
              }

              UsuarioBatallaService.saveById($scope.UsuarioBatalla.$id).then(function(){
                //console.info('Se modifico la batalla para aceptar/rechazar el desafio.');
            
                if(res) {
                  mostrarBatalla($scope.UsuarioBatalla.batalla.idBatalla);
                  $scope.MostrarEspera(true);
                }

              });

            });

          },function(error){
            console.log(error);
        });

      }
  });

  $scope.desafiar = function(jugadorDesafiado){
    
    UsuarioBatallaService.getByUserId(jugadorDesafiado.$id).then(function(respuesta){
        //console.info('Obtengo la batalla del usuario al que desafio.');
        //console.log(respuesta);
        
        if (respuesta) {
          respuesta.batalla.jugadorDos.id = $scope.userID;
          UsuarioBatallaService.saveById(respuesta.$id).then(function(){
            //console.info('Se modifico la batalla para generar el desafio.');
          });
        }
        $scope.MostrarEspera(true);
        $scope.BatallaContrincante = respuesta;

        var watcher = $scope.$watch('BatallaContrincante.batalla', function(new_value, old_value){
          //console.log('---- Se acepto o rechazo la batalla del otro jugador ---');
          
          if($scope.BatallaContrincante.batalla.jugadorDos.id == '' && !$scope.BatallaContrincante.batalla.aceptada){
            //console.log('Se rechazo la batalla');
            $scope.showPopup('Se rechazó la batalla', 'El jugador ' + $scope.BatallaContrincante.nombre + ' rechazó la batalla.');
            $scope.MostrarEspera(false);
            watcher();
          }
          else{
            if($scope.BatallaContrincante.batalla.jugadorDos.id == $scope.userID && $scope.BatallaContrincante.batalla.aceptada){
              //console.log('Se acepto la batalla');
              $scope.MostrarEspera(false);
              $scope.showPopup($scope.BatallaContrincante.nombre + ' ha aceptado la batalla', 'Tu inicias el juego.');
              watcher();

              mostrarBatalla($scope.BatallaContrincante.batalla.idBatalla);
            }
          }

        })

      },function(error){
        console.log(error);
    })
  };

  var mostrarBatalla = function(IdParam){
    $state.go('app.batalla', {Id:IdParam} );
  }
})

.controller('controlBatalla', function($scope, $ionicPopup, $state, $stateParams, $timeout, UsuarioBatallaService, $filter) {
  var IdBatalla = $stateParams.Id;
  $scope.currentUser = firebase.auth().currentUser;
  $scope.mensaje = "Seleccione sobre que botón desea colocar su apuesta";
  $scope.UsuarioBatalla = {};
  $scope.NombreJugadorUno = 'Jugador 1';
  $scope.NombreJugadorDos = 'Jugador 2';
  $scope.primerVez = 1;

  /* TRAE LA BATALLA QUE SE GENERO EN EL PASO ANTERIOR */
  UsuarioBatallaService.getByUserId(IdBatalla).then(function(respuesta){ //el id de batalla es el mismo que el de usr
      console.log(respuesta);
      $scope.UsuarioBatalla = respuesta;

      $scope.NombreJugadorUno = respuesta.nombre;
      UsuarioBatallaService.getByUserId(respuesta.batalla.jugadorDos.id).then(function(jugDos){
        
        $scope.NombreJugadorDos = jugDos.nombre;  
      })
      
    },function(error){
      console.log(error);
  })
  
  /* SETEA QUIEN ES EL JUGADOR QUE TIENE EL TURNO */
  $scope.$watch('UsuarioBatalla.batalla.quienJuega', function() {

    if ($scope.primerVez == 1) {
      $scope.primerVez = 2;
      return;
    }

    $scope.MostrarEspera($scope.UsuarioBatalla.batalla.quienJuega != $scope.currentUser.uid); //falta configurar un timer
    
    if ($scope.currentUser.uid == $scope.UsuarioBatalla.batalla.jugadorUno.id) {
      $scope.currentUser.uid = $scope.UsuarioBatalla.batalla.jugadorDos.id;
    }
    else {
      $scope.currentUser.uid = $scope.UsuarioBatalla.batalla.jugadorUno.id; 
    }

  });

  /* OBTIENE LOS CASILLEROS CON LOS QUE DEBE DIBUJAR LOS BOTONES EN LA VISTA */
  $scope.getCasilleros = function(userIDParam){
    switch ($scope.UsuarioBatalla.batalla.etapa) {
      case 1:
        if(userIDParam == $scope.UsuarioBatalla.batalla.jugadorUno.id) { 
          return $scope.UsuarioBatalla.batalla.jugadorUno.casilleros; 
        }
        else if (userIDParam == $scope.UsuarioBatalla.batalla.jugadorDos.id) { //pregunto por jugador 2 solo para evitar algun error en los id
          return $scope.UsuarioBatalla.batalla.jugadorDos.casilleros;
        }
      case 2:
        if(userIDParam == $scope.UsuarioBatalla.batalla.jugadorUno.id) { 
          return $scope.UsuarioBatalla.batalla.jugadorDos.casilleros; 
        }
        else if (userIDParam == $scope.UsuarioBatalla.batalla.jugadorDos.id) { //pregunto por jugador 2 solo para evitar algun error en los id
          return $scope.UsuarioBatalla.batalla.jugadorUno.casilleros;
        }
    }
  };

  $scope.getClass = function(itemId){
    switch ($scope.UsuarioBatalla.batalla.etapa) {
        case 1:
          if ($scope.currentUser.uid == $scope.UsuarioBatalla.batalla.jugadorUno.id) {
            return ($scope.UsuarioBatalla.batalla.jugadorUno.casilleroApostado == itemId);
          }
          else {
            return ($scope.UsuarioBatalla.batalla.jugadorDos.casilleroApostado == itemId);
          }
          break;
        case 2:
          /* SI ES LA ETAPA 2, TIENE "PINTAR" LOS CASILLEROS DEL OTRO JUGADOR QUE YA SE HAN MARCADO */
          if ($scope.currentUser.uid == $scope.UsuarioBatalla.batalla.jugadorUno.id) {
            casillero = $filter('filter')($scope.UsuarioBatalla.batalla.jugadorDos.casilleros, {id: itemId}, true); //devuelve array
            return (casillero[0].marcado);
          }
          else {
            casillero = $filter('filter')($scope.UsuarioBatalla.batalla.jugadorUno.casilleros, {id: itemId}, true); //devuelve array
            return (casillero[0].marcado);
          }
          break;
    } 
  }

  $scope.Seleccionar = function(event){
      
      var itemId = event.srcElement.id.slice(-1);
      var casillero;

      switch ($scope.UsuarioBatalla.batalla.etapa) {
        case 1:
            if ($scope.currentUser.uid == $scope.UsuarioBatalla.batalla.jugadorUno.id) {
              $scope.UsuarioBatalla.batalla.jugadorUno.casilleroApostado = itemId;
            }
            else {
              $scope.UsuarioBatalla.batalla.jugadorDos.casilleroApostado = itemId;
            }
            break;
        case 2:
            // Limpio el seleccionado marcando todos como false (solo puede estar seleccionado un casillero)
            //angular.forEach($scope.UsuarioBatalla.batalla.jugadorUno.casilleros, function(item){ item.marcado = false; });

            /* SI ES LA ETAPA 2, TIENE QUE IR MARCANDO LOS CASILLEROS DEL OTRO JUGADOR */
            if ($scope.currentUser.uid == $scope.UsuarioBatalla.batalla.jugadorUno.id) {
              casillero = $filter('filter')($scope.UsuarioBatalla.batalla.jugadorDos.casilleros, {id: itemId}, true); //devuelve array
              casillero[0].marcado = true;
            }
            else {
              casillero = $filter('filter')($scope.UsuarioBatalla.batalla.jugadorUno.casilleros, {id: itemId}, true); //devuelve array
              casillero[0].marcado = true;
            }
            break;
      }
  }

  $scope.Aceptar = function(){
    if ($scope.currentUser.uid == $scope.UsuarioBatalla.batalla.jugadorUno.id) {
      $scope.UsuarioBatalla.batalla.quienJuega = $scope.UsuarioBatalla.batalla.jugadorDos.id;
    }
    else {
      $scope.UsuarioBatalla.batalla.quienJuega = $scope.UsuarioBatalla.batalla.jugadorUno.id;
    }

    // SI ES LA 1° RONDA Y ES EL JUGADOR 2 HAY QUE CAMBIAR EL MODO DE JUEGO
    if ($scope.UsuarioBatalla.batalla.etapa == 1 && $scope.currentUser.uid == $scope.UsuarioBatalla.batalla.jugadorUno.id) 
    {
      $scope.UsuarioBatalla.batalla.etapa = 2;
    }

    if ($scope.UsuarioBatalla.batalla.etapa == 2) {
      if ($scope.currentUser.uid == $scope.UsuarioBatalla.batalla.jugadorUno.id) {
        var idApostado = $scope.UsuarioBatalla.batalla.jugadorDos.casilleroApostado;

        casillero = $filter('filter')($scope.UsuarioBatalla.batalla.jugadorDos.casilleros, {id: idApostado}, true); //devuelve array
        if (casillero[0].marcado == true){
          $scope.MostrarEspera(false);
          $scope.UsuarioBatalla.batalla.quienGano = $scope.UsuarioBatalla.batalla.jugadorUno.id;
          //$scope.showPopup('Ganaste!!', '');
        }
      }
      else {
        var idApostado = $scope.UsuarioBatalla.batalla.jugadorUno.casilleroApostado;

        casillero = $filter('filter')($scope.UsuarioBatalla.batalla.jugadorUno.casilleros, {id: idApostado}, true); //devuelve array
        if (casillero[0].marcado == true){
          $scope.MostrarEspera(false);
          //$scope.showPopup('Ganaste!!', '');
          $scope.UsuarioBatalla.batalla.quienGano = $scope.UsuarioBatalla.batalla.jugadorDos.id;
        }
      }
    }

    UsuarioBatallaService.saveById($scope.UsuarioBatalla.$id);  
  }

  $scope.$watch('UsuarioBatalla.batalla.quienGano', function(){
    if($scope.UsuarioBatalla.batalla.quienGano){
      $scope.MostrarEspera(false);
      if ($scope.currentUser.uid == $scope.UsuarioBatalla.batalla.quienGano) {
        $scope.showPopup('Ganaste la batalla', 'Felicitaciones! Has acertado al casillero elegido por tu contrincante antes de que él acerte al tuyo!');
      }
      else {
        $scope.showPopup('Perdiste la batalla', 'Han acertado a tu casillero! La próxima seguro tendrás mas suerte.');
      }

      $state.go('app.mostrar');

      // SE LIMPIA LA BATALLA PISANDOLA CON UNA NUEVA
      UsuarioBatallaService.addNewBatalla($scope.UsuarioBatalla.batalla.jugadorUno.id);
    }
  })
})

.controller('controlApuesta', function($scope, $ionicPopup, $state, $stateParams, $timeout, UsuarioBatallaService) {
  
  $scope.FinalizarBatalla = function(resultado) {
    $scope.UsuarioBatalla.computado = true;
    $scope.UsuarioBatalla.disponible = false;

    BatallaService.save($scope.UsuarioBatalla);
    console.info("Batalla modificado");

    if (resultado) { //gané

      $scope.usuario.credito += $scope.UsuarioBatalla.valor;
      UsuarioBatallaService.save($scope.usuario).then(function(){
        console.info("Usuario " + $scope.usuario.$id + " modificado (+" + $scope.UsuarioBatalla.valor + ")");
        $scope.showPopup('Felicitaciones :)', 'Ganaste ' + $scope.UsuarioBatalla.valor + ' créditos.');
      });
      
      UsuarioBatallaService.getById($scope.UsuarioBatalla.jugador).then(function(respuesta){
        if(respuesta){
          respuesta.credito -= $scope.UsuarioBatalla.valor;
          console.info("Usuario " + $scope.UsuarioBatalla.jugador + " modificado (-" + $scope.UsuarioBatalla.valor + ")");
        }
      },function(error){
        console.log(error);
      });

    }
    else { //perdí

      $scope.usuario.credito -= $scope.UsuarioBatalla.valor;
      UsuarioBatallaService.save($scope.usuario).then(function(){
        console.info("Usuario " + $scope.usuario.$id + " modificado (-" + $scope.UsuarioBatalla.valor + ")");
        $scope.showPopup('Que pena :(', 'Perdiste ' + $scope.UsuarioBatalla.valor + ' créditos.');
      });
      
      UsuarioBatallaService.getById($scope.UsuarioBatalla.jugador).then(function(respuesta){
        if(respuesta){
          respuesta.credito += $scope.UsuarioBatalla.valor;
          console.info("Usuario " + $scope.UsuarioBatalla.jugador + " modificado (+" + $scope.UsuarioBatalla.valor + ")");
        }
      },function(error){
        console.log(error);
      });

    }
  }
})

.controller('controlAceptados', function($scope, $state, UsuarioBatallaService, $timeout) {
  $scope.mostrar=false;
  $scope.aceptados=true;
  $scope.todos=false;
  $scope.titulo="Batallas Aceptados";
  $scope.userID = firebase.auth().currentUser.uid;
  $scope.datos=[];
  $scope.DateNow = new Date().getTime();
  
  $scope.showLoading();
  
  BatallaService.getAll().then(function(respuesta){
    $scope.datos=respuesta;
    $scope.hideLoading(); 
  },function(error){
    console.log(error);
  });

  $scope.Terminado=function(batalla){
      batalla.disponible=false;
      BatallaService.save(batalla);
  }
})


.controller('controlMisBatallas', function($scope, $state, UsuarioBatallaService, $timeout) {
  $scope.userID = firebase.auth().currentUser.uid;
  $scope.titulo="Mis Batallas";
  $scope.mostrar=true;
  $scope.todos=false;
  $scope.aceptados=false;
  $scope.DateNow = new Date().getTime();
  $scope.datos=[];
  
  $scope.showLoading();

  BatallaService.getAll().then(function(respuesta){
    $scope.datos=respuesta;
    $scope.hideLoading(); 
  },function(error){
    console.log(error);
  });

  $scope.mostrarBatalla = function(index){
    $state.go('app.apuesta', {batalla:index} );
  }

  $scope.Terminado=function(batalla){ //callback del timer
      batalla.disponible=false;
      BatallaService.save(batalla);
  }
})

.controller('controlPerfil', function($scope, $state, UsuarioBatallaService) {
  $scope.usuario = {};
  $scope.showLoading();

  var id = firebase.auth().currentUser.uid;
  UsuarioBatallaService.getById(id).then(function(respuesta){
    $scope.usuario = respuesta;
    $scope.usuario.mail = firebase.auth().currentUser.email;
    $scope.hideLoading(); 
  },function(error){
    console.log(error);
  });
  
})

.controller('AutorCtrl', function($scope) {
  $scope.autor={};
  $scope.autor.nombre="Maria Eugenia Pereyra";
  $scope.autor.foto="img/autor.jpg";
  $scope.autor.email="meugeniape@gmail.com";
  $scope.autor.github="https://github.com/EugeniaPereyra";
});
