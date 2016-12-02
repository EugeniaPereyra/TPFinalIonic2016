'use strict';
angular.module('desafio.servicios', ["firebase"])
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
            this.remove = function(index){
                    this.arrayDesafios.$remove(index).then(function(ref){
                        console.log("Se elimino desafio");
                    })
                };

            this.getById = function(id){
                    return this.arrayDesafios.$loaded().then(function(datos){
                        return datos.$getRecord(id);
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
;



//--------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------
