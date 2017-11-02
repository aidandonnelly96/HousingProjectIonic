import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { Geolocation } from '@ionic-native/geolocation';
import { Events } from 'ionic-angular';


import firebase from 'firebase';
import Geofire from 'geofire';


/*
  Generated class for the DatabaseProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
@Injectable()
export class DatabaseProvider {
  homes = [];
  urls=[];
  
  geoFire = new Geofire(firebase.database().ref('locations-ref'));
  
  currentLat: number; 
  currentLong: number;
  userLat: number; 
  userLng: number;

  constructor(public events: Events) {}

getRequestedHomes(currentLat, currentLong, radius, buildingType, status){
    this.homes = [];
    console.log("getting requested");
    this.currentLat=currentLat;
    this.currentLong=currentLong;    
    var geoQuery = this.geoFire.query({
      center: [currentLat, currentLong],
      radius: radius //kilometers
    });
    
    var home = {};
    var homes = [];
    var me=this;
    
    geoQuery.on("key_entered", function(key, location, distance) {
        home = { 
            id: key,
            distance: distance,
            location: location
        };

        var query = firebase.database().ref('/homes').child(key);
        query.once('value')
             .then(snap => {
                    console.log(snap.val().title);
                    if(status==undefined || status==snap.val().status || status=="Any" || status.length==0){
                        console.log(snap.val().title+" passed status statement");
                        if(buildingType==undefined || buildingType==snap.val().buildingType || buildingType=="Any" || buildingType.length==0){
                            console.log(snap.val().title+" passed BT statement");
                            console.log("if statement");
                            me.homes.push(snap.val());
                            me.events.publish('new home', home, Date.now());
                            me.events.publish('home:entered',me.homes,Date.now());
                        }
                    }
        });
    });
    this.homes = me.homes;
    this.events.publish('home:entered',this.homes,Date.now());
}

postNewHome(title, info, status, buildingType, imageData) {
  this.geoFire = new Geofire(firebase.database().ref('locations-ref'));
  var downloadURLs = [];

  var newHomeKey = firebase.database().ref().child('homes').push().key;
  
    var homeData = {
        id: newHomeKey,
        title: title,
        status: status,
        buildingType: buildingType,
        info: info,
        lat: this.userLat,
        long: this.userLng
    };
    var updates = {};
    var me = this;
    updates['/homes/' + newHomeKey] = homeData;
    firebase.database().ref().update(updates);
    
      for(let image of imageData){
        console.log(imageData[0]);
        (function (i){
           var newImageKey = firebase.database().ref().child('homes').push().key;
           console.log(newImageKey);
           var imageRef = firebase.storage().ref('images/' + newHomeKey + '/' + newImageKey);
           var uploadTask = imageRef.putString(image.data, 'base64', {contentType: 'image/png'});
           uploadTask.on('state_changed', function(snapshot){
            }, function(error) {

            }, function() {
                imageRef.getDownloadURL().then(function(url) {
                    console.log(url);
                    me.urls.push(url);
                    firebase.database().ref('/homes/'+newHomeKey+'/thumbnail').set({url: me.urls[0]});
                    return firebase.database().ref('/images/'+newImageKey).set({url: url, forHome: newHomeKey});
                });
            });
        })(image);
    }
  
    return this.geoFire.set(newHomeKey, [this.userLat, this.userLng]).then(function() {
        console.log("Provided key has been added to GeoFire");
    }, function(error) {
      console.log("Error: " + error);
    });
    }
 }
