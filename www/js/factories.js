angular.module('starter.factories', ["firebase"])
    //Service
    .service('DesafioService', ["$firebaseArray", 
        function($firebaseArray){
            var ref = firebase.database().ref('DESAFIOS/');
            var arrayDesafios = $firebaseArray(ref);

            return {
                getAll: function(){
                    return arrayDesafios;
                },

                getByIndex: function(index){
                    return arrayDesafios[index];
                },
                //
                add: function(desafio){
                    arrayDesafios.$add(desafio).then(function(ref){
                        var id = ref.key;
                        console.log("Se agrego el id " + id);
                    });
                },
                save: function(index){
                    arrayDesafios.$save(index).then(function(ref){
                        var id = ref.key;
                        console.log("Se modifico el item con id " + id);
                    })
                }

            };
        }])

    .service('UsuarioService', ["$firebaseArray", 
        function($firebaseArray){
            var ref = firebase.database().ref('USUARIOS/');
            var arrayUsuarios = $firebaseArray(ref);

            return {
                getAll: function(){
                    return arrayUsuarios;
                },

                getByIndex: function(index){
                    return arrayUsuarios[index];
                },

                getById: function(id){
                    return arrayUsuarios.$getRecord(id);
                },

                add: function(usuario){
                    var refUsuarios = firebase.database().ref().child('USUARIOS/' + usuario.id);
                    refUsuarios.set( { credito: usuario.credito, primerInicio: usuario.primerInicio }, function(error){
                        if (error)
                            console.log("Error al guardar el usaurio. Detalle: " + error)
                        else
                            console.log("Se agrego el usuario " + usuario.id + "a la base de datos."); 
                    });
                },
                save: function(index){
                    arrayUsuarios.$save(index).then(function(ref){
                        var id = ref.key;
                        console.log("Se modifico el usuario con id " + id);
                    })
                }
            };
        }]);