angular.module('starter.controllers', ['starter.factories'])

.controller('controlLogin', function($scope, $state, $ionicLoading, $ionicPopup, $timeout, UsuarioBatallaService, NotificationService ) {
  $scope.imagen={};
  $scope.imagen.foto="Pirate-Ship.png";

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
    return $ionicPopup.alert({
      title: titleParam,
      template: templateParam,
      okType: okTypeParam
    });
  };
  $scope.showPopup = function(titleParam, templateParam){
    return $ionicPopup.alert({
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
  var usuarios=[];
  var puente = [];
  var encontrado = false;
  var usuario={};

  $scope.Loguear = function() {
    // Start showing the progress
    $scope.showLoading();

    
    firebase.auth().signInWithEmailAndPassword($scope.loginData.username,$scope.loginData.password)
        .then(function(respuesta){
          //console.info("Respuesta: ",respuesta);
          $scope.loginData.username="";
          $scope.loginData.password="";

          $scope.UsuarioLogueado=firebase.auth().currentUser;
          UsuarioBatallaService.getAll().then(function(respuesta){
            puente=respuesta;
            usuarios=puente.map(function(dato){
              if(dato.$id==$scope.UsuarioLogueado.uid)
              {
                encontrado=true;
                usuario=dato;
              }
            })
            $scope.hideLoading();
            if(encontrado)
            {
              try {
                   FCMPlugin.subscribeToTopic($scope.UsuarioLogueado.uid);
              }
              catch (err) {
                  // ES WEB
                  console.log("LOS PLUGINS SOLO FUNCIONA EN CELULARES");
              }
              if(!usuario.batalla)
              {
                 UsuarioBatallaService.addNewBatalla(respuesta.uid);
              }
              UsuarioBatallaService.setOnline(respuesta.uid);
              $state.go('app.mostrar');
            }
            else
            {
              $scope.UsuarioLogueado=firebase.auth().currentUser;
              var usuario = {};
              usuario.id = firebase.auth().currentUser.uid;
              usuario.credito = 1000;
              usuario.primerInicio = true;
              usuario.nombre = firebase.auth().currentUser.email;
              usuario.email=firebase.auth().currentUser.email;
              
              UsuarioBatallaService.add(usuario);
              UsuarioBatallaService.setOnline(usuario.id);
              console.log("usuario agregado");
              try {
                   FCMPlugin.subscribeToTopic($scope.UsuarioLogueado.uid);
              }
              catch (err) {
                  // ES WEB
                  console.log("LOS PLUGINS SOLO FUNCIONA EN CELULARES");
              }
            }
            $state.go('app.mostrar');
          })

          //if(firebase.auth().currentUser.emailVerified)
          //{
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

  $scope.Administrador=function(){
    $scope.loginData.username="admin@admin.com";
    $scope.loginData.password="123123";
  }

  $scope.JugadorUno=function(){
    $scope.loginData.username="mauge@mauge.com";
    $scope.loginData.password="123456";
  }

  $scope.JugadorDos=function(){
    $scope.loginData.username="diego@diego.com";
    $scope.loginData.password="123456";
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
  $scope.imagen={};
  $scope.imagen.foto="pirate-flag.png";
  
  $scope.showLoading();

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

  $scope.$watch('UsuarioBatalla.batalla.jugadorDos', function() {
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

.controller('controlBatalla', function($scope, $ionicPopup, $state, $stateParams, $timeout, UsuarioBatallaService, $filter, $ionicLoading, NotificationService) {
  var IdBatalla = $stateParams.Id;
  $scope.currentUser = firebase.auth().currentUser;
  $scope.mensaje = "Decidí cuanto apostar y sobre que casillero";
  $scope.UsuarioBatalla = {};
  $scope.NombreJugadorUno = 'Jugador 1';
  $scope.NombreJugadorDos = 'Jugador 2';
  $scope.valor = {};
  $scope.valor.apuesta = 0;
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

    if (!$scope.UsuarioBatalla.batalla.quienGano)
    {
      $scope.MostrarEspera($scope.UsuarioBatalla.batalla.quienJuega != $scope.currentUser.uid); //falta configurar un timer
        
      if ($scope.currentUser.uid == $scope.UsuarioBatalla.batalla.jugadorUno.id) {
        $scope.currentUser.uid = $scope.UsuarioBatalla.batalla.jugadorDos.id;
      }
      else {
        $scope.currentUser.uid = $scope.UsuarioBatalla.batalla.jugadorUno.id; 
      }
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
    if ($scope.UsuarioBatalla.batalla.etapa == 1) {
      if ($scope.currentUser.uid == $scope.UsuarioBatalla.batalla.jugadorUno.id) 
      {
        $scope.UsuarioBatalla.batalla.jugadorUno.valorApuesta = $scope.valor.apuesta;
        $scope.UsuarioBatalla.batalla.etapa = 2;
      }
      else {
        $scope.UsuarioBatalla.batalla.jugadorDos.valorApuesta = $scope.valor.apuesta;
      }
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
      if ($scope.UsuarioBatalla.batalla.quienGano == $scope.UsuarioBatalla.batalla.jugadorUno.id){
          UsuarioBatallaService.getByUserId($scope.UsuarioBatalla.batalla.jugadorUno.id).then(function(respuesta){ //el id de batalla es el mismo que el de usr
              console.log(respuesta);
              respuesta.credito += parseInt($scope.UsuarioBatalla.batalla.jugadorDos.valorApuesta);

              UsuarioBatallaService.saveById(respuesta.$id);
            },function(error){
              console.log(error);
          });
          UsuarioBatallaService.getByUserId($scope.UsuarioBatalla.batalla.jugadorDos.id).then(function(respuesta){ //el id de batalla es el mismo que el de usr
              console.log(respuesta);
              respuesta.credito -= parseInt($scope.UsuarioBatalla.batalla.jugadorDos.valorApuesta);

              UsuarioBatallaService.saveById(respuesta.$id);
            },function(error){
              console.log(error);
          });
        }
        else{
          UsuarioBatallaService.getByUserId($scope.UsuarioBatalla.batalla.jugadorDos.id).then(function(respuesta){ //el id de batalla es el mismo que el de usr
              console.log(respuesta);
              respuesta.credito += parseInt($scope.UsuarioBatalla.batalla.jugadorUno.valorApuesta);
                UsuarioBatallaService.saveById(respuesta.$id);
                UsuarioBatallaService.getByUserId($scope.UsuarioBatalla.batalla.jugadorUno.id).then(function(respuesta){ //el id de batalla es el mismo que el de usr
                    console.log(respuesta);
                    respuesta.credito -= parseInt($scope.UsuarioBatalla.batalla.jugadorUno.valorApuesta);
                      UsuarioBatallaService.saveById(respuesta.$id);
                  },function(error){
                    console.log(error);
                });
              
            },function(error){
              console.log(error);
          });


        }

      $timeout(function(){
       $ionicLoading.hide();

        if ($scope.currentUser.uid == $scope.UsuarioBatalla.batalla.quienGano) {
          NotificationService.sendNotification($scope.currentUser.uid,"BatallaNaval","../img/pirate-flag.png","Batalla ganada");
          $scope.showPopup('Ganaste la batalla', 'Felicitaciones! Has acertado al casillero elegido por tu contrincante antes de que él acerte al tuyo!').then(function(){
            $timeout(function(){
              

              $state.go('app.mostrar');
            })
          })
        }
        else {
          NotificationService.sendNotification($scope.currentUser.uid,"BatallaNaval","../img/pirate-flag.png","Batalla perdida");
          $scope.showPopup('Perdiste la batalla', 'Han acertado a tu casillero! La próxima seguro tendrás mas suerte.').then(function(){
            $timeout(function(){

              $state.go('app.mostrar');
            })
          })
        }

        // SE LIMPIA LA BATALLA PISANDOLA CON UNA NUEVA
        UsuarioBatallaService.addNewBatalla($scope.UsuarioBatalla.batalla.jugadorUno.id);
      }, 1000);
      
    }
  })
})

.controller('controlPerfil', function($scope, $state, UsuarioBatallaService) {
  $scope.usuario = {};
  $scope.imagen={};
  $scope.imagen.foto="Pirate-Ship.png";
  $scope.showLoading();

  var id = firebase.auth().currentUser.uid;
  UsuarioBatallaService.getByUserId(id).then(function(respuesta){
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
