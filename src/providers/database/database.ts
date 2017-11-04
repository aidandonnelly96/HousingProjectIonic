import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { Geolocation } from '@ionic-native/geolocation';
import { Loading, LoadingController,  Events } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth'


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
  loading: Loading;

  constructor(public events: Events, public auth: AuthProvider, public loadingCtrl: LoadingController) {}

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
                if(snap.val().postStatus!="draft"){
                    if(status==undefined || status==snap.val().status || status=="Any" || status.length==0){
                        if(buildingType==undefined || buildingType==snap.val().buildingType || buildingType=="Any" || buildingType.length==0){
                            me.homes.push(snap.val());
                            me.events.publish('new home', home, Date.now());
                            me.events.publish('home:entered',me.homes,Date.now());
                        }
                    }
                }
        });
    });
    this.homes = me.homes;
    this.events.publish('home:entered',this.homes,Date.now());
}

postHome(title, address, info, status, buildingType, imageData, postStatus, key) {
  this.loading = this.loadingCtrl.create();
  this.loading.present();
  this.geoFire = new Geofire(firebase.database().ref('locations-ref'));
  var downloadURLs = [];
  var newHomeKey = "";
  if(key==""){
    newHomeKey = firebase.database().ref().child('homes').push().key;
  }
  else{
    newHomeKey=key;
  }
  
    var homeData = {
        id: newHomeKey,
        title: title,
        address: address,
        status: status,
        buildingType: buildingType,
        info: info,
        userID: this.auth.getCurrentUser().uid,
        lat: this.userLat,
        long: this.userLng,
        postStatus: postStatus,
        posted: new Date().getTime()
    };
    var updates = {};
    var me = this;
    updates['/homes/' + newHomeKey] = homeData;
    firebase.database().ref().update(updates);
    
      for(let image of imageData){
        var promises=[];
        if(image.state=="new"){
            console.log(imageData[0]);
            (function (i){
               var newImageKey = firebase.database().ref().child('images').push().key;
               console.log(newImageKey);
               var imageRef = firebase.storage().ref('images/' + newHomeKey + '/' + newImageKey);
               var uploadTask = imageRef.putString(i.data, 'base64', {contentType: 'image/jpg'});
               uploadTask.on('state_changed', function(snapshot){
                }, function(error) {

                }, function() {
                    promises.push(imageRef.getDownloadURL().then(function(url){
                        console.log(url);
                        me.urls.push(url);
                        firebase.database().ref('/images/'+newImageKey).set({url: url, forHome: newHomeKey});
                        return firebase.database().ref('/homes/'+newHomeKey+'/thumbnail').set({url: me.urls[0]});
                    }));
                    return Promise.all(promises).then(function(data){
                        if(postStatus=="published"){
                            me.geoFire.set(newHomeKey, [me.userLat, me.userLng]).then(function() {
                                console.log("Provided key has been added to GeoFire");
                                console.log(promises);
                                me.loading.dismiss();
                             }, function(error) {
                                me.loading.dismiss();
                                console.log("Error: " + error);
                            })
                        }
                        else{
                            me.loading.dismiss();
                        }
                    });
                });
            })(image);
            console.log(promises);
        }
    }
}
    
addToFavourites(homeID){
        var newFavouriteKey = firebase.database().ref().child('favourites').push().key;
        var favData = {
            userID: this.auth.getCurrentUser().uid,
            homeID: homeID,
        };
        var updates  = {};
        updates['/favourites/' + newFavouriteKey] = favData;
        firebase.database().ref().update(updates);
}
}
