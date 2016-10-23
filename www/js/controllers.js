angular.module('starter.controllers', ['starter.factories'])

.controller('controlLogin', function($scope, $state, $ionicLoading, $ionicPopup) {

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
  $scope.usuario = {};
  
  $scope.show($ionicLoading);
  $scope.datos = DesafioService.getAll();

  $scope.datos.$loaded(function() { //espera a que finalice la llamada a firebase
    console.log($scope.datos);
    $scope.hide($ionicLoading); 
  });

  $timeout(function(){
    $scope.usuario = UsuarioService.getById(firebase.auth().currentUser.uid);
  },100);

  if(!$scope.usuario)
  {
    var usuario={};
    usuario.id=firebase.auth().currentUser.uid;
    usuario.credito=1000;
    
    $timeout(function() {
      UsuarioService.add(usuario);
    }, 100);

    var alertPopup = $ionicPopup.alert({
        title: 'Bienvenido!',
        template: 'Ha obtenido $1000.00 de credito de regalo por unica vez.' 
      });
  }

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
  $scope.desafio.fechaInicio = firebase.database.ServerValue.TIMESTAMP;
  $scope.fecha=new Date();
  $scope.desafio.fechaFin = $scope.fecha.getTime();

  $scope.Aceptar=function(){

      DesafioService.add($scope.desafio);

      $ionicPopup.alert({
         title: 'El desafio se ha guardado correctamente',
         okType: 'button-balanced'
      });

      $state.go('app.mostrar');
    }
})

.controller('controlApuesta', function($scope, $ionicPopup, $state, $stateParams, UsuarioService, $ionicLoading, DesafioService) {
  var index = $stateParams.desafio;
  
  $scope.desafio = DesafioService.getByIndex(index)
  
  $scope.desafio.jugador=firebase.auth().currentUser.email;
  $scope.credito=0;

  //$scope.usuarios=[];
  console.log(firebase.auth().currentUser.uid);
  $scope.show($ionicLoading);
  $scope.usuario = UsuarioService.getById(firebase.auth().currentUser.uid);
  console.log(firebase.auth().currentUser.uid);
  console.log($scope.usuario);
  
  $scope.usuarios = [];
  $scope.usuarios = UsuarioService.getAll();
  $scope.usuarios.$loaded(function() { //espera a que finalice la llamada a firebase
    console.log($scope.usuarios);
    $scope.hide($ionicLoading); 
  });

  //$scope.credito=$scope.usuario.credito;
  //console.log(firebase.auth().currentUser);
/*
  angular.forEach($scope.usuarios, function(value, index){
    //console.log(value);
    if(value.id==firebase.auth().currentUser.uid)
    {
      $scope.credito=value.credito;
    }
  });
*/

  // ACA MODIFICAR LAS COSAS DESAFIO Y USUARIO
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


//1477005223306

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

