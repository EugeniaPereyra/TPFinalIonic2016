angular.module('desafio.controllers', [])

.controller('controlDesafio', function($scope, $ionicPopup, $state, $stateParams, $timeout, DesafioService, UsuarioService) {
  $scope.usuario = {};
  $scope.desafio = {};
  $scope.desafio.creador = firebase.auth().currentUser.uid;
  $scope.desafio.disponible=true;
  $scope.desafio.computado=false;
  $scope.desafio.jugador="";
  $scope.desafio.valor=50;
  $scope.desafio.quienGano="";
  $scope.desafio.quienPerdio="";
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
          fechaFin.setDate(fechaFin.getDate() + parseInt($scope.tiempo.dias));
        if ($scope.tiempo.horas != 0)
          fechaFin.setHours(fechaFin.getHours() + parseInt($scope.tiempo.horas));
        if ($scope.tiempo.minutos != 0)
          fechaFin.setMinutes(fechaFin.getMinutes() + parseInt($scope.tiempo.minutos));
        if ($scope.tiempo.segundos != 0)
          fechaFin.setSeconds(fechaFin.getSeconds() + parseInt($scope.tiempo.segundos));
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
});