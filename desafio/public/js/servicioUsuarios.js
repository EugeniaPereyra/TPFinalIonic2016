'use strict';
angular.module('usuarios.servicio', ["firebase"])

    .service('UsuarioService', ["$firebaseArray", 
        function($firebaseArray){

            this.ref = firebase.database().ref('USUARIOS/');
            this.arrayUsuarios = $firebaseArray(this.ref);

            this.getAll = function(){
                    return this.arrayUsuarios.$loaded().then(function(datos){
                        return datos;
                    })
                };

            this.getByIndex = function(index){
                    return this.arrayUsuarios.$loaded().then(function(datos){
                        return datos[index];
                    })
                };

            this.getById = function(id){
                    return this.arrayUsuarios.$loaded().then(function(datos){
                        return datos.$getRecord(id);
                    })
                };

            this.add = function(usuario){
                    var refUsuarios = firebase.database().ref().child('USUARIOS/' + usuario.id);
                    refUsuarios.set( { credito: usuario.credito, primerInicio: usuario.primerInicio, nombre: usuario.nombre }, function(error){
                        if (error)
                            console.log("Error al guardar el usaurio. Detalle: " + error)
                        else
                            console.log("Se agrego el usuario " + usuario.id + "a la base de datos."); 
                    });
                };

            this.save = function(index){
                    this.arrayUsuarios.$save(index).then(function(ref){
                        var id = ref.key;
                        console.log("Se modifico el item con id " + id);
                    })
                };

        }])
;


//--------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------
