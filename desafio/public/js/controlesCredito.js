angular.module('credito.controllers', [])

.controller('CreditosCtrl', function($scope, CreditoService, $state) {
  $scope.credito = {}; 
  $scope.cantidad ={}; 

  $scope.Aceptar=function(){
        CreditoService.add($scope.cantidad,$scope.credito);
        $scope.showPopup('Los creditos se han generado correctamente', '', 'button-balanced');   
        $state.go('app.mostrar');    
    }
})

.controller('controlCargar', function($scope, CreditoService, UsuarioService, $state, $stateParams, $cordovaBarcodeScanner) {
  var idUsr = firebase.auth().currentUser.uid;
  $scope.usuario = {};
  $scope.credito = {};
  $scope.creditos = {}; 
  $scope.carga = {};
  $scope.cambia={};
  $scope.cambia.nombre="";
  $scope.mostrarCambiar=false;
  $scope.mostrarCargar=false;

  var dato=$stateParams.accion;
  if(dato=="cambiar")
  {
    $scope.mostrarCambiar=true;
    $scope.mostrarCargar=false;
  }
  if(dato=="cargar")
  {
    $scope.mostrarCargar=true;
    $scope.mostrarCambiar=false;
  }

  CreditoService.getAll().then(function(respuesta){
    $scope.creditos=respuesta;
  },function(error){
    console.log(error);
  });
  UsuarioService.getById(idUsr).then(function(respuesta){
      $scope.usuario = respuesta;
    },function(error){
    console.log(error);
  });

  $scope.Cargar=function(){    
        CreditoService.getById($scope.carga.id).then(function(respuesta){
          $scope.credito=respuesta;
          $scope.usuario.credito += parseInt($scope.credito.valor);
          UsuarioService.save($scope.usuario); 
          CreditoService.remove($scope.credito);
          $scope.showPopup('Correcto!', 'Carga de credito realizada correctamente');
          $state.go('app.perfil');
        });  
      } 

  $scope.Escanear=function(){
    try
    {
      document.addEventListener("deviceready", function () {
          $cordovaBarcodeScanner.scan()
          .then(function(barcodeData) {
            if(barcodeData.text!=""){
              CreditoService.getById(barcodeData.text).then(function(respuesta){
                $scope.credito=respuesta;
                $scope.usuario.credito += parseInt($scope.credito.valor);
                UsuarioService.save($scope.usuario); 
                CreditoService.remove($scope.credito);
                $scope.showPopup('Correcto!', 'Carga de credito realizada correctamente');
                $state.go('app.perfil');
              }); 
            }
          }, function(error) {
            console.log(error);
          });
      }, false);
    }
    catch(err)
    {
      console.log("EL PLUGIN SOLO FUNCIONA EN CELULARES");
    }
  }

  $scope.Cambiar=function(){
        $scope.usuario.nombre=$scope.cambia.nombre;
        UsuarioService.save($scope.usuario);
        $scope.showPopup('Correcto', 'Se ha cambiado el nombre');
        $state.go('app.perfil');
      } 
})

.controller('controlPerfil', function($scope, $state, UsuarioService) {
  $scope.usuario = {};
  $scope.imagen={};
  $scope.imagen.foto="brain.png";
  $scope.showLoading();


  var id = firebase.auth().currentUser.uid;
  UsuarioService.getById(id).then(function(respuesta){
    $scope.usuario = respuesta;
    $scope.hideLoading(); 
  },function(error){
    console.log(error);
  });

  $scope.Cambiar=function(){
    var dato = "cambiar";
    $state.go('app.cargar',{accion: dato});
  }

  $scope.Cargar=function(){
    var dato = "cargar";
    $state.go('app.cargar',{accion: dato});
  }
});