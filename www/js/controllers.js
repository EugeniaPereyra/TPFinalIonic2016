angular.module('starter.controllers', ['starter.factories'])

.controller('controlLogin', function($scope, $state, $ionicLoading, $ionicPopup, $timeout, DesafioService) {

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

  $scope.Loguear = function() {
    // Start showing the progress
    $scope.showLoading();

    firebase.auth().signInWithEmailAndPassword($scope.loginData.username,$scope.loginData.password)
        .then(function(respuesta){
          console.info("Respuesta: ",respuesta);
          $scope.loginData.username="";
          $scope.loginData.password="";
          $scope.hideLoading();

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
          console.info("Respuesta: ",respuesta);
          $scope.loginData.username="";
          $scope.loginData.password="";
          
          var usuario = {};
          usuario.id = respuesta.uid;
          usuario.credito = 1000;
          usuario.primerInicio = true;
          
          $timeout(function() {
            DesafioService.cargarUsuario(usuario);
          }, 100);

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
    firebase.auth().signOut();
    $state.go('login');
  };

  $scope.Mostrar = function(){
    $state.go('app.misDesafios', {email: firebase.auth().currentUser.email} );
  }

  $scope.Aceptados = function(){
    $state.go('app.aceptados', {email: firebase.auth().currentUser.email} );
  }
  
  $scope.MostrarDesafios = function(){
    $state.go('app.mostrar');
  }

  $scope.NuevoDesafio = function(){
    $state.go('app.desafio');
  }

  $scope.Autor = function(){
    $state.go('app.autor');
  }
})

.controller('controlMostrar', function($scope, $state, $ionicPopup, $timeout, DesafioService) {
  $scope.mostrar=false;
  $scope.aceptados=false;
  $scope.todos=true;
  $scope.titulo="Desafios Vigentes";
  $scope.datos=[];
  $scope.usuarios = [];
  $scope.usuario = {};
  $scope.DateNow = new Date().getTime();
  $scope.email = firebase.auth().currentUser.email;
  
  $scope.showLoading();
  $timeout(function(){
    var id = firebase.auth().currentUser.uid;
    DesafioService.getUsuarios();
    //DesafioService.getDesafios(callback, error);

    console.log("firebase: " + $scope.datos);
    
    console.log("local: " + $scope.usuarios);
  
    if($scope.usuario.primerInicio)
    {
      $scope.showPopup('Bienvenido!', 'Ha obtenido $1000.00 de credito de regalo por unica vez.');
      $scope.usuario.primerInicio = false;
     // UsuarioService.save($scope.usuario);
    }
    $scope.hideLoading();

  },100);
  
  function callback(dato){
    $scope.usuarios = dato;
  }
  function error(dato){
    console.log(dato);
  }

  $scope.mostrarDesafio = function(index){
    $state.go('app.apuesta', {desafio:index} );
  }

  $scope.Terminado=function(desafio){
    desafio.disponible=false;
  }
})

.controller('controlDesafio', function($scope, $ionicPopup, $state, $stateParams, $timeout, DesafioService) {
  $scope.usuario = {};
  $scope.desafio = {};
  $scope.desafio.creador = firebase.auth().currentUser.email;
  $scope.desafio.disponible=true;
  $scope.desafio.computado=false;
  $scope.desafio.jugador="";
  $scope.desafio.respuestaElegida = "";
  
  
  $scope.arrayDias = Array.from(Array(7).keys()); 
  $scope.arrayHoras = Array.from(Array(25).keys()); 
  $scope.arrayMinutos = Array.from(Array(61).keys()); 
  $scope.arraySegundos = Array.from(Array(61).keys()); 

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

      $timeout(function(){
          //$scope.usuarios = UsuarioService.getAll();
          //$scope.usuario = UsuarioService.getById(firebase.auth().currentUser.uid);

          console.log($scope.usuario);

          if($scope.usuario.credito < $scope.desafio.valor)
          {
            $scope.showPopup('Saldo Insuficiente', 'No posee el crédito suficiente para crear un desafío por el valor ingresado.');
            /*
            var alertPopup = $ionicPopup.alert({
                title: 'Saldo Insuficiente',
                template: 'No posee el crédito suficiente para crear un desafío por el valor ingresado.' 
              });
            */
            return;
          }

          //DesafioService.add($scope.desafio);

          $scope.showPopup('El desafio se ha guardado correctamente', '', 'button-balanced');
          /*
          $ionicPopup.alert({
             title: 'El desafio se ha guardado correctamente',
             okType: 'button-balanced'
          });
          */
          $state.go('app.mostrar');
      }, 100);
    }
})

.controller('controlApuesta', function($scope, $ionicPopup, $state, $stateParams, DesafioService, $timeout) {
  var index = $stateParams.desafio;
  $scope.usuario = {};
  $scope.credito=0;

  $scope.desafio = DesafioService.getByIndex(index)
  //$scope.usuario = UsuarioService.getById(firebase.auth().currentUser.uid);
  
  if($scope.usuario)
    $scope.credito = $scope.usuario.credito;
  
  // Esta validacion no va a estar cuando se permita que un desafio sea aceptado por mas de 1 usuario
  if ($scope.desafio.jugador != "" && $scope.desafio.jugador != $scope.usuario.$id){
    $scope.showPopup('Desafio no disponible', 'El desafío ya ha sido aceptado por otro usuario.');
    /*
    var alertPopup = $ionicPopup.alert({
        title: 'Desafio no disponible',
        template: 'El desafío ya ha sido aceptado por otro usuario.' 
      });
    */

    //return;
    $state.go('app.mostrar');
  }

  $scope.Guardar=function(){
      $scope.desafio.vigente = false;
      $scope.desafio.jugador = $scope.usuario.$id;
      
      if (!$scope.desafio.respuestaElegida){
        $scope.showPopup('Elija una respuesta', 'Debe elegir una de las respuestas disponibles.');
        /*
        var alertPopup = $ionicPopup.alert({
            title: 'Elija una respuesta',
            template: 'Debe elegir una de las respuestas disponibles.' 
          });*/

        return;
      }

      if($scope.usuario.credito < $scope.desafio.valor){
        $scope.showPopup('Saldo Insuficiente', 'No posee el crédito suficiente para aceptar este desafío.');
        /*
        var alertPopup = $ionicPopup.alert({
            title: 'Saldo Insuficiente',
            template: 'No posee el crédito suficiente para aceptar este desafío.' 
          });*/

        $scope.desafio.respuestaElegida = "";
        return;
      }

      $timeout(function(){
        //DesafioService.save($scope.desafio);

        $scope.showPopup('El desafio ha sido aceptado. El jugador que creó el desafío decidirá quién es el ganador.', '', 'button-balanced');
        /*
        $ionicPopup.alert({
           title: 'El desafio ha sido aceptado. El jugador que creó el desafío decidirá quién es el ganador.',
           okType: 'button-balanced'
        });*/

        $state.go('app.mostrar');
      }, 100);
  }
})

.controller('controlAceptados', function($scope, $state, $stateParams, DesafioService, $timeout) {
  $scope.mostrar=false;
  $scope.aceptados=true;
  $scope.todos=false;
  $scope.titulo="Desafios Aceptados";
  $scope.email= $stateParams.email;
  $scope.datos=[];
  
  $scope.showLoading();
  $timeout(function(){
      //$scope.datos = DesafioService.getAll();

      $scope.datos.$loaded(function() { //espera a que finalice la llamada a firebase
        console.log($scope.datos);
        $scope.hideLoading(); 
      });

     },100);
})


.controller('controlMisDesafios', function($scope, $state, $stateParams, DesafioService, $timeout) {
  $scope.email= $stateParams.email;
  $scope.titulo="Mis Desafios";
  $scope.mostrar=true;
  $scope.todos=false;
  $scope.aceptados=false;

  $scope.datos=[];
  
  $scope.showLoading();
  $timeout(function(){
      //$scope.datos = DesafioService.getAll();

      $scope.datos.$loaded(function() { //espera a que finalice la llamada a firebase
        console.log($scope.datos);
        $scope.hideLoading(); 
      });

     },100);

})

.controller('AutorCtrl', function($scope) {
  $scope.autor={};
  $scope.autor.nombre="Maria Eugenia Pereyra";
  $scope.autor.foto="img/autor.jpg";
  $scope.autor.email="meugeniape@gmail.com";
  $scope.autor.github="https://github.com/EugeniaPereyra";
});
