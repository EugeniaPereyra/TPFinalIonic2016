// angular.module('starter.factories', ["firebase"])
//     //Service
//     .service('DesafioService', ["$firebaseArray", 
//         function($firebaseArray){

//             function Init(){
//                 var ref = firebase.database().ref('DESAFIOS/');
//                 var arrayDesafios = $firebaseArray(ref);
//                 return arrayDesafios;
//             }

//             return {
//                 getAll: function(){
//                     return Init();
//                 },

//                 getByIndex: function(index){
//                     var ref = Init();
//                     return ref[index];
//                 },
//                 //
//                 add: function(desafio){
//                     var ref = Init();
//                     ref.$add(desafio).then(function(ref){
//                         var id = ref.key;
//                         console.log("Se agrego el id " + id);
//                     });
//                 },
//                 save: function(index){
//                     var ref = Init();
//                     ref.$save(index).then(function(ref){
//                         var id = ref.key;
//                         console.log("Se modifico el item con id " + id);
//                     })
//                 }

//             };
//         }])

//     .service('UsuarioService', ["$firebaseArray", 
//         function($firebaseArray){

//             function Init(){
//                 var ref = firebase.database().ref('USUARIOS/');
//                 var arrayUsuarios = $firebaseArray(ref);
//                 return arrayUsuarios;
//             }

//             return {
//                 getAll: function(){
//                     return Init();
//                 },

//                 getByIndex: function(index){
//                     var ref = Init();
//                     console.info(arrayUsuarios);
//                     return ref[index];
//                 },

//                 getById: function(id){
//                     var ref = Init();
//                     return ref.$getRecord(id);
//                 },

//                 add: function(usuario){
//                     var refUsuarios = Init();
//                     refUsuarios.child('USUARIOS/' + usuario.id);
//                     refUsuarios.set( { credito: usuario.credito, primerInicio: usuario.primerInicio }, function(error){
//                         if (error)
//                             console.log("Error al guardar el usaurio. Detalle: " + error)
//                         else
//                             console.log("Se agrego el usuario " + usuario.id + "a la base de datos."); 
//                     });
//                 },
//                 save: function(index){
//                     var refUsuarios = Init();
//                     refUsuarios.$save(index).then(function(ref){
//                         var id = ref.key;
//                         console.log("Se modifico el usuario con id " + id);
//                     })
//                 }
//             };
//         }]);

//--------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------


angular.module('starter.factories', ['firebase'])

  // .service('Base',['$firebaseArray',
  //   function($firebaseArray, $rootScope){

  //     this.referencia = referencia;
  //     this.listado = listado;
  //     this.cargarUID = cargarUID;
  //     this.cargar = cargar;
  //     this.updateUID = updateUID;
  //     this.update = update;



  //     function updateUID(objeto, dato){
  //       return firebase.database().ref(agregar(dato)).update(objeto);
  //     }


  //     function update(objeto, dato){
  //       return firebase.database().ref(dato).update(objeto);
  //     }

  //   }])

  .service('DesafioService',['$firebaseArray',
    function($firebaseArray){

      this.cargarDesafio = cargarDesafio;
      this.cargarUsuario = cargarUsuario;
      this.getDesafios = getDesafios;
      this.getUsuarios = getUsuarios;      




      function cargarDesafio(objeto){
        var referencia = firebase.database().ref();
        referencia.child('DESAFIOS/');
        var arrayUsuarios = $firebaseArray(referencia);
        arrayUsuarios.$add(objeto)
            .then(function(ref){
              return ref.key;
            })
            .catch(function(error){
              return error;
            })
      }


      function cargarUsuario(objeto){
        var referencia = firebase.database().ref();
        referencia.child('USUARIOS/' + objeto.id);
        var arrayUsuarios = $firebaseArray(referencia);
        arrayUsuarios.set(objeto)
            .then(function(ref){
              return ref.key;
            })
            .catch(function(error){
              return error;
            })
      }


      function getDesafios(){
        var referencia = firebase.database().ref();
        referencia.child('DESAFIOS/');
        var arrayDesafios = $firebaseArray(referencia);
        return arrayDesafios;
      }


      function getUsuarios(){
        var referencia = firebase.database().ref();
        referencia.child('USUARIOS/');
        var arrayUsuarios = $firebaseArray(referencia);
        return arrayUsuarios;
      }
}]);