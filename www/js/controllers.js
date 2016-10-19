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

    //var result = 
    firebase.auth().signInWithEmailAndPassword($scope.loginData.username,$scope.loginData.password)
        .then(function(respuesta){
          console.info("Respuesta: ",respuesta);
          $scope.loginData.username="";
          $scope.loginData.password="";

          $scope.hide($ionicLoading); 
          $state.go('app.mostrar');
        })
        .catch(function(error){
          console.info("Error: ",error);
          $scope.hide($ionicLoading);
          var alertPopup = $ionicPopup.alert({
              title: 'Login falló!',
              template: error //'Please check your credentials!'
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

          var usuario=firebase.database().ref('USUARIOS/');
          $scope.usuario={};
          $scope.usuario.id=respuesta.uid;
          $scope.usuario.credito=1000;
          usuario.push($scope.usuario);

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

  $scope.Logout = function() {
    firebase.auth().signOut();
    $state.go('login');
  };

})

.controller('controlMostrar', function($scope, $state, $ionicLoading, $timeout, DesafioService) {
  
  $scope.datos=[];
  
  $scope.show($ionicLoading);

  $scope.datos = DesafioService.getAll();

  $scope.datos.$loaded(function() { //espera a que finalice la llamada a firebase
    console.log($scope.datos);
    $scope.hide($ionicLoading); 
  });

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
  $scope.desafio.duracion=30;
  $scope.desafio.fecha = firebase.database.ServerValue.TIMESTAMP;

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

  console.log(firebase.auth().currentUser);
  console.log($scope.usuarios);

  for(var i=0;i<$scope.usuarios.lengh;i++)
  {
    if($scope.usuarios[i].id==firebase.auth().currentUser.uid)
    {
      $scope.credito=$scope.usuarios[i].credito;
    }
  }

// ACA MODIFICAR LAS COSAS DESAFIO Y USUARIO
  // $scope.Aceptar=function(){

  //     DesafioService.add($scope.desafio);

  //     $ionicPopup.alert({
  //        title: 'El desafio se ha guardado correctamente',
  //        okType: 'button-balanced'
  //     });

  //     $state.go('app.mostrar');
  //   }
});

