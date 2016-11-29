angular.module('starter.controllers', ['starter.factories'])

.controller('controlLogin', function($scope, $state, $ionicLoading, $ionicPopup, $timeout, UsuarioService) {

  $scope.showLoading = function() {
    $ionicLoading.show({
      template: '<ion-spinner icon="android"></ion-spinner>'
    });
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

  $scope.loginData = {};
  var usuarios=[];
  var puente = [];
  var encontrado = false;

  $scope.Loguear = function() {
    // Start showing the progress
    $scope.showLoading();

    firebase.auth().signInWithEmailAndPassword($scope.loginData.username,$scope.loginData.password)
        .then(function(respuesta){
          //console.info("Respuesta: ",respuesta);
          $scope.loginData.username="";
          $scope.loginData.password="";
          $scope.UsuarioLogueado=firebase.auth().currentUser;
          UsuarioService.getAll().then(function(respuesta){
            puente=respuesta;
            usuarios=puente.map(function(dato){
              if(dato.$id==$scope.UsuarioLogueado.uid)
              {
                encontrado=true;
              }
            })
            $scope.hideLoading();
            if(encontrado)
            {
              $state.go('app.mostrar');
            }
            else
            {
              var usuario = {};
              usuario.id = firebase.auth().currentUser.uid;
              usuario.credito = 1000;
              usuario.primerInicio = true;
              usuario.nombre = firebase.auth().currentUser.email;
              
              UsuarioService.add(usuario);
              console.log("usuario agregado");
              $state.go('app.mostrar');
            }
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
          console.info("Respuesta: ",respuesta);
          $scope.loginData.username="";
          $scope.loginData.password="";
          
          var usuario = {};
          usuario.id = respuesta.uid;
          usuario.credito = 1000;
          usuario.primerInicio = true;
          usuario.nombre = respuesta.email;
          
          UsuarioService.add(usuario);
          console.log("usuario agregado");

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

  // function Verificar(){
  //   $scope.showLoading();
  //   firebase.auth().currentUser.sendEmailVerification()
  //   .then(function(respuesta){
  //     $scope.hideLoading();
  //     console.info("Respuesta: ", respuesta);
  //     $scope.showPopup('Atencion', 'Necesita verificar su email. Por favor, revise su correo electronico!');
  //   })
  //   .catch(function(error){
  //     $scope.hideLoading();
  //     console.info("Error: ",error);
  //     $scope.showPopup('Error', 'Usuario y/o password incorrectos!');
  //   })
  // }

  $scope.Administrador=function(){
    $scope.loginData.username="admin@admin.com";
    $scope.loginData.password="123123";
  }

  $scope.JugadorUno=function(){
  }

  $scope.JugadorDos=function(){
  }

})

.controller('controlMostrar', function($scope, $state, $ionicPopup, $timeout, DesafioService, UsuarioService) {
  $scope.mostrar=false;
  $scope.aceptados=false;
  $scope.todos=true;
  $scope.titulo="Desafios Vigentes";
  $scope.datos=[];
  $scope.usuario = {};
  $scope.DateNow = new Date().getTime();
  $scope.userID = firebase.auth().currentUser.uid;

   var refDesafio = firebase.database().ref('DESAFIOS/');
    refDesafio.on('child_added', function(snapshot){
        $timeout(function(){
          var desafio = snapshot.val();
          var id=snapshot.key;
          if(!desafio.computado && ((desafio.fechaFin - $scope.DateNow) / 1000)<=0)
          {
            Computar(desafio, id); 
          }
          else
          {
            $scope.datos.push(desafio);
          }  
        });
    }); 

  function Computar(desafio, id){
    // NO COMPUTADOS
    if(!desafio.computado && ((desafio.fechaFin - $scope.DateNow) / 1000)<=0){
        // NO FUE ACEPTADO
        if(desafio.jugador == '') {
          UsuarioService.getById(desafio.creador).then(function(respuesta){
            var usuario=respuesta;
            usuario.credito += parseInt(desafio.valor);
            UsuarioService.save(usuario);
            desafio.disponible=false;
            desafio.computado=true;
            var desf = firebase.database().ref().child('DESAFIOS/' + id);
            desf.set( { creador: desafio.creador, 
                        disponible: false,
                        computado: true,
                        jugador: desafio.jugador,
                        valor: desafio.valor,
                        quienGano: desafio.quienGano,
                        fechaInicio: desafio.fechaInicio,
                        fechaFin: desafio.fechaFin,
                        pregunta: desafio.pregunta 
                      }, function(error){
                        console.log(error); 
                    });          
          })

          // SI ES EL CREADOR SE LE MUESTRA UN MENSAJE INFORMANDO
          if(firebase.auth().currentUser.uid == desafio.creador)
          {
            $scope.showPopup('Nada!!','No hubo jugadores para el desafio "' + desafio.pregunta + '"');
          }
        }
        else{
          // FUE ACEPTADO
          if(desafio.jugador)
          {
            // SI ES EL CREADOR DEBE DECIDIR QUIEN GANA
            if(firebase.auth().currentUser.uid == desafio.creador)
            {
               var confirmPopup = $ionicPopup.confirm({
                 title: 'Tiempo de desafio agotado',
                 template: 'El otro jugador gana?'
               });

               confirmPopup.then(function(res) {
                 if(res) {
                  UsuarioService.getById(desafio.jugador).then(function(respuesta){
                    //console.info(respuesta);
                    var usuario=respuesta;
                    usuario.credito += (parseInt(desafio.valor) * 2);
                    UsuarioService.save(usuario);
                    var desf = firebase.database().ref().child('DESAFIOS/' + id);
                    desf.set( { creador: desafio.creador, 
                                disponible: false,
                                computado: true,
                                jugador: desafio.jugador,
                                valor: desafio.valor,
                                quienGano: desafio.quienGano,
                                fechaInicio: desafio.fechaInicio,
                                fechaFin: desafio.fechaFin,
                                pregunta: desafio.pregunta 
                              }, function(error){
                                console.log(error); 
                            });           
                  })
                 } else {
                  UsuarioService.getById(desafio.creador).then(function(respuesta){
                    //console.info(respuesta);
                    var usuario=respuesta;
                    $scope.usuario.credito += (parseInt(desafio.valor)*2);
                    UsuarioService.save(usuario);
                    var desf = firebase.database().ref().child('DESAFIOS/' + id);
                    desf.set( { creador: desafio.creador, 
                                disponible: false,
                                computado: true,
                                jugador: desafio.jugador,
                                valor: desafio.valor,
                                quienGano: desafio.quienGano,
                                fechaInicio: desafio.fechaInicio,
                                fechaFin: desafio.fechaFin,
                                pregunta: desafio.pregunta 
                              }, function(error){
                                console.log(error); 
                            }); 
                  })
                 }
               })
            }
            if(desafio.quienGano != "")
            {
              if(firebase.auth().currentUser.uid == desafio.quienGano)
              {
                $scope.showPopup('Desafio ganado!!','Ganaste, muchas felicitaciones!!');
              }
              else
              {
                $scope.showPopup('Desafio perdido!!','La proxima será!!');
              }
            }
         }
       }
    }
  }

  UsuarioService.getById($scope.userID).then(function(respuesta){
      //console.info("usuario:"+respuesta);
      $scope.usuario=respuesta;
      if($scope.usuario.primerInicio)
      {
        $scope.showPopup('Bienvenido!', 'Ha obtenido $1000.00 de credito de regalo por unica vez.');
        $scope.usuario.primerInicio = false;
        //console.info($scope.usuario);
        UsuarioService.save($scope.usuario);
      }
    },function(error){
      console.log(error);
    })
  
  $scope.hideLoading();  

  $scope.mostrarDesafio = function(index){
    $state.go('app.apuesta', {desafio:index} );
  }

  $scope.Terminado=function(desafio){
  }
})

.controller('controlDesafio', function($scope, $ionicPopup, $state, $stateParams, $timeout, DesafioService, UsuarioService) {
  $scope.usuario = {};
  $scope.desafio = {};
  $scope.desafio.creador = firebase.auth().currentUser.uid;
  $scope.desafio.disponible=true;
  $scope.desafio.computado=false;
  $scope.desafio.jugador="";
  $scope.desafio.valor=50;
  $scope.desafio.quienGano="";
  //$scope.desafio.respuestaElegida = "";
  
  
  $scope.arrayDias = Array.from(Array(6).keys()); 
  $scope.arrayHoras = Array.from(Array(24).keys()); 
  $scope.arrayMinutos = Array.from(Array(60).keys()); 
  $scope.arraySegundos = Array.from(Array(60).keys()); 

  $scope.tiempo = { dias: 0, horas: 0, minutos: 0, segundos: 0 };

  $scope.Aceptar=function(){
      var fechaFin;
      if ($scope.tiempo.dias == 0 && $scope.tiempo.horas == 0 && $scope.tiempo.minutos == 0 && $scope.tiempo.segundos == 0){
        alert("Debe seleccionar alguno");
        return false;
      }
      else{
        fechaFin = new Date();
        if ($scope.tiempo.dias != 0)
          fechaFin.setDate(fechaFin.getDate() + $scope.tiempo.dias);
        if ($scope.tiempo.horas != 0)
          fechaFin.setHours(fechaFin.getHours() + $scope.tiempo.horas);
        if ($scope.tiempo.minutos != 0)
          fechaFin.setMinutes(fechaFin.getMinutes() + $scope.tiempo.minutos);
        if ($scope.tiempo.segundos != 0)
          fechaFin.setSeconds(fechaFin.getSeconds() + $scope.tiempo.segundos);
      }

      $scope.desafio.fechaInicio = new Date().getTime(); //firebase.database.ServerValue.TIMESTAMP;
      $scope.desafio.fechaFin = fechaFin.getTime();

      var id = firebase.auth().currentUser.uid;
      UsuarioService.getById(id).then(function(respuesta){
        //console.info(respuesta);
        $scope.usuario=respuesta;
        if($scope.usuario.credito < $scope.desafio.valor)
        {
          $scope.showPopup('Saldo Insuficiente', 'No posee el crédito suficiente para crear un desafío por el valor ingresado.');
          return;
        }
        $scope.usuario.credito -= $scope.desafio.valor;
        UsuarioService.save($scope.usuario);
        DesafioService.add($scope.desafio);
        console.log("Desafio agregado");
      },function(error){
        console.log(error);
      });

      $scope.showPopup('El desafio se ha guardado correctamente', '', 'button-balanced');

      $state.go('app.mostrar');
    }
})

.controller('controlApuesta', function($scope, $ionicPopup, $state, $stateParams, DesafioService, $timeout, UsuarioService) {
  var index = $stateParams.desafio;
  $scope.usuario = {};
  $scope.credito=0;

  DesafioService.getByIndex(index).then(function(respuesta){
    $scope.desafio=respuesta;
      // Esta validacion no va a estar cuando se permita que un desafio sea aceptado por mas de 1 usuario
    if ($scope.desafio.jugador != "" && $scope.desafio.jugador != $scope.usuario.$id){
      $scope.showPopup('Desafio no disponible', 'El desafío ya ha sido aceptado por otro usuario.');
      $state.go('app.mostrar');
    }
  },function(error){
    console.log(error);
  });

  var id = firebase.auth().currentUser.uid;
  UsuarioService.getById(id).then(function(respuesta){
    $scope.usuario=respuesta;
    if($scope.usuario)
      $scope.credito = $scope.usuario.credito;
  },function(error){
    console.log(error);
  });

  $scope.AceptarDesafio=function(){
      $scope.desafio.jugador = $scope.usuario.$id;
      if($scope.usuario.credito < $scope.desafio.valor){
        $scope.showPopup('Saldo Insuficiente', 'No posee el crédito suficiente para aceptar este desafío.');
        //$scope.desafio.respuestaElegida = "";
        return;
      }
      $scope.usuario.credito -= $scope.desafio.valor;
      UsuarioService.save($scope.usuario);
      DesafioService.save($scope.desafio);
      console.log("Desafio modificado");
      $scope.showPopup('El desafio ha sido aceptado. El jugador que creó el desafío decidirá quién es el ganador.', '', 'button-balanced');
      $state.go('app.mostrar');
  }
})

.controller('controlAceptados', function($scope, $state, DesafioService, $timeout, UsuarioService) {
  $scope.mostrar=false;
  $scope.aceptados=true;
  $scope.todos=false;
  $scope.titulo="Desafios Aceptados";
  $scope.userID = firebase.auth().currentUser.uid;
  $scope.datos=[];
  $scope.DateNow = new Date().getTime();
  
   var refDesafio = firebase.database().ref('DESAFIOS/');
    refDesafio.on('child_added', function(snapshot){
        $timeout(function(){
          var desafio = snapshot.val();
          var id=snapshot.key;
          if(!desafio.computado && ((desafio.fechaFin - $scope.DateNow) / 1000)<=0)
          {
            Computar(desafio, id); 
          }
          else
          {
            $scope.datos.push(desafio);
          }  
        });
    }); 

  function Computar(desafio, id){
    // NO COMPUTADOS
    if(!desafio.computado && ((desafio.fechaFin - $scope.DateNow) / 1000)<=0){
        // NO FUE ACEPTADO
        if(desafio.jugador == '') {
          UsuarioService.getById(desafio.creador).then(function(respuesta){
            var usuario=respuesta;
            usuario.credito += parseInt(desafio.valor);
            UsuarioService.save(usuario);
            desafio.disponible=false;
            desafio.computado=true;
            var desf = firebase.database().ref().child('DESAFIOS/' + id);
            desf.set( { creador: desafio.creador, 
                        disponible: false,
                        computado: true,
                        jugador: desafio.jugador,
                        valor: desafio.valor,
                        quienGano: desafio.quienGano,
                        fechaInicio: desafio.fechaInicio,
                        fechaFin: desafio.fechaFin,
                        pregunta: desafio.pregunta 
                      }, function(error){
                        console.log(error); 
                    });          
          })

          // SI ES EL CREADOR SE LE MUESTRA UN MENSAJE INFORMANDO
          if(firebase.auth().currentUser.uid == desafio.creador)
          {
            $scope.showPopup('Nada!!','No hubo jugadores para el desafio "' + desafio.pregunta + '"');
          }
        }
        else{
          // FUE ACEPTADO
          if(desafio.jugador)
          {
            // SI ES EL CREADOR DEBE DECIDIR QUIEN GANA
            if(firebase.auth().currentUser.uid == desafio.creador)
            {
               var confirmPopup = $ionicPopup.confirm({
                 title: 'Tiempo de desafio agotado',
                 template: 'El otro jugador gana?'
               });

               confirmPopup.then(function(res) {
                 if(res) {
                  UsuarioService.getById(desafio.jugador).then(function(respuesta){
                    //console.info(respuesta);
                    var usuario=respuesta;
                    usuario.credito += (parseInt(desafio.valor) * 2);
                    UsuarioService.save(usuario);
                    var desf = firebase.database().ref().child('DESAFIOS/' + id);
                    desf.set( { creador: desafio.creador, 
                                disponible: false,
                                computado: true,
                                jugador: desafio.jugador,
                                valor: desafio.valor,
                                quienGano: desafio.quienGano,
                                fechaInicio: desafio.fechaInicio,
                                fechaFin: desafio.fechaFin,
                                pregunta: desafio.pregunta 
                              }, function(error){
                                console.log(error); 
                            });           
                  })
                 } else {
                  UsuarioService.getById(desafio.creador).then(function(respuesta){
                    //console.info(respuesta);
                    var usuario=respuesta;
                    $scope.usuario.credito += (parseInt(desafio.valor)*2);
                    UsuarioService.save(usuario);
                    var desf = firebase.database().ref().child('DESAFIOS/' + id);
                    desf.set( { creador: desafio.creador, 
                                disponible: false,
                                computado: true,
                                jugador: desafio.jugador,
                                valor: desafio.valor,
                                quienGano: desafio.quienGano,
                                fechaInicio: desafio.fechaInicio,
                                fechaFin: desafio.fechaFin,
                                pregunta: desafio.pregunta 
                              }, function(error){
                                console.log(error); 
                            }); 
                  })
                 }
               })
            }
            if(desafio.quienGano != "")
            {
              if(firebase.auth().currentUser.uid == desafio.quienGano)
              {
                $scope.showPopup('Desafio ganado!!','Ganaste, muchas felicitaciones!!');
              }
              else
              {
                $scope.showPopup('Desafio perdido!!','La proxima será!!');
              }
            }
         }
       }
    }
  }

  $scope.Terminado=function(desafio){
  }
})


.controller('controlMisDesafios', function($scope, $state, DesafioService, $timeout, UsuarioService) {
  $scope.userID = firebase.auth().currentUser.uid;
  $scope.titulo="Mis Desafios";
  $scope.mostrar=true;
  $scope.todos=false;
  $scope.aceptados=false;
  $scope.DateNow = new Date().getTime();
  $scope.datos=[];
  var desafios=[];

   var refDesafio = firebase.database().ref('DESAFIOS/');
    refDesafio.on('child_added', function(snapshot){
        $timeout(function(){
          var desafio = snapshot.val();
          var id=snapshot.key;
          if(!desafio.computado && ((desafio.fechaFin - $scope.DateNow) / 1000)<=0)
          {
            Computar(desafio, id); 
          }
          else
          {
            $scope.datos.push(desafio);
          }  
        });
    }); 

  function Computar(desafio, id){
    // NO COMPUTADOS
    if(!desafio.computado && ((desafio.fechaFin - $scope.DateNow) / 1000)<=0){
        // NO FUE ACEPTADO
        if(desafio.jugador == '') {
          UsuarioService.getById(desafio.creador).then(function(respuesta){
            var usuario=respuesta;
            usuario.credito += parseInt(desafio.valor);
            UsuarioService.save(usuario);
            desafio.disponible=false;
            desafio.computado=true;
            var desf = firebase.database().ref().child('DESAFIOS/' + id);
            desf.set( { creador: desafio.creador, 
                        disponible: false,
                        computado: true,
                        jugador: desafio.jugador,
                        valor: desafio.valor,
                        quienGano: desafio.quienGano,
                        fechaInicio: desafio.fechaInicio,
                        fechaFin: desafio.fechaFin,
                        pregunta: desafio.pregunta 
                      }, function(error){
                        console.log(error); 
                    });          
          })

          // SI ES EL CREADOR SE LE MUESTRA UN MENSAJE INFORMANDO
          if(firebase.auth().currentUser.uid == desafio.creador)
          {
            $scope.showPopup('Nada!!','No hubo jugadores para el desafio "' + desafio.pregunta + '"');
          }
        }
        else{
          // FUE ACEPTADO
          if(desafio.jugador)
          {
            // SI ES EL CREADOR DEBE DECIDIR QUIEN GANA
            if(firebase.auth().currentUser.uid == desafio.creador)
            {
               var confirmPopup = $ionicPopup.confirm({
                 title: 'Tiempo de desafio agotado',
                 template: 'El otro jugador gana?'
               });

               confirmPopup.then(function(res) {
                 if(res) {
                  UsuarioService.getById(desafio.jugador).then(function(respuesta){
                    //console.info(respuesta);
                    var usuario=respuesta;
                    usuario.credito += (parseInt(desafio.valor) * 2);
                    UsuarioService.save(usuario);
                    var desf = firebase.database().ref().child('DESAFIOS/' + id);
                    desf.set( { creador: desafio.creador, 
                                disponible: false,
                                computado: true,
                                jugador: desafio.jugador,
                                valor: desafio.valor,
                                quienGano: desafio.quienGano,
                                fechaInicio: desafio.fechaInicio,
                                fechaFin: desafio.fechaFin,
                                pregunta: desafio.pregunta 
                              }, function(error){
                                console.log(error); 
                            });           
                  })
                 } else {
                  UsuarioService.getById(desafio.creador).then(function(respuesta){
                    //console.info(respuesta);
                    var usuario=respuesta;
                    $scope.usuario.credito += (parseInt(desafio.valor)*2);
                    UsuarioService.save(usuario);
                    var desf = firebase.database().ref().child('DESAFIOS/' + id);
                    desf.set( { creador: desafio.creador, 
                                disponible: false,
                                computado: true,
                                jugador: desafio.jugador,
                                valor: desafio.valor,
                                quienGano: desafio.quienGano,
                                fechaInicio: desafio.fechaInicio,
                                fechaFin: desafio.fechaFin,
                                pregunta: desafio.pregunta 
                              }, function(error){
                                console.log(error); 
                            }); 
                  })
                 }
               })
            }
            if(desafio.quienGano != "")
            {
              if(firebase.auth().currentUser.uid == desafio.quienGano)
              {
                $scope.showPopup('Desafio ganado!!','Ganaste, muchas felicitaciones!!');
              }
              else
              {
                $scope.showPopup('Desafio perdido!!','La proxima será!!');
              }
            }
         }
       }
    }
  }

  $scope.Terminado=function(desafio){
  }
})

.controller('CreditosCtrl', function($scope, CreditoService) {
  $scope.credito = {}; 
  $scope.cantidad ={}; 

  $scope.Aceptar=function(){

        CreditoService.add($scope.cantidad,$scope.credito);
          $scope.showPopup('Los creditos se han generado correctamente', '', 'button-balanced');       
    }
})

.controller('controlCargar', function($scope, CreditoService, UsuarioService, $state) {
  var idCred;
  var idUsr = firebase.auth().currentUser.uid;
  $scope.usuario = {};
  $scope.credito = {};
  $scope.creditos = {}; 
  $scope.carga = {};
  $scope.carga.valor="";

  CreditoService.getAll().then(function(respuesta){
    $scope.creditos=respuesta;
    console.log($scope.creditos);
  })

  $scope.Cargar=function(){        
        for(var i=0;i<$scope.creditos.length;i++)
        {
          if($scope.creditos[i].valor==$scope.carga.valor)
          {
            idCred=$scope.creditos[i].$id;
            break;
          }
        }
        UsuarioService.getById(idUsr).then(function(respuesta){
          $scope.usuario = respuesta;
          $scope.usuario.credito += parseInt($scope.carga.valor);
          UsuarioService.save($scope.usuario); 
          CreditoService.getById(idCred).then(function(respuesta){
            $scope.credito=respuesta;
            CreditoService.remove($scope.credito);
            $scope.showPopup('Correcto!', 'Carga de credito realizada correctamente');
            $state.go('app.perfil');
            })
          }) 
        }  
})

.controller('controlPerfil', function($scope, $state, UsuarioService) {
  $scope.usuario = {};
  $scope.showLoading();

  var id = firebase.auth().currentUser.uid;
  UsuarioService.getById(id).then(function(respuesta){
    $scope.usuario = respuesta;
    $scope.usuario.mail = firebase.auth().currentUser.email;
    $scope.hideLoading(); 
  },function(error){
    console.log(error);
  });

  $scope.Cambiar=function(){
    UsuarioService.save($scope.usuario);
    $scope.showPopup('Correcto', 'Se ha cambiado el nombre');
  }

  $scope.Cargar=function(){
    var dato = JSON.stringify($scope.usuario);
    $state.go('app.cargar',{usuario: dato});
  }
  
})

.controller('AutorCtrl', function($scope) {
  $scope.autor={};
  $scope.autor.nombre="Maria Eugenia Pereyra";
  $scope.autor.foto="img/autor.jpg";
  $scope.autor.email="meugeniape@gmail.com";
  $scope.autor.github="https://github.com/EugeniaPereyra";
});
