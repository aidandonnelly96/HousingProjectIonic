import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { Loading, LoadingController,  Events } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';
import * as papa from 'papaparse';

import firebase from 'firebase';
import Geofire from 'geofire';

import * as L from "leaflet";
import * as leafletPip from '@mapbox/leaflet-pip';

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

  //the latlng of the centre of the previous search
  currentLat: number;
  currentLong: number;

  //the user's current location
  userLat: number;
  userLng: number;
  loading: Loading;

  //the county/country the user most recently search
  place: string;

  //We store the months in order to calculate the date a home was posted using the unix timestamp stored on that home
  months: string[]=["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

  /*the values of each field in the most recently executed search
  we store these in order to populate the search form when the user views it again*/
  radius;
  lower;
  upper;
  status;
  time;
  buildingType;
  electricity;
  plumbing;
  furniture;
  rooms;
  roof;
  garden;
  windows;

  constructor(public events: Events, public auth: AuthProvider, public loadingCtrl: LoadingController) {
    let me=this;
    firebase.auth().onAuthStateChanged(function(user) {
        /*each time the user logs in, we check if the new user account has
          bookmarked the homes that are currently visible

          for each home that's visible we update it to show whether or not the user has bookmarked it*/
        if (user) {
            for(let h of me.homes){

                /*the users bookmarked homes are stored under the user's profile at the id
                of the home*/
                var homeQuery=firebase.database().ref().child('/userProfile/'+user.uid+'/favourites/'+h.id);
                homeQuery.once('value')
                    .then(snap=>{
                        let home=h;
                        if(snap.val()!=null){
                            /*if homeQuery did not return null, we know there is a bookmarked home at
                            the id of the current home, h

                            this tells us that the user HAS bookmarked h, so we should update home*/
                            home.userBookmarked=true;
                        }

                        /*home.posted stores a unix timestamp of when the home was originally posted
                        here, we calculate the time since the home was posted using home.posted*/
                        var dateSuffix="";
                        var dt=new Date(home.posted);
                        if((dt.getDate()-3)%10==0){
                            dateSuffix="rd";
                        }
                        else if((dt.getDate()-2)%10==0){
                            dateSuffix="nd";
                        }
                        else{
                            dateSuffix="th";
                        }

                        //concatenate the date suffix with the day, month and year parts of the timestamp
                        var datePosted=dt.getDate()+dateSuffix+" "+me.months[dt.getMonth()]+" "+dt.getFullYear();
                        home.datePosted=datePosted;

                        //remove h from the list of homes, the home-list page will update automatically
                        me.homes=me.homes.filter(obj => obj.id !== home.id);

                        /*publish an event alerting other pages that this home as exited,
                        this will cause the main map page to remove a marker VERY temporarily,
                        it won't render and the user won't be affected*/
                        me.events.publish('home exited', home.id, Date.now());

                        //add home to the list of homes, the home-list page will update automatically
                        me.homes.unshift(home);

                        /*publish an event alerting other pages that home has been added,
                        the main map page will add a marker corresponding to home*/
                        me.events.publish('home:entered',home,Date.now());
                    });
            }
        } else {
            /*when the user logs out, we mark all homes as NOT bookmarked by the current user*/
            for(let h of me.homes){
                let home=h;

                //if the user isn't logged in, the home has NOT bookmarked any homes
                home.userBookmarked=false;

                /*home.posted stores a unix timestamp of when the home was originally posted
                here, we calculate the time since the home was posted using home.posted*/
                var dateSuffix="";
                var dt=new Date(home.posted);
                if((dt.getDate()-3)%10==0){
                    dateSuffix="rd";
                }
                else if((dt.getDate()-2)%10==0){
                    dateSuffix="nd";
                }
                else{
                    dateSuffix="th";
                }

                //concatenate the date suffix with the day, month and year parts of the timestamp
                var datePosted=dt.getDate()+dateSuffix+" "+me.months[dt.getMonth()]+" "+dt.getFullYear();
                home.datePosted=datePosted;

                  //remove h from the list of homes, the home-list page will update automatically
                me.homes=me.homes.filter(obj => obj.id !== home.id);

                /*publish an event alerting other pages that this home as exited,
                this will cause the main map page to remove a marker VERY temporarily,
                it won't render and the user won't be affected*/
                me.events.publish('home exited', home.id, Date.now());

                //add home to the list of homes, the home-list page will update automatically
                me.homes.unshift(home);

                /*publish an event alerting other pages that home has been added,
                the main map page will add a marker corresponding to home*/
                me.events.publish('home:entered',home,Date.now());
            }
        }
    });
  }

/*Returns all homes matching the search query the user has chosen

each parameter stores the value stored in a field from the search form(may be "Any")*/
getHomes(place, currentLat, currentLong, radius, lower, upper,  status, time, buildingType, electricity, plumbing, furniture, rooms, roof, garden, windows){
    /*store the previous search query, so we can use the metadata
    as default values when/if the user reopons the search query page*/
    this.radius=radius;
    this.lower=lower;
    this.upper=upper;
    this.status=status;
    this.time=time;
    this.buildingType=buildingType;
    this.electricity=electricity;
    this.plumbing=plumbing;
    this.furniture=furniture;
    this.rooms=rooms;
    this.roof=roof;
    this.garden=garden;
    this.windows=windows;

    var me=this;
    this.homes = [];
    this.place=place;
    this.currentLat=currentLat;
    this.currentLong=currentLong;
    //me.events.publish('new search',Date.now());

    /*When the user selects a county, we retrieve the centre of that county,
    and the distance from the centre of that county to the furthest edge of that county

    Here, we execute a firebase circular geoQuery centred at the centre of the county,
    with a radius equal to the distance from the centre of that county to the furthest edge of that county*/
    var geoQuery = this.geoFire.query({
      center: [currentLat, currentLong],
      radius: radius
    });

    var area;

    /*once we've executed the geoQuery, we retrieve the geoJSON file for the chosen county from the database
    place stores the name of the chosen county*/
    var areaQuery=firebase.database().ref().child('/geoJSON/'+place);
    areaQuery.once('value')
        .then(snap => {

            //area=geoJSON for the chosen county
            area=snap.val();

        /*Leaflet provides a pointInLayer, however it requires a leaflet geojson polygon,
        so we pass out geoJSON polygon to a Leaflet geoJSON constructor*/
        var gjLayer = L.geoJSON(area);

        /*alert listening pages that a new search is being executed,
          this will cause the main map to recenter, and all homes to be removed from view*/
        me.events.publish('new search', gjLayer.getBounds(), Date.now());
        var home;

        /*listen in realtime for new homes to enter the circular geoQuery,
        key entered returns the id(key) of a home, its location(a geocoordinate pair),
        and the distance to it from the center of the search*/
        geoQuery.on("key_entered", function(key, location, distance) {
            home = {
                id: key,
                distance: distance,
                location: location
            };

            /*leafletPip.pointInLayer accepts a geocoordinate, a leaflet geoJSON polygon, and a boolean
              which tells the function whether or not it should accept the first polygon it finds and stop the search

              leafletPip.pointInLayer returns a list of polygons where the desired point was found,
              we only need one to ensure that the point is within the chosen county, hence .length>0*/
            if(leafletPip.pointInLayer([location[1], location[0]], gjLayer, true).length >0){

                /*We've now found that the location is within the polygon, so now
                we retrieve the home corresponding to that location

                the IDs of the homes and locations match in order for us to retrieve the correct
                home once a location has been found

                query retrieves all homes with an ID equal to the key of the location
                that has been found to be within the polygon*/
                var query = firebase.database().ref('/homes/');

                /*firebase realtime database allows us to listen for new additions to the database,
                this allows us to update the UI in realtime by adding homes to the view once they've
                been added to the database*/
                query.on("child_added", function(addSnap){

                      if(addSnap.val().id==key){
                        /*me.inSearchResults compares the metadata stored on the retrieved home to the desired search*/
                        if(me.inSearchResults(addSnap.val())){

                            /*If the user is logged in, we need to know if the current user has bookmarked the retrieved home*/
                            if(me.auth.getCurrentUser()!=null){

                                /*the users bookmarked homes are stored under the user's profile at the id
                                of the home*/
                                var homeQuery=firebase.database().ref().child('/userProfile/'+me.auth.getCurrentUser().uid+'/favourites/'+addSnap.val().id);
                                homeQuery.once('value')
                                    .then(snap=>{
                                        //home=retrieved home
                                        home=addSnap.val();
                                        if(snap.val()!=null){
                                            /*if the bookmark query is not null, then an element exists under the user's userProfile
                                            at the id of the retrieved home, meaning the user has bookmarked this home*/
                                            home.userBookmarked=true;
                                        }

                                        /*home.posted stores a unix timestamp of when the home was originally posted
                                        here, we calculate the time since the home was posted using home.posted*/
                                        var dateSuffix="";
                                        var dt=new Date(home.posted);
                                        if((dt.getDate()-1)%10==0 || dt.getDate()==1){
                                            dateSuffix="st";
                                        }
                                        else if((dt.getDate()-3)%10==0 || dt.getDate()==3){
                                            dateSuffix="rd";
                                        }
                                        else if((dt.getDate()-2)%10==0 || dt.getDate()==2){
                                            dateSuffix="nd";
                                        }
                                        else{
                                            dateSuffix="th";
                                        }

                                        //concatenate the date suffix with the day, month and year parts of the timestamp
                                        var datePosted=dt.getDate()+dateSuffix+" "+me.months[dt.getMonth()]+" "+dt.getFullYear();
                                        home.datePosted=datePosted;

                                        /*home-list view will be updated automatically when a new home is added*/
                                        me.homes.unshift(home);

                                        /*publish a 'home:entered' event
                                        The main map page is subscribed to this event, and will add a marker to the map
                                        once the event fires*/
                                        me.events.publish('home:entered',home,Date.now());
                                    });
                            }

                            //otherwise, just return the home
                            else{
                                home=addSnap.val();

                                /*home.posted stores a unix timestamp of when the home was originally posted
                                here, we calculate the time since the home was posted using home.posted*/
                                var dateSuffix="";
                                var dt=new Date(home.posted);
                                if((dt.getDate()-1)%10==0 || dt.getDate()==1){
                                    dateSuffix="st";
                                }
                                else if((dt.getDate()-3)%10==0 || dt.getDate()==3){
                                    dateSuffix="rd";
                                }
                                else if((dt.getDate()-2)%10==0 || dt.getDate()==2){
                                    dateSuffix="nd";
                                }
                                else{
                                    dateSuffix="th";
                                }

                                //concatenate the date suffix with the day, month and year parts of the timestamp
                                var datePosted=dt.getDate()+dateSuffix+" "+me.months[dt.getMonth()]+" "+dt.getFullYear();
                                home.datePosted=datePosted;

                                /*home-list view will be updated automatically when a new home is added*/
                                me.homes.unshift(home);

                                /*publish a 'home:entered' event
                                The main map page is subscribed to this event, and will add a marker to the map
                                once the event fires*/
                                me.events.publish('home:entered',home,Date.now());
                            }
                        }
                      }
                });

                /*firebase realtime database allows us to listen for removals from the database,
                this allows us to update the UI in realtime  by removing homes from view
                once they've been removed from the database*/
                query.on("child_removed", function(removeSnap){

                    /*when a home is deleted/removed, remove it from the list of homes,
                    home-list  be updated automatically when a new home is removed*/
                    me.homes=me.homes.filter(home => home.id != removeSnap.val().id);

                    /*publish a 'home exited' event
                    The main map page is subscribed to this event, and will remove a marker from the map
                    once the event fires*/
                    me.events.publish('home exited', key, Date.now());
                });

                /*firebase realtime database allows us to listen for changes to the database,
                this allows us to update the UI in realtime by checking whether or not the
                home still belongs in the query after it has changed*/
                query.on("child_changed", function(changeSnap){
                      console.log("changed "+changeSnap.val());
                      //immediately remove the home from view, we'll add it back later if necessry
                      me.homes=me.homes.filter(obj => obj.id != changeSnap.val().id);
                      me.events.publish('home exited', key, Date.now());

                      if(changeSnap.val().id==key){
                        /*me.inSearchResults compares the metadata stored on the retrieved home to the desired search*/
                        if(me.inSearchResults(changeSnap.val())){

                          /*If the user is logged in, we need to know if the current user has bookmarked the retrieved home*/
                          if(me.auth.getCurrentUser()!=null){

                              /*the users bookmarked homes are stored under the user's profile at the id
                              of the home*/
                              var homeQuery=firebase.database().ref().child('/userProfile/'+me.auth.getCurrentUser().uid+'/favourites/'+changeSnap.val().id);
                              homeQuery.once('value')
                                  .then(snap=>{
                                      //home=retrieved home
                                      home=changeSnap.val();
                                      if(snap.val()!=null){
                                          /*if the bookmark query is not null, then an element exists under the user's userProfile
                                          at the id of the retrieved home, meaning the user has bookmarked this home*/
                                          home.userBookmarked=true;
                                      }

                                      /*home.posted stores a unix timestamp of when the home was originally posted
                                      here, we calculate the time since the home was posted using home.posted*/
                                      var dateSuffix="";
                                      var dt=new Date(home.posted);
                                      if((dt.getDate()-1)%10==0 || dt.getDate()==1){
                                          dateSuffix="st";
                                      }
                                      else if((dt.getDate()-3)%10==0 || dt.getDate()==3){
                                          dateSuffix="rd";
                                      }
                                      else if((dt.getDate()-2)%10==0 || dt.getDate()==2){
                                          dateSuffix="nd";
                                      }
                                      else{
                                          dateSuffix="th";
                                      }

                                      //concatenate the date suffix with the day, month and year parts of the timestamp
                                      var datePosted=dt.getDate()+dateSuffix+" "+me.months[dt.getMonth()]+" "+dt.getFullYear();
                                      home.datePosted=datePosted;

                                      /*home-list view will be updated automatically when a new home is added*/
                                      me.homes.unshift(home);

                                      /*publish a 'home:entered' event
                                      The main map page is subscribed to this event, and will add a marker to the map
                                      once the event fires*/
                                      me.events.publish('home:entered',home,Date.now());
                                  });
                          }

                          //otherwise, just return the home
                          else{
                              home=changeSnap.val();

                              /*home.posted stores a unix timestamp of when the home was originally posted
                              here, we calculate the time since the home was posted using home.posted*/
                              var dateSuffix="";
                              var dt=new Date(home.posted);
                              if((dt.getDate()-1)%10==0 || dt.getDate()==1){
                                  dateSuffix="st";
                              }
                              else if((dt.getDate()-3)%10==0 || dt.getDate()==3){
                                  dateSuffix="rd";
                              }
                              else if((dt.getDate()-2)%10==0 || dt.getDate()==2){
                                  dateSuffix="nd";
                              }
                              else{
                                  dateSuffix="th";
                              }

                              //concatenate the date suffix with the day, month and year parts of the timestamp
                              var datePosted=dt.getDate()+dateSuffix+" "+me.months[dt.getMonth()]+" "+dt.getFullYear();
                              home.datePosted=datePosted;

                              /*home-list view will be updated automatically when a new home is added*/
                              me.homes.unshift(home);

                              /*publish a 'home:entered' event
                              The main map page is subscribed to this event, and will add a marker to the map
                              once the event fires*/
                              me.events.publish('home:entered',home,Date.now());
                          }
                        }
                    }
                });
            }
        });

        /*if a location exits the geoQuery, we simply remove its corresponding home immediately*/
        geoQuery.on("key_exited", function(key, location, distance) {
            me.homes=me.homes.filter(obj => obj.id !== key);
            me.events.publish('home exited', key, Date.now());
        });
    });
}

/*this function checks if a given home object from the database matches
 the criteria laid out by the user's search query

 it does so by comparing the home's child metadata to the search query metadata

 the home parameter stores a home, including all child fields*/
inSearchResults(home){
    if(home.postStatus=="published"){
        if(this.status==undefined || this.status==home.status || this.status=="Any" || this.status.length==0){
            if(this.buildingType==undefined || this.buildingType==home.buildingType || this.buildingType=="Any" || this.buildingType.length==0){
                if(home.EstPropertySize>=this.lower && home.EstPropertySize<=this.upper){
                    if(this.time==undefined || this.time == "Any" || this.time==home.timeLeftVacant || this.time.length==0){
                        if(this.electricity=="Any" || this.electricity == undefined || this.electricity.length==0 || this.electricity == home.electricity){
                             if(this.plumbing=="Any" || this.plumbing == undefined || this.plumbing.length==0 || this.plumbing == home.plumbing){
                               if(this.furniture=="Any" || this.furniture == undefined || this.furniture.length==0 || this.furniture == home.furniture){
                                    if(this.rooms=="Any" || this.rooms == undefined || this.rooms.length==0 || this.rooms == home.rooms){
                                        if(this.roof=="Any" || this.roof == undefined || this.roof.length==0 || this.roof == home.roof){
                                            if(this.garden=="Any" || this.garden == undefined || this.garden.length==0 || this.garden == home.garden){
                                                if(this.windows=="Any" || this.windows == undefined || this.windows.length==0 || this.windows == home.windows){
                                                    return true;
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
    return false;
}

/*this function handles saving homes, each parameter is the value the user placed
in the "homes" form in modal.ts

some parameters wont be used in each cause
for example, the key parameter won't be used unless we're editing an existing post, in which case,
it will store the id of the home we're editing*/
postHome(title, address, info, status, buildingType, imageData, postStatus,  key, thumbUrl, lat, long, size, time, electricity, plumbing, furniture, rooms, roof, windows, garden, user, currentPostStatus){
  console.log(currentPostStatus);
  this.geoFire = new Geofire(firebase.database().ref('locations-ref'));
  var precedes = [];
  var homeData = {};
  var newHomeKey = "";
  var me = this;

  //generate a new ID for a home to be posted
  newHomeKey = firebase.database().ref().child('homes').push().key;

  var historyQuery=firebase.database().ref('/homes/'+key+'/succeeds/');
  historyQuery.once('value')
    .then(snap=>{
        precedes.push(key);
        snap.forEach(function(data){
            precedes.push(data.val());
        });

        if(currentPostStatus=="published" || currentPostStatus=="edited" || currentPostStatus=="deleted"){
            console.log("published");
            if(currentPostStatus=="published"){
              //if we are editing editing a home that is currently published, set its post status to "edited"
              firebase.database().ref('/homes/'+key+'/postStatus').set("edited");
            }
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
                succeeds: precedes,
                rooms: rooms,
                roof: roof,
                windows: windows,
                garden: garden,
                usersRelation: user,
                posted: new Date().getTime(),
            };
        }
        else if(currentPostStatus=="draft"){
            /*if the home is currently stored as a draft, don't use the ID we generated, just use the drafts ID
            This means when we edit a draft, the original draft will be lost*/
            newHomeKey=key;
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
            };
        }
        else{
            //otherwise, just use the ID we generated and the data that was passed to this function
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
            };
        }


    var updates = {};

    //store the changes in an array
    updates['/homes/' + newHomeKey] = homeData;

    //push the array to firebase
    firebase.database().ref().update(updates);
    }).then(function(){

      //once the metadata has been posted, we can start pushing the images
      me.urls=[];
      var promises=[];
      for(let image of imageData){

        /*for each image, if its state is new(ie, the user used their camera or internal device storage),
          we'll need to store it in firebase storage*/
        var promises=[];
        if(image.state=="new"){
            (function (i){
               //generate a new ID for each image
               var newImageKey = firebase.database().ref().child('images').push().key;

               //storage reference query to the path where we'll store this image
               var imageRef = firebase.storage().ref('images/' + newHomeKey + '/' + newImageKey);

               //push the image as base64 string
               var uploadTask = imageRef.putString(i.data, 'base64', {contentType: 'image/jpg'});
               uploadTask.on('state_changed', function(snapshot){
                }, function(error) {

                }, function() {
                    /*Once the image has successfully been stored, retrieve its download url
                    and push that to the the new home's "images" field*/
                    promises.push(imageRef.getDownloadURL().then(function(url){
                        me.urls.push(url);
                        firebase.database().ref('/homes/'+newHomeKey+'/images/'+newImageKey).set({url: url});
                        return firebase.database().ref('/homes/'+newHomeKey+'/thumbnail').set({url: me.urls[0]});
                    }));
                });
            })(image);
        }
        /*if the image state is "existing"(ie the user chose the image from their deed gallery),
        its already in storage, so there's no need to store it again, */
        else if(image.state=="existing"){
                //generate a new ID for this image
                var newImageKey = firebase.database().ref().child('images').push().key;
                firebase.database().ref('/homes/'+newHomeKey+'/thumbnail').set({url: image.src});

                //add a new image to this home
                promises.push(firebase.database().ref('/homes/'+newHomeKey+'/images/'+newImageKey).set({url: image.src}).then(function(data){}));
        }
    }
    return Promise.all(promises).then(function(data){
        /*once all images have been stored, add the location so the home
        can be displayed in search queries*/
        if(postStatus=="published"){
            me.geoFire.set(newHomeKey, [lat, long]).then(function() {
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
}

/*add a given home ID to the list of homes bookmarked by the current user

homeID stores the id of the home the user has bookmarked*/
addToFavourites(homeID){
    firebase.database().ref().child('userProfile/'+this.auth.getCurrentUser().uid+'/favourites/'+homeID).set({homeID: homeID});
}

/*this function is called when the user chooses to "remove" a home,
  It simply sets the home's post status attribute to 'deleted'

  this hides the home from all search queries as we only display published homes in search results

  however, the original contributer and any user that has bookmarked the home can still view
  the home from their MyAccount page and choose to make it publically viewable again

  id stores the id of the home the user is removing*/
removeHome(id, previousPostStatus){
    firebase.database().ref().child('/homes/'+id+'/postStatus').set('deleted').then(function(){
        firebase.database().ref().child('/homes/'+id+'/previousPostStatus').set(previousPostStatus);
    });
}

/*this function is NOT called when the user chooses to "remove" a home
  this function deletes the home permanently, and is only called when the user chooses
  to delete a draft, as we allow those to be deleted permanently

  id stores the id of the home the user is deleting
  */
deleteHome(id){
    firebase.database().ref().child('/homes/'+id).remove();
    firebase.database().ref('/locations-ref/'+id).remove();
}

/*As homes can be edited by any user, we maintain the history of each home,
  when the user chooses "View History" in the HomeDetail Popover, this function will be called

  the function returns the homes that preceded a given home
  homeID is the id of that given home*/
getHistoryForHome(homeID){
    var homeQuery: any;
    var me=this;
    var homes=[];

    /*the first home we need is the home we are currently retrieving the history of, so pull that first*/
    var firstHomeQuery= firebase.database().ref('/homes/'+homeID);
    firstHomeQuery.once('value')
            .then(snap=> {

                //calculate the time since posting from the unix timestamp
                var dateSuffix="";
                let home=snap.val();
                var dt=new Date(home.posted);
                if((dt.getDate()-1)%10==0 || dt.getDate()==1){
                    dateSuffix="st";
                }
                else if((dt.getDate()-3)%10==0 || dt.getDate()==3){
                    dateSuffix="rd";
                }
                else if((dt.getDate()-2)%10==0 || dt.getDate()==2){
                    dateSuffix="nd";
                }
                else{
                    dateSuffix="th";
                }
                //concatenate the date suffix to the day, month and year parts of the unix timestamp
                var datePosted=dt.getDate()+dateSuffix+" "+me.months[dt.getMonth()]+" "+dt.getFullYear();
                home.datePosted=datePosted;

                //push the first home
                homes.push(home);
            });

    //now retrieve the homes that preceded this home
    var query = firebase.database().ref('/homes/'+homeID+'/succeeds');
    query.once('value')
        .then(snap=> {
            snap.forEach(function(data){
                //for each id in the list of predecessors, retrieve the corresponding home
                homeQuery=firebase.database().ref('/homes/'+data.val());
                homeQuery.once('value')
                    .then(homeSnap=> {
                        var dateSuffix="";
                        let home=homeSnap.val();

                        //calculate the time since posting from the unix timestamp
                        var dt=new Date(home.posted);
                        if((dt.getDate()-1)%10==0 || dt.getDate()==1){
                            dateSuffix="st";
                        }
                        else if((dt.getDate()-3)%10==0 || dt.getDate()==3){
                            dateSuffix="rd";
                        }
                        else if((dt.getDate()-2)%10==0 || dt.getDate()==2){
                            dateSuffix="nd";
                        }
                        else{
                            dateSuffix="th";
                        }

                        //concatenate the date suffix to the day, month and year parts of the unix timestamp
                        var datePosted=dt.getDate()+dateSuffix+" "+me.months[dt.getMonth()]+" "+dt.getFullYear();
                        home.datePosted=datePosted;

                        //push each indiviual home
                        homes.push(home);
                    });
            });
        });

        //return the list of homes sorted by unix timestamp of when they were posted
        return homes.sort(function(a, b){return parseInt(a.posted)-parseInt(b.posted)});
}

exportData(){
    var query = firebase.database().ref('/homes/');
    var homeData = []
    query.once('value')
        .then(snap => {
            snap.forEach(function(data){
                homeData.push([data.val().status, data.val().lat, data.val().long, data.val().EstPropertySize, data.val().rooms ]);
            });
            let csv = papa.unparse({
                fields: ["Home Status", "Latitude", "Longitude", "Estimated Property Size", "Rooms"],
                data: homeData
            });
            var blob = new Blob([csv]);
            var a = window.document.createElement("a");
            a.href = window.URL.createObjectURL(blob);
            a.download = "HomeData.csv";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        });
}

/*As either an edited or published home can be deleted,
when a home is deleted we record the postStatus of the home pre-deletion

this function sets the postStatus of the home back to the pre-deletion postStatus

home stores the home that is being updated*/
putBack(home){
      firebase.database().ref().child('/homes/'+home.id+'/postStatus').set(home.previousPostStatus);
}

/*When a home is edited, that home's post status will be set to "edited"
  and a new home will be pushed to the database with the edited metadata.

  This new home will contain a "succeeds" field, which contains all the homes that
  came before it

  If a user believes a home has been incorrectly edited, they can "View History" on the currently published home,
  select the previous version that they believe was correct, and revert to that version

  reverting will set the current published home to "edited" and create a new home, identical to the supposedly
  correct home, however it will contain a "succeeds" field, that contains the incorrect home's succeeds field,
  plus the id of the incorrect home

  the home parameter stores the version of the home the user is reverting to, including all child attributes
  the publishedHomeId parameter stores the ID of the currently active version of this home*/
revert(home){

    //home stores the correct home's metadata
    var homeData;
    var me=this;
    var precedes=[home.id];

    //home.postStatus="published";

    //retrieve the correct homes current value
    var query=firebase.database().ref().child('/homes/'+home.id);

    //generate an id for the new home to be pushed
    var HomeKey = firebase.database().ref().child('homes').push().key;

    query.once('value')
        .then(snap => {
            home=snap.val();
            //store the value of the correct home
            homeData = {
                id: HomeKey,
                title: snap.val().title,
                address: snap.val().address,
                status: snap.val().status,
                buildingType: snap.val().buildingType,
                info: snap.val().info,
                userID: this.auth.getCurrentUser().uid,
                lat: snap.val().lat,
                thumbnail: snap.val().thumbnail,
                long: snap.val().long,
                images: snap.val().images,
                postStatus: "published",
                EstPropertySize: snap.val().EstPropertySize,
                timeLeftVacant: snap.val().timeLeftVacant,
                electricity: snap.val().electricity,
                plumbing: snap.val().plumbing,
                furniture: snap.val().furniture,
                rooms: snap.val().rooms,
                roof: snap.val().roof,
                windows: snap.val().windows,
                garden: snap.val().garden,
                usersRelation: snap.val().usersRelation,
                posted: new Date().getTime(),
            };

            var homeQuery = firebase.database().ref().child('/homes/');
            homeQuery.once('value')
                .then(homeSnap => {
                        //for each home in the database
                        homeSnap.forEach(function(innerSnap){
                            var successorQuery = firebase.database().ref().child('/homes/'+innerSnap.val().id+'/succeeds/');
                            //retrieve its successors
                            successorQuery.once('value')
                                .then(successorSnap => {
                                    //if one of the successors is the home we are reverting to
                                    successorSnap.forEach(function(innerSnap2){
                                        if(innerSnap2.val()==home.id){
                                            /*Because only published homes can be edited, the home the user is editing
                                            can only have one path to a published home(once it was edited it can't be edited again).

                                            This means that only one published home will be updated*/
                                            if(innerSnap.val().postStatus=="published"){
                                              //set the homes post status to "edited"
                                              firebase.database().ref().child('/homes/'+innerSnap.val().id+'/postStatus').set("edited");
                                              //and add this home to the list of homes that precede the home we are reverting to
                                            }
                                            precedes.push(innerSnap.val().id);
                                        }
                                    });
                                });
                        });
                });

            //if the home we are reverting to had predecessors of its own, add those to the list too
            if(home.succeeds!=undefined){
                precedes=precedes.concat(home.succeeds);
            }
            var updates = {};

            //store the value of the home in an array
            updates['/homes/' + HomeKey] = homeData;

            //update the firebase database under the new home ID to include the new home
            firebase.database().ref().update(updates).then(function(){
                    //once the home has been added, post its predecessors
                    firebase.database().ref().child('/homes/'+HomeKey+'/succeeds').set(precedes).then(function(){

                        //once that's been done, add its location so it is displayed in search query results
                        me.geoFire.set(HomeKey, [home.lat, home.long]).then(function() {
                            console.log("Provided key has been added to GeoFire");
                         }, function(error) {
                            console.log("Error: " + error);
                        });
                });

            });
        });
    }
    /*updateExisting(){
        var query=firebase.database().ref().child('/homes/');
        query.once('value')
            .then(snap =>{
                snap.forEach(function(snapshot){
                    if(snapshot.val().userID!="nEvjYnJvrNQmpvPWKiCFFjStFYX2"){
                        firebase.database().ref().child('/homes/'+snapshot.val().id).remove();
                        firebase.database().ref().child('/locations-ref/'+snapshot.val().id).remove();
                    }
                });
            });
    }*/
}
