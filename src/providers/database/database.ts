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
  months: string[]=["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];


  constructor(public events: Events, public auth: AuthProvider, public loadingCtrl: LoadingController) {}
  
getRequestedHomes(currentLat, currentLong, radius, lower, upper,  status, time, buildingType, electricity, plumbing, furniture, rooms, roof, garden, windows){
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
                if(snap.val().postStatus=="published"){
                    if(status==undefined || status==snap.val().status || status=="Any" || status.length==0){
                        if(buildingType==undefined || buildingType==snap.val().buildingType || buildingType=="Any" || buildingType.length==0){
                            if(snap.val().EstPropertySize>=lower && snap.val().EstPropertySize<=upper){
                                if(time==undefined || time == "Any" || time==snap.val().timeLeftVacant || time.length==0){
                                    if(electricity="Any" || electricity == undefined || electricity.length==0 || electricity == snap.val().electricity){
                                         if(plumbing="Any" || plumbing == undefined || plumbing.length==0 || plumbing == snap.val().plumbing){
                                           if(furniture="Any" || furniture == undefined || furniture.length==0 || furniture == snap.val().furniture){
                                                    if(rooms="Any" || rooms == undefined || rooms.length==0 || rooms == snap.val().rooms){
                                                        if(roof="Any" || roof == undefined || roof.length==0 || roof == snap.val().roof){
                                                            if(garden="Any" || garden == undefined || garden.length==0 || garden == snap.val().garden){
                                                                if(windows="Any" || windows == undefined || windows.length==0 || windows == snap.val().windows){
                                                                    me.homes.push(snap.val());
                                                                    me.events.publish('new home', home, Date.now());
                                                                    me.events.publish('home:entered',home,Date.now());
                                                                }
                                                            }
                                                        }
                                                    }
                                            }
                                        }                               
                                    }
                                }
                            }
                        }
                    }
                }
        });
    });
    this.homes = me.homes;
    this.events.publish('home:entered',this.homes,Date.now());
}



