/*
var query = ref.orderByChild('users').equalTo(userid);
var syncArray = $firebaseArray(query);
*/
//app
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

                add: function(usuario){
                    arrayUsuarios.$add(usuario).then(function(ref){
                        var id = ref.key;
                        console.log("Se agrego el id " + id);
                    });
                }
            };
        }]);