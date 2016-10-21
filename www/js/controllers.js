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

          if(firebase.auth().currentUser.emailVerified)
          {
            $state.go('app.mostrar');
          }
          else
          {
            Verificar();
          }
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

})

.controller('controlMostrar', function($scope, $state, $ionicLoading,$ionicPopup, $timeout, DesafioService, UsuarioService) {
  $scope.mostrar=false;
  $scope.todos=true;
  $scope.titulo="Desafios Vigentes";
  $scope.datos=[];
  $scope.usuarios=[];
  var i=0;
  
  $scope.show($ionicLoading);
  $timeout(function(){
      $scope.datos = DesafioService.getAll();

      $scope.datos.$loaded(function() { //espera a que finalice la llamada a firebase
        console.log($scope.datos);
        $scope.hide($ionicLoading); 
      });

     },100);

  $scope.show($ionicLoading);
  $timeout(function(){
      $scope.usuarios = UsuarioService.getAll();

      $scope.usuarios.$loaded(function() { //espera a que finalice la llamada a firebase
        console.log($scope.usuarios);
        $scope.hide($ionicLoading); 
      });

     },100);


  angular.forEach($scope.usuarios, function(value, index){
    console.log(value);
    if(value.id==firebase.auth().currentUser.uid)
    {
      i=1;
    }
  });
  if(i==0)
  {
    var usuario={};
    usuario.id=firebase.auth().currentUser.uid;
    usuario.credito=1000;
            
    UsuarioService.add(usuario);

    var alertPopup = $ionicPopup.alert({
        title: 'Bienvenido!',
        template: 'Ha obtenido $1000.00 de credito de regalo por unica vez.' 
      });
  }

  $scope.mostrarDesafio = function(index){
    // cambia al state de mostrar el desafio pasandole el index
    //console.log(DesafioService.getByIndex(index));
    var dato=JSON.stringify(DesafioService.getByIndex(index));
    $state.go('app.apuesta', {desafio:dato} );
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

.controller('controlApuesta', function($scope, $state, $stateParams, UsuarioService, $ionicLoading) {
  $scope.desafio=JSON.parse($stateParams.desafio);
  $scope.desafio.jugador=firebase.auth().currentUser.email;
  $scope.credito=0;

  $scope.usuarios=[];
  $scope.show($ionicLoading);
  $scope.usuarios = UsuarioService.getAll();
  $scope.usuarios.$loaded(function() { //espera a que finalice la llamada a firebase
    console.log($scope.usuarios);
    $scope.hide($ionicLoading); 
  });

  //console.log(firebase.auth().currentUser);

  angular.forEach($scope.usuarios, function(value, index){
    console.log(value);
    if(value.id==firebase.auth().currentUser.uid)
    {
      $scope.credito=value.credito;
    }
  });

// ACA MODIFICAR LAS COSAS DESAFIO Y USUARIO
  // $scope.Aceptar=function(){

  //     DesafioService.add($scope.desafio);

  //     $ionicPopup.alert({
  //        title: 'El desafio se ha guardado correctamente',
  //        okType: 'button-balanced'
  //     });

  //     $state.go('app.mostrar');
  //   }
})

.controller('controlAceptados', function($scope, $state, $stateParams, UsuarioService, $ionicLoading) {

})


.controller('controlMisDesafios', function($scope, $state, $stateParams, DesafioService, $ionicLoading, $timeout) {
  $scope.email= $stateParams.email;
  $scope.titulo="Mis Desafios";
  $scope.mostrar=true;
  $scope.todos=false;

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

