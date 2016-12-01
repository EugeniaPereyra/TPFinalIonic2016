angular.module('menu.controllers', [])

.controller('controlMenu', function($scope, $state, $ionicLoading, $ionicPopup) {

  $scope.UsuarioLogueado=firebase.auth().currentUser;
  if($scope.UsuarioLogueado== null || $scope.UsuarioLogueado == undefined)
  {
    $state.go('login');
  }

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

  $scope.Creditos = function(){
    $state.go('app.creditos');
  }

  $scope.Perfil = function(){
    $state.go('app.perfil');
  }

  $scope.Autor = function(){
    $state.go('app.autor');
  }
});