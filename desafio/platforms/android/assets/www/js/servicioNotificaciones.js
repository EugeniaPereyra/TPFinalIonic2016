'use strict';
angular.module('push.servicio', ["firebase"])

.service('NotificationService', ["$http", 
    function ($http) {
      var url = "https://fcm.googleapis.com/fcm/send"; 

      function getURL(){
        return url;
      }

      this.sendNotification = function (uid, title, body) {
        var http = new XMLHttpRequest();
        var url = getURL();
        var params = JSON.stringify(
                                    {
                                      to:"/topics/"+uid,
                                      notification:{
                                                      title : title,
                                                      body : body,
                                                      icon: "../img/brain.png",
                                                      priority : 10
                                                    }
                                    });

        http.open("POST", url, true);
        http.setRequestHeader("Content-type", "application/json");
        http.setRequestHeader('Authorization', 'key=AIzaSyCijPiOGmmrAWQ8-liUaY-kAVdVBYuh880');

        http.onreadystatechange = function() {
            if(http.readyState == 4 && http.status == 200) {
                console.log(http.responseText);
            }
        }
        http.send(params);
      }
    }
]);



//--------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------
