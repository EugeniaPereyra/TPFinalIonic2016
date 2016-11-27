'use strict';
angular.module('starter.factories', ["firebase"])
    //Service
    .service('DesafioService', ["$firebaseArray", 
        function($firebaseArray){

            //var ref =firebase.database().ref('DESAFIOS/');
            //var arrayDesafios = $firebaseArray(ref);

            this.ref = firebase.database().ref('DESAFIOS/');
            this.arrayDesafios = $firebaseArray(this.ref);
           
            this.getAll = function(){
                    return this.arrayDesafios.$loaded().then(function(datos){
                        return datos;
                    })
                };

            this.getByIndex = function(index){
                    return this.arrayDesafios.$loaded().then(function(datos){
                        return datos[index];
                    })
                };
                //
            this.add = function(desafio){
                    this.arrayDesafios.$add(desafio).then(function(ref){
                        var id = ref.key;
                        console.log("Se agrego el id " + id);
                    });
                };
            
            this.save = function(index){
                    this.arrayDesafios.$save(index).then(function(ref){
                        var id = ref.key;
                        console.log("Se modifico el item con id " + id);
                    })
                };
        }])

    .service('CreditoService', ["$firebaseArray", 
        function($firebaseArray){

            this.ref = firebase.database().ref('CREDITOS/');
            this.arrayCreditos = $firebaseArray(this.ref);
           
            this.getAll = function(){
                    return this.arrayCreditos.$loaded().then(function(datos){
                        return datos;
                    })
                };

            this.add = function(cantidad, credito){
                for(var i=0;i<cantidad.valor;i++)
                {
                    this.arrayCreditos.$add(credito).then(function(ref){
                        var id = ref.key;
                        console.log("Se agrego el id " + id);
                    });
                }
            };
            
            this.save = function(index){
                    this.arrayCreditos.$save(index).then(function(ref){
                        var id = ref.key;
                        console.log("Se modifico el item con id " + id);
                    })
                };
        }])


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

        }]);

//--------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------
