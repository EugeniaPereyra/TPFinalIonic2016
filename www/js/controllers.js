angular.module('starter.controllers', ['starter.factories'])

.controller('controlLogin', function($scope, $state, $ionicLoading, $ionicPopup, $timeout, UsuarioService) {

  $scope.show = function() {
    $ionicLoading.show({
      template: '<ion-spinner icon="android"></ion-spinner>'
    });
  };

  $scope.hide = function(){
        $ionicLoading.hide();
  };

  $scope.loginData = {};

  // Perform the login action when the user submits the login form
  $scope.Loguear = function() {
    // Start showing the progress
    $scope.show($ionicLoading);

    firebase.auth().signInWithEmailAndPassword($scope.loginData.username,$scope.loginData.password)
        .then(function(respuesta){
          console.info("Respuesta: ",respuesta);
          $scope.loginData.username="";
          $scope.loginData.password="";
          $scope.hide($ionicLoading);

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
          $scope.hide($ionicLoading);
          var alertPopup = $ionicPopup.alert({
              title: 'Error',
              template: 'Usuario y/o password incorrectos!' //'Please check your credentials!'
            });
        });
  };

  $scope.Crear = function() {
    // Start showing the progress
    $scope.show($ionicLoading);

    //var result = 
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
            UsuarioService.add(usuario);
          }, 100);

          $scope.hide($ionicLoading); 
          var alertPopup = $ionicPopup.alert({
              title: 'Registrado!',
              template: 'Ya puede ingresar con su email y password' 
            });
        })
        .catch(function(error){
          console.info("Error: ",error);
          $scope.hide($ionicLoading);
          var alertPopup = $ionicPopup.alert({
              title: 'Registro falló!',
              template: error 
            });
        });
  };

  $scope.Resetear=function(){
    $scope.show($ionicLoading);
    firebase.auth().sendPasswordResetEmail($scope.loginData.username)
    .then(function(respuesta){
      $scope.hide($ionicLoading);
      console.info("Respuesta: ", respuesta);
      var alertPopup = $ionicPopup.alert({
              title: 'Atencion',
              template: 'Por favor, revise su correo electronico!' //'Please check your credentials!'
        });
    })
    .catch(function(error){
      $scope.hide($ionicLoading);
      console.info("Error: ",error);
      var alertPopup = $ionicPopup.alert({
              title: 'Error',
              template: 'Usuario y/o password incorrectos!' //'Please check your credentials!'
            });
    })
  }

  function Verificar(){
    $scope.show($ionicLoading);
    firebase.auth().currentUser.sendEmailVerification()
    .then(function(respuesta){
      $scope.hide($ionicLoading);
      console.info("Respuesta: ", respuesta);
      var alertPopup = $ionicPopup.alert({
              title: 'Atencion',
              template: 'Necesita verificar su email. Por favor, revise su correo electronico!' //'Please check your credentials!'
        });
    })
    .catch(function(error){
      $scope.hide($ionicLoading);
      console.info("Error: ",error);
      var alertPopup = $ionicPopup.alert({
              title: 'Error',
              template: 'Usuario y/o password incorrectos!' //'Please check your credentials!'
            });
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

.controller('controlMostrar', function($scope, $state, $ionicLoading,$ionicPopup, $timeout, DesafioService, UsuarioService) {
  $scope.mostrar=false;
  $scope.aceptados=false;
  $scope.todos=true;
  $scope.titulo="Desafios Vigentes";
  $scope.datos=[];
  $scope.usuarios = [];
  $scope.usuario = {};
  
  $scope.show($ionicLoading);
  $timeout(function(){
      $scope.datos = DesafioService.getAll();

      $scope.datos.$loaded(function() { //espera a que finalice la llamada a firebase
        console.log($scope.datos);
        $scope.hide($ionicLoading); 
      });

     },100);

  $timeout(function(){
    $scope.usuarios = UsuarioService.getAll();
    $scope.usuario = UsuarioService.getById(firebase.auth().currentUser.uid);

    console.log($scope.usuarios);
    console.log(firebase.auth().currentUser.uid);
    
    console.log($scope.usuario);
  
    if($scope.usuario.primerInicio)
    {
      var alertPopup = $ionicPopup.alert({
          title: 'Bienvenido!',
          template: 'Ha obtenido $1000.00 de credito de regalo por unica vez.' 
        });

      $scope.usuario.primerInicio = false;
      UsuarioService.save($scope.usuario);
    }
  },100);

  

  $scope.mostrarDesafio = function(index){
    // cambia al state de mostrar el desafio pasandole el index
    $state.go('app.apuesta', {desafio:index} );
  }

  $scope.Terminado=function(desafio){
    desafio.disponible=false;

  }
})

.controller('controlDesafio', function($scope, $ionicPopup, $state, $stateParams, DesafioService) {
  $scope.desafio={};
  $scope.desafio.creador = firebase.auth().currentUser.email;
  $scope.desafio.disponible=true;
  $scope.desafio.computado=false;
  $scope.desafio.jugador="";
  
  //$scope.fecha=new Date();

  //$scope.desafio.fechaFin = $scope.fecha.getTime();

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
        
        alert(fechaFin);
      }

      $scope.desafio.fechaInicio = new Date().getTime(); //firebase.database.ServerValue.TIMESTAMP;
      $scope.desafio.fechaFin = fechaFin.getTime();

      DesafioService.add($scope.desafio);

      $ionicPopup.alert({
         title: 'El desafio se ha guardado correctamente',
         okType: 'button-balanced'
      });

      $state.go('app.mostrar');
    }
})

.controller('controlApuesta', function($scope, $ionicPopup, $state, $stateParams, UsuarioService, $ionicLoading, DesafioService, $timeout) {
  var index = $stateParams.desafio;
  $scope.usuario = {};
  $scope.credito=0;

  $scope.desafio = DesafioService.getByIndex(index)
  
  //$scope.desafio.jugador=firebase.auth().currentUser.email;
  
  $scope.usuario = UsuarioService.getById(firebase.auth().currentUser.uid);
  
  if($scope.usuario)
    $scope.credito = $scope.usuario.credito;
  
  $scope.Guardar=function(){
      $scope.desafio.computado = true;
      DesafioService.save($scope.desafio);

      $ionicPopup.alert({
         title: 'El desafio se ha guardado correctamente',
         okType: 'button-balanced'
      });

      $state.go('app.mostrar');
  }
})

.controller('controlAceptados', function($scope, $state, $stateParams, DesafioService, $ionicLoading, $timeout) {
  $scope.mostrar=false;
  $scope.aceptados=true;
  $scope.todos=false;
  $scope.titulo="Desafios Aceptados";
  $scope.email= $stateParams.email;
  $scope.datos=[];
  
  $scope.show($ionicLoading);
  $timeout(function(){
      $scope.datos = DesafioService.getAll();

      $scope.datos.$loaded(function() { //espera a que finalice la llamada a firebase
        console.log($scope.datos);
        $scope.hide($ionicLoading); 
      });

     },100);
})


.controller('controlMisDesafios', function($scope, $state, $stateParams, DesafioService, $ionicLoading, $timeout) {
  $scope.email= $stateParams.email;
  $scope.titulo="Mis Desafios";
  $scope.mostrar=true;
  $scope.todos=false;
  $scope.aceptados=false;

  $scope.datos=[];
  
  $scope.show($ionicLoading);
  $timeout(function(){
      $scope.datos = DesafioService.getAll();

      $scope.datos.$loaded(function() { //espera a que finalice la llamada a firebase
        console.log($scope.datos);
        $scope.hide($ionicLoading); 
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
