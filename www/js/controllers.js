angular.module('starter.controllers', [])

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

.controller('controlMostrar', function($scope, $state, $ionicPopup, $ionicLoading, $timeout) {
  $scope.show = function() {
    $ionicLoading.show({
      template: '<ion-spinner icon="android"></ion-spinner>'
      
    });
  };

  $scope.hide = function(){
        $ionicLoading.hide();
  };

  $scope.datos=[];
  
  $scope.show($ionicLoading);

  var desafios=firebase.database().ref('DESAFIOS/');
  desafios.on('child_added', function (snapshot) {
        $timeout(function(){
        var desafio = snapshot.val();
        var fecha = new Date(desafio.fecha);
        var dia = fecha.getDay();
        var mes = fecha.getMonth();
        var anio = fecha.getFullYear();
        desafio.fecha=dia+"/"+mes+"/"+anio;
        $scope.datos.push(desafio);
      });
  });

  $scope.hide($ionicLoading); 

  console.log($scope.datos);

})

.controller('controlDesafio', function($scope, $ionicPopup, $state) {
  $scope.desafio={};

  $scope.Aceptar=function(){

    if(firebase.auth().currentUser != null && firebase.auth().currentUser != undefined){
      $scope.desafio.creador = firebase.auth().currentUser.email;
      $scope.desafio.disponible=true;
      $scope.desafio.computado=false;
      $scope.desafio.jugador="";
      $scope.desafio.fecha = firebase.database.ServerValue.TIMESTAMP;

      var carga=firebase.database().ref('DESAFIOS/');
      carga.push($scope.desafio);
      $ionicPopup.alert({
         title: 'El desafio se ha guardado correctamente',
         okType: 'button-balanced',
      });

      $state.go('app.mostrar');

    }
    else{
      $ionicPopup.alert({
         title: 'El usuario no se encuentra logueado',
         okType: 'button-balanced',
      });
    }

  }
});

/*
.controller('controlConsumo', function($scope, $timeout, $state, $ionicPopup) {
  $scope.codigo={};
  var cargas=[];
  var ref=firebase.database().ref('SALDOS/');
  ref.on('child_added', function (snapshot) {
        $timeout(function(){
        var saldo = snapshot.val();
        cargas.push(saldo);
      });
  });
  
  $scope.Aceptar=function(){
    var i;

    for( i=0 ; i<cargas.length; i++)
    {
        if(cargas[i].codigo==$scope.codigo.saldo)
        {
          if(!cargas[i].consumido)
          {
            cargas[i].usuario=firebase.auth().currentUser.email;
            cargas[i].consumido=true;
            $ionicPopup.alert({
              title: 'Saldo consumido correctamente',
              okType: 'button-energized',
            });
            ref.set(cargas);
            $state.go('login');
            break;
          }
          else
          {
            $ionicPopup.alert({
              title: 'El saldo ya ha sido consumido',
              okType: 'button-energized',
            });
            break;
          }
        } 
    }

    if(i==cargas.length)
    {
      $ionicPopup.alert({
          title: 'El codigo no existe',
          okType: 'button-energized',
       });
    }
  }

});
*/
