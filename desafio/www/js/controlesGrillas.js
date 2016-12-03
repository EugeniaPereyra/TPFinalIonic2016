angular.module('grillas.controllers', [])

.controller('controlMostrar', function($scope, $state, $ionicPopup, $timeout, DesafioService, UsuarioService, NotificationService, $cordovaNativeAudio, $cordovaVibration) {
  $scope.mostrar=false;
  $scope.aceptados=false;
  $scope.todos=true;
  $scope.datos=[];
  $scope.usuario = {};
  $scope.DateNow = new Date().getTime();
  $scope.userID = firebase.auth().currentUser.uid;

  try{
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

    refDesafio.on('child_changed', function(snapshot){
        $timeout(function(){
          var desafio = snapshot.val();

          if(desafio.quienGano)
          {
            if(firebase.auth().currentUser.uid == desafio.quienGano)
            {
                ReproducirPositivo();
                $ionicPopup.alert({
                      title: 'BIEN!!',
                      template: 'Ganaste, muchas felicitaciones!!',
                      cssClass:'bien',
                      okType: 'button-balanced'
                  });
            }
            else
            {
              ReproducirNegativo();
              $ionicPopup.alert({
                  title: 'MAL!!',
                  template: 'Perdiste, hasta la próxima!!',
                  cssClass:'mal',
                  okType: 'button-balanced'
               });
            }
            } 
        });
    }); 
  }
  catch(err)
  {
      $ionicPopup.alert({
              title: 'No se pudo obtener los desafios. Revise su conexion.',
              cssClass:'salida',
              okType: 'button-energized',
          });
  }

  function Computar(desafio, id){
    // NO COMPUTADOS
    if(!desafio.computado && ((desafio.fechaFin - $scope.DateNow) / 1000)<=0){
        // NO FUE ACEPTADO
        if(desafio.jugador == '') {
          NotificationService.sendNotification(desafio.creador,"DesafíaMente","Un desafío terminó sin resultados");
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
            ReproducirPositivo();
              $ionicPopup.alert({
                title: 'NADA!!',
                template: 'No hubo jugadores para el desafio',
                cssClass:'salida',
                okType: 'button-balanced'
              });

          }
        }
        else{
          // FUE ACEPTADO
          if(desafio.jugador)
          {
            NotificationService.sendNotification(desafio.creador,"DesafíaMente","Un desafío terminó con resultados");
            // SI ES EL CREADOR DEBE DECIDIR QUIEN GANA
            if(firebase.auth().currentUser.uid == desafio.creador)
            {
               var confirmPopup = $ionicPopup.confirm({
                 title: 'Tiempo de desafio agotado',
                 template: 'El otro jugador gana?',
                 cssClass:'salida'
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
                                quienGano: desafio.jugador,
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
                                quienGano: desafio.creador,
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

    function ReproducirPositivo(){
      try
      {
        $cordovaVibration.vibrate(200);
        $cordovaNativeAudio.play('si');
      }
      catch(e)
      {
        console.log("La vibracion y el sonido, solo funcionan en celulares");
      }
    }

    function ReproducirNegativo(){
      try
      {
        $cordovaVibration.vibrate([200,200,200]);
        $cordovaNativeAudio.play('no');
      }
      catch(e)
      {
        console.log("La vibracion y el sonido, solo funcionan en celulares");
      }
    }
})

.controller('controlAceptados', function($scope, $state, $ionicPopup, DesafioService, $timeout, UsuarioService, NotificationService, $cordovaNativeAudio, $cordovaVibration) {
  $scope.mostrar=false;
  $scope.aceptados=true;
  $scope.todos=false;
  $scope.userID = firebase.auth().currentUser.uid;
  $scope.datos=[];
  $scope.DateNow = new Date().getTime();
  
  try{
   var refDesafio = firebase.database().ref('DESAFIOS/');
    refDesafio.on('child_added', function(snapshot){
        $timeout(function(){
          var desafio = snapshot.val();
          var id=snapshot.key;
          if(desafio.computado && ((desafio.fechaFin - $scope.DateNow) / 1000)<=0)
          {
            $scope.datos.push(desafio);
          }  
        });
    });  
  }
  catch(err)
  {
      $ionicPopup.alert({
              title: 'No se pudo obtener los desafios. Revise su conexion.',
              cssClass:'salida',
              okType: 'button-energized',
          });
  }

  $scope.Borrar=function(index){
    DesafioService.getByIndex(index).then(function(respuesta){
      DesafioService.remove(respuesta);
    });
  }
})

.controller('controlMisDesafios', function($scope, $state,$ionicPopup, DesafioService, $timeout, UsuarioService, NotificationService, $cordovaNativeAudio, $cordovaVibration) {
  $scope.userID = firebase.auth().currentUser.uid;
  $scope.mostrar=true;
  $scope.todos=false;
  $scope.aceptados=false;
  $scope.DateNow = new Date().getTime();
  $scope.datos=[];

  try{
   var refDesafio = firebase.database().ref('DESAFIOS/');
    refDesafio.on('child_added', function(snapshot){
        $timeout(function(){
          var desafio = snapshot.val();
          var id=snapshot.key;
          if(desafio.computado && ((desafio.fechaFin - $scope.DateNow) / 1000)<=0)
          {
            $scope.datos.push(desafio);
          } 
        });
    }); 
  }
  catch(err)
  {
      $ionicPopup.alert({
              title: 'No se pudo obtener los desafios. Revise su conexion.',
              cssClass:'salida',
              okType: 'button-energized',
          });
  }

  $scope.Borrar=function(index){
    DesafioService.getByIndex(index).then(function(respuesta){
      DesafioService.remove(respuesta);
    });
  }
})
;