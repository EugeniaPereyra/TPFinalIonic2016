angular.module('starter.controllers', ['starter.factories'])

.controller('controlLogin', function($scope, $state, $ionicLoading, $ionicPopup, $timeout, UsuarioService) {

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
          //console.info("Respuesta: ",respuesta);
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

.controller('controlMostrar', function($scope, $state, $ionicPopup, $timeout, DesafioService, UsuarioService) {
  $scope.mostrar=false;
  $scope.aceptados=false;
  $scope.todos=true;
  $scope.titulo="Desafios Vigentes";
  $scope.datos=[];
  $scope.usuario = {};
  $scope.DateNow = new Date().getTime();
  $scope.userID = firebase.auth().currentUser.uid;
  
  $scope.showLoading();

  DesafioService.getAll().then(function(respuesta){
    console.info("desafios:" +respuesta);
    $scope.datos = respuesta;
  },function(error){
    console.log(error);
  })

  UsuarioService.getAll().then(function(respuesta){
    console.info(respuesta);
  },function(error){
      console.log(error);
    });

  UsuarioService.getById($scope.userID).then(function(respuesta){
      console.info("suaurio:"+respuesta);
      $scope.usuario=respuesta;
      if($scope.usuario.primerInicio)
      {
        $scope.showPopup('Bienvenido!', 'Ha obtenido $1000.00 de credito de regalo por unica vez.');
        $scope.usuario.primerInicio = false;
        //console.info($scope.usuario);
        UsuarioService.save($scope.usuario);
      }
    },function(error){
      console.log(error);
    })
  
  $scope.hideLoading();  

  $scope.mostrarDesafio = function(index){
    $state.go('app.apuesta', {desafio:index} );
  }

  $scope.Terminado=function(desafio){
    desafio.disponible=false;
  }
})

.controller('controlDesafio', function($scope, $ionicPopup, $state, $stateParams, $timeout, DesafioService, UsuarioService) {
  $scope.usuario = {};
  $scope.desafio = {};
  $scope.desafio.creador = firebase.auth().currentUser.uid;
  $scope.desafio.disponible=true;
  $scope.desafio.computado=false;
  $scope.desafio.jugador="";
  //$scope.desafio.respuestaElegida = "";
  
  
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

      var id = firebase.auth().currentUser.uid;
      UsuarioService.getById(id).then(function(respuesta){
        //console.info(respuesta);
        $scope.usuario=respuesta;
        if($scope.usuario.credito < $scope.desafio.valor)
        {
          $scope.showPopup('Saldo Insuficiente', 'No posee el crédito suficiente para crear un desafío por el valor ingresado.');
          return;
        }

        DesafioService.add($scope.desafio);
        console.log("Desafio agregado");
      },function(error){});

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
  },function(error){});

  var id = firebase.auth().currentUser.uid;
  UsuarioService.getById(id).then(function(respuesta){
    $scope.usuario=respuesta;
    if($scope.usuario)
      $scope.credito = $scope.usuario.credito;
  },function(error){});

  $scope.Guardar=function(){
      $scope.desafio.jugador = $scope.usuario.$id;
      if($scope.usuario.credito < $scope.desafio.valor){
        $scope.showPopup('Saldo Insuficiente', 'No posee el crédito suficiente para aceptar este desafío.');
        //$scope.desafio.respuestaElegida = "";
        return;
      }

      DesafioService.save($scope.desafio);
      console.log("Desafio modificado");
      $scope.showPopup('El desafio ha sido aceptado. El jugador que creó el desafío decidirá quién es el ganador.', '', 'button-balanced');

      $state.go('app.mostrar');
  }
})

.controller('controlAceptados', function($scope, $state, DesafioService, $timeout) {
  $scope.mostrar=false;
  $scope.aceptados=true;
  $scope.todos=false;
  $scope.titulo="Desafios Aceptados";
  $scope.userID = firebase.auth().currentUser.uid;
  $scope.datos=[];
  $scope.DateNow = new Date().getTime();
  
  $scope.showLoading();
  
  DesafioService.getAll().then(function(respuesta){
    $scope.datos=respuesta;
    $scope.hideLoading(); 
  },function(error){});
})


.controller('controlMisDesafios', function($scope, $state, DesafioService, $timeout) {
  $scope.userID = firebase.auth().currentUser.uid;
  $scope.titulo="Mis Desafios";
  $scope.mostrar=true;
  $scope.todos=false;
  $scope.aceptados=false;
  $scope.DateNow = new Date().getTime();
  $scope.datos=[];
  
  $scope.showLoading();

  DesafioService.getAll().then(function(respuesta){
    $scope.datos=respuesta;
    $scope.hideLoading(); 
  },function(error){});
})

.controller('AutorCtrl', function($scope) {
  $scope.autor={};
  $scope.autor.nombre="Maria Eugenia Pereyra";
  $scope.autor.foto="img/autor.jpg";
  $scope.autor.email="meugeniape@gmail.com";
  $scope.autor.github="https://github.com/EugeniaPereyra";
});
