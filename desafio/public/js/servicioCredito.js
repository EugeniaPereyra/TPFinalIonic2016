'use strict';
angular.module('credito.servicios', ["firebase"])

    //Service
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

            this.remove = function(index){
                    this.arrayCreditos.$remove(index).then(function(ref){
                        console.log("Se elimino credito");
                    })
                };

            this.getById = function(id){
                    return this.arrayCreditos.$loaded().then(function(datos){
                        return datos.$getRecord(id);
                    })
                };
        }])
;


//--------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------
