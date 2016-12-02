angular.module('starter.controllers', [])

.controller('controlLogin', function($scope, $state, $ionicLoading, $ionicPopup, $timeout, UsuarioService, $cordovaVibration, NotificationService) {

  $scope.imagen={};
  $scope.imagen.foto="brain.png";

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
              try {
                    $cordovaVibration.vibrate(200);
                   FCMPlugin.subscribeToTopic($scope.UsuarioLogueado.uid);
              }
              catch (err) {
                  // ES WEB
                  console.log("LOS PLUGINS SOLO FUNCIONA EN CELULARES");
              }
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
              
              UsuarioService.add(usuario);
              console.log("usuario agregado");
              try {
                $cordovaVibration.vibrate(200);
                   FCMPlugin.subscribeToTopic($scope.UsuarioLogueado.uid);
              }
              catch (err) {
                  // ES WEB
                  console.log("LOS PLUGINS SOLO FUNCIONA EN CELULARES");
              }
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

  $scope.Administrador=function(){
    $scope.loginData.username="admin@admin.com";
    $scope.loginData.password="123123";
  }

  $scope.JugadorUno=function(){
    $scope.loginData.username="utn@utn.com";
    $scope.loginData.password="123456";
  }

  $scope.JugadorDos=function(){
    $scope.loginData.username="usr@usr.com";
    $scope.loginData.password="123456";
  }
})

.controller('AutorCtrl', function($scope) {
  $scope.autor={};
  $scope.autor.nombre="Maria Eugenia Pereyra";
  $scope.autor.foto="img/autor.jpg";
  $scope.autor.email="meugeniape@gmail.com";
  $scope.autor.github="https://github.com/EugeniaPereyra";
});