postHome(title, address, info, status, buildingType, imageData, postStatus,  key, thumbUrl, lat, long, size, time, electricity, plumbing, furniture, rooms, roof, windows, garden, user, existingPhotos, currentPostStatus){
  this.geoFire = new Geofire(firebase.database().ref('locations-ref'));
  var downloadURLs = [];
  var precedes = [];
  var homeData = {};
  var newHomeKey = "";
  var existingHomeKey = "";
  var me = this;

  if(currentPostStatus=="published"){
    firebase.database().ref('/homes/'+key+'/postStatus').set("edited");
  }
  
  newHomeKey = firebase.database().ref().child('homes').push().key;
  
  if(lat==91 && long ==181){
    lat=this.userLat;
    long=this.userLng;
  }
  
  var historyQuery=firebase.database().ref('/homes/'+key+'/succeeds/');
  historyQuery.once('value')
    .then(snap=>{
        precedes.push(key);
        snap.forEach(function(data){
            precedes.push(data.val());
        });
        
        var dateSuffix="";
        var dt=new Date(Date.now());
        if((dt.getDate()-3)%10==0){
            dateSuffix="rd";
        }
        else if((dt.getDate()-2)%10==0){
            dateSuffix="nd";
        }
        else{
            dateSuffix="th";
        }
        var datePosted=dt.getDate()+dateSuffix+" "+this.months[dt.getMonth()]+" "+dt.getFullYear();
            
        if(currentPostStatus=="published"){
            homeData = {
                id: newHomeKey,
                title: title,
                address: address,
                status: status,
                buildingType: buildingType,
                info: info,
                userID: this.auth.getCurrentUser().uid,
                lat: lat,
                thumbnail: { url: thumbUrl },
                long: long,
                images: existingPhotos,
                postStatus: postStatus,
                EstPropertySize: size,
                timeLeftVacant: time,
                electricity: electricity,
                plumbing: plumbing,
                furniture: furniture,
                succeeds: precedes,
                rooms: rooms,
                roof: roof,
                windows: windows,
                garden: garden,
                usersRelation: user,
                posted: new Date().getTime(),
                datePosted: datePosted
            };
        }
        else if(currentPostStatus=="draft"){
            console.log(key);
            homeData = {
                id: newHomeKey,
                title: title,
                address: address,
                status: status,
                buildingType: buildingType,
                info: info,
                userID: this.auth.getCurrentUser().uid,
                lat: lat,
                thumbnail: { url: thumbUrl },
                long: long,
                images: existingPhotos,
                postStatus: postStatus,
                EstPropertySize: size,
                timeLeftVacant: time,
                electricity: electricity,
                plumbing: plumbing,
                furniture: furniture,
                rooms: rooms,
                roof: roof,
                windows: windows,
                garden: garden,
                usersRelation: user,
                posted: new Date().getTime(),
                datePosted: datePosted
            };
            firebase.database().ref('/homes/'+key).remove();
        }
        else if(currentPostStatus==undefined){
            homeData = {
                id: newHomeKey,
                title: title,
                address: address,
                status: status,
                buildingType: buildingType,
                info: info,
                userID: this.auth.getCurrentUser().uid,
                lat: lat,
                thumbnail: { url: thumbUrl },
                long: long,
                postStatus: postStatus,
                EstPropertySize: size,
                timeLeftVacant: time,
                electricity: electricity,
                plumbing: plumbing,
                furniture: furniture,
                rooms: rooms,
                roof: roof,
                windows: windows,
                garden: garden,
                usersRelation: user,
                posted: new Date().getTime(),
                datePosted: datePosted
            };
        }

    var updates = {};
    updates['/homes/' + newHomeKey] = homeData;
    firebase.database().ref().update(updates);
    }).then(function(){
    
      for(let image of imageData){
        var promises=[];
        if(image.state=="new"){
            (function (i){
               var newImageKey = firebase.database().ref().child('images').push().key;
               var imageRef = firebase.storage().ref('images/' + newHomeKey + '/' + newImageKey);
               var uploadTask = imageRef.putString(i.data, 'base64', {contentType: 'image/jpg'});
               uploadTask.on('state_changed', function(snapshot){
                }, function(error) {

                }, function() {
                    promises.push(imageRef.getDownloadURL().then(function(url){
                        me.urls.push(url);
                        firebase.database().ref('/homes/'+newHomeKey+'/images/'+newImageKey).set({url: url});
                        return firebase.database().ref('/homes/'+newHomeKey+'/thumbnail').set({url: me.urls[0]});
                    }));
                    return Promise.all(promises).then(function(data){
                        if(postStatus=="published"){
                            me.geoFire.set(newHomeKey, [me.userLat, me.userLng]).then(function() {
                                console.log("Provided key has been added to GeoFire");
                             }, function(error) {
                                console.log("Error: " + error);
                            })
                        }
                        else{
                            me.urls=[];
                        }
                    });
                });
            })(image);
        }
        else if(image.state=="gallery"){
                var newImageKey = firebase.database().ref().child('images').push().key;
                console.log("galpub");
                firebase.database().ref('/homes/'+newHomeKey+'/thumbnail').set({url: image.src});
                firebase.database().ref('/homes/'+newHomeKey+'/images/'+newImageKey).set({url: image.src}).then(function(data){
                    if(postStatus=="published"){
                            me.geoFire.set(newHomeKey, [me.userLat, me.userLng]).then(function() {
                                console.log("Provided key has been added to GeoFire");
                             }, function(error) {
                                console.log("Error: " + error);
                            })
                        }
                        else{
                            me.urls=[];
                        }
                });
        }
        else{
            if(postStatus=="published"){
                me.geoFire.set(newHomeKey, [me.userLat, me.userLng]).then(function() {
                    console.log("Provided key has been added to GeoFire");
                    me.urls=[];
                 }, function(error) {
                    console.log("Error: " + error);
                })
            }
            else{
                me.urls=[];
            }
        }
    }
    });
}
    
addToFavourites(homeID){
    firebase.database().ref().child('userProfile/'+this.auth.getCurrentUser().uid+'/favourites/'+homeID).set({homeID: homeID});
}
removeHome(id){
    firebase.database().ref('/homes/'+id).remove();
    firebase.database().ref('/locations-ref/'+id).remove();
}
getHistoryForHome(homeID){

    var homeQuery: any;
    var succeeds=true;
    var me=this;
    var homes=[];
    var firstHomeQuery= firebase.database().ref('/homes/'+homeID);
    firstHomeQuery.once('value')
            .then(snap=> {
                homes.push(snap.val());
            });

    var query = firebase.database().ref('/homes/'+homeID+'/succeeds');
    query.once('value')
        .then(snap=> {
            snap.forEach(function(data){
                homeQuery=firebase.database().ref('/homes/'+data.val());
                homeQuery.once('value')
                    .then(homeSnap=> {
                        homes.push(homeSnap.val());
                    })
            })
        });
        return homes;
}
}
