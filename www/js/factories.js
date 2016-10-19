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
                }
            };
        }])

    // Entidad
    .factory('Desafio', ['$http', function($http, $firebaseArray) {  
        function Desafio(desafioData) {
            if (desafioData) {
                this.setData(desafioData);
            }
            // Some other initializations related to desafio
        };

        Desafio.prototype = {
            setData: function(desafioData) {
                angular.extend(this, desafioData);
            },
            load: function(id) {
                var scope = this;
                $http.get('ourserver/desafios/' + desafioId).success(function(desafioData) {
                    scope.setData(desafioData);
                });
            },
            delete: function() {
                $http.delete('ourserver/desafios/' + desafioId);
            },
            update: function() {
                $http.put('ourserver/desafios/' + desafioId, this);
            },
            getAll: function() {

            }
            /*,
            getImageUrl: function(width, height) {
                return 'our/image/service/' + this.desafio.id + '/' + width + '/' + height;
            },
            isAvailable: function() {
                if (!this.desafio.stores || this.desafio.stores.length === 0) {
                    return false;
                }
                return this.desafio.stores.some(function(store) {
                    return store.quantity > 0;
                });
            }*/
        };
        
        return Desafio;
    }]);