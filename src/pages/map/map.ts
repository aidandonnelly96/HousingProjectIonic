import { Component } from '@angular/core';
import { App, NavController, NavParams, ActionSheetController } from 'ionic-angular';
import { ModalController, Events, AlertController } from 'ionic-angular';
import { ModalPage } from '../modal/modal';
import { Geolocation } from '@ionic-native/geolocation';
import { SpinnerDialog } from '@ionic-native/spinner-dialog';
import { FacetPage } from '../facet/facet';
import { AuthProvider } from '../../providers/auth/auth';
import { DatabaseProvider } from '../../providers/database/database';
import { HomeDetailPage } from '../home-detail/home-detail';
import { LoginPage } from '../login/login';

import * as L from "leaflet";
import 'leaflet.markercluster';
require('../../js/leaflet.awesome-markers');

import firebase from 'firebase';

import {Spinner} from 'spin.js';
/*
Generated class for the Map page.

See http://ionicframework.com/docs/v2/components/#navigation for more info on
Ionic pages and navigation.
*/

L.AwesomeMarkers.Icon.prototype.options.prefix = 'fa';


@Component({
  selector: 'page-map',
  templateUrl: 'map.html'
})
export class MapPage {
  homes = [];
  markers: any;
  map: L.Map;
  center: L.PointTuple;
  currentLatitude: number;
  currentLongitude: number;
  LatLngBounds: L.LatLngBounds;

  spinner: any;
  spinning = false;


  constructor(public navCtrl: NavController, public navParams: NavParams, public modalCtrl: ModalController, private geolocation: Geolocation, private spinnerDialog: SpinnerDialog, public events: Events, public db: DatabaseProvider, public auth: AuthProvider, public appCtrl: App, public actionSheetCtrl: ActionSheetController, public alertCtrl: AlertController) {}

  /*Ionic page event. Runs once and only once the page has loaded into view,
  meaning the map will only be initialized once*/

  ionViewDidLoad(){
    /*Define the map markers as a cluster group in order to display
    the markers as a numbered cluster instead of individual icons.
    MarkerCluster npm package displays the individual icons once the user has zoomed in*/
    this.markers=L.markerClusterGroup({
      showCoverageOnHover: false
    });

    /*spin.js npm package displays a spinner while homes are initially being loaded
    'spinner' is the id of the element where we would like to display the spinner animation.
    opts is a list of options relating to how the spinner should be displayed such as the colour, direction and opacity*/
    var target = document.getElementById('spinner');
    var opts = {
      color:'#90A4AE',
      lines: 13,
      length: 0,
      width: 12,
      radius: 43,
      scale: 0.4,
      corners: 1,
      fadeColor: 'transparent',
      opacity: 0.25,
      rotate: 0,
      direction: 1,
      speed: 1,
      trail: 60,
      fps: 20,
      zIndex: 2e9,
      className: 'spinner',
      top: '50%',
      left: '50%',
      position: 'absolute'
    };
    this.spinner = new Spinner(opts).spin(target);
    this.spinning=true;

    /*Once a search has been executed(default is the national search query), db: DatabaseProvider will store the centre of the
    search query in the currentLat and currentLong variables. The initMap function will use this to centre the map on screen.*/
    this.center=[this.db.currentLat, this.db.currentLong];

    //Just in case any homes have entered before the map page has subscribed to the home events below
    this.homes = this.db.homes;

    this.initMap();

    /*Each time a new home enters the current search query, the database provider will publish a 'home: entered' event.
    The map page listens for this event and updates the markers as necessary*/
    this.events.subscribe('home:entered', (home, time) => {
      this.spinner.stop();
      this.homes=this.db.homes;
      this.center = [this.db.currentLat, this.db.currentLong];
      if(this.map === undefined){
        this.initMap();
      }
      this.markLocations(home);
    });

    /*Each time a new home exits the current search query, the database provider will publish a 'home exited' event.
    The map page listens for this event and updates the markers as necessary*/
    this.events.subscribe('home exited', (key, time) => {
      this.homes=this.db.homes;

      //remove all markers
      this.markers.clearLayers();

      //re-mark the remaining homes
      for(let home of this.homes){
        this.markLocations(home);
      }
    });

    /*Each time the user executes a new search, the database provider will publish a 'new search' event.
    This event contains the geographic bounds of the current search
    The map page listens for this event, recenters the map according to the new bounds and removes all markers*/
    this.events.subscribe('new search', (bounds, time) => {

      //remove all markers
      this.markers.clearLayers();

      //reinitialize homes variable, this.db.homes should be empty at this point
      this.homes=this.db.homes;

      /*store the bounds of the current search in this.LatLngBounds.
      This variable will be used by the recenter function*/
      this.LatLngBounds = bounds;

      this.center = [this.db.currentLat, this.db.currentLong];

      if(this.map === undefined){
        this.initMap();
      }

      this.recenterMap();
    });
  }

  initMap(){
    if(this.map==undefined){
        /*Leaflet map constructor requires the id of the html element where the map should be displayed,
        as well as a center and a zoom level, the default is 6*/
        this.map = L.map("map").setView(this.center, 6);

        //Initialize the tiles as those provided by openstreetmap, and include an attribution, crediting OSM
        L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this.map);

      this.map.invalidateSize(true);
    }
  }

  //home stores the home that we are marking the location of
  markLocations(home){
  var me=this;

  //remove the markers from the map VERY momentarily, in order to update the marker layer
  this.map.removeLayer(this.markers);

  var icon;


  /*The following if-else statement allows for different coloured icons to be displayed depending on the given home's current status.
  If the home is 'suitable for tenants now', a blue icon will be displayed
  If the home has 'potential for renovation', an orange icon will be displayed
  And if the home is 'beyond renovation', a red icon will be displayed.
  This was achieved using the Leaflet.awesome-markers npm package which also accepts an icon name,
  in this case 'fa-home' from the FontAwesome library*/

  if(home.status=="Suitable for tenants now"){
    icon=L.AwesomeMarkers.icon({
      icon: 'fa-home',
      markerColor: 'blue'
    });
  }
  else if(home.status=="Potential for renovation"){
    icon=L.AwesomeMarkers.icon({
      icon: 'fa-home',
      markerColor: 'orange'
    });
  }
  else{
    icon=L.AwesomeMarkers.icon({
      icon: 'fa-home',
      markerColor: 'red'
    });
  }

  //define a marker, at the coordinates of the given home, displaying the desired icon
  var marker = L.marker([home.lat, home.long], {icon: icon});

  /*An Action Sheet should display when the user clicks a marker, it's options depend on whether or not the user is logged in,
  and whether or not the user has bookmarked the home corresponding to the clicked marker*/

  marker.on("click", function(e){
    var requiredButtons = me.getRequiredButtons(home);

    /*actionSheet.create() accepts a title and a list of buttons,
    The buttons can be given statically in a list, however we wish to provide buttons dynamically
    as the options will change depending on whether the user is logged in, and whether or not the user has bookmarked
    the home corresponding to the clicked marker*/
    const actionSheet = me.actionSheetCtrl.create({
      title: home.title,
      buttons: requiredButtons
    });
    actionSheet.present();
  })
  this.markers.addLayer(marker);
  this.map.addLayer(this.markers);
  }

  /*h stores the home which the user has requested a detailed view of,
  including all of its child attributes

  We pass h to the HomeDetailPage, which can use navParams.get("home") to retrieve it
  It can then display all of the child attributes stored on that home*/
  goToHomeDetail(h) {
    /*Redirect from the tabs page to the HomeDetailPage of a given home, passing that home as a parameter.
    This parameter can then be accessed using the Ionic NavParams package*/
    this.appCtrl.getRootNav().push(HomeDetailPage, {
      home: h
    });
  }


  presentModal(){
    /*getCurrentUser() returns null if the user is currently not logged in.
    The modal page allows the user to contribute to the dataset by posting a home.
    We only allow the user to do so if they are logged in, otherwise this function will redirect the user to the login page*/

    if(this.auth.getCurrentUser()!=null){
      let modal = this.modalCtrl.create( ModalPage );
      modal.present();
    }
    else{
      this.appCtrl.getRootNav().push(LoginPage);
    }
  }

  recenterMap(){
    if(this.spinning==true){
      this.spinner.stop();
    }
    /*Instead of passing a center and a zoom level, we can also pass bounds and Leaflet will work out the most appropriate zoom level and center in order to fit the required bounds to the screen.
    The bounds are provided by the database provider's 'new search' event*/
    this.map.fitBounds(this.LatLngBounds);
  }

  openFacet(){

    //Facet page, allowing the user to update the search query, is displayed as a modal

    let modal = this.modalCtrl.create( FacetPage );
    modal.present();
  }

  /*this function is called when the user selects the 'bookmark' option after clicking a home's marker
  this button will only be displayed if the user has not already bookmarked the home

  home stores the home that the user is adding to their bookmarks,
  we use this parameter to add its id to the list of homes bookmarked by the current user*/
  addToFavourites(home){

    //add the home to the user's list of bookmarked homes in the firebase database
    this.db.addToFavourites(home.id);

    //The map page doesn't listen for updates in the users favourites, so we simply update it locally
    home.userBookmarked=true;
  }


  /*this function is called when the user selects the 'bookmarked' option after clicking a home's marker
  this button will only be displayed if the user has already bookmarked the home

  home stores the home that the user is removing from their bookmarks,
  we use this parameter to remove its id from the list of homes bookmarked by the current user*/
  removeFromFavourites(home){
    //remove the home from the user's list of bookmarked homes in the firebase database
    firebase.database().ref().child('/userProfile/'+this.auth.getCurrentUser().uid+'/favourites/'+home.id).remove();

    //The map page doesn't listen for updates in the users favourites, so we simply update it locally
    home.userBookmarked=false;
  }

  //this function is called when the users presses the 'edit' option after clicking a home's marker
  //the corresponding home is passed as a parameter
  editHome(home){

  /*Open the post modal, with the desired home as a parameter.
  This parameter can then be accessed using the Ionic NavParams package*/
  let modal = this.modalCtrl.create(ModalPage, {draft: home});
  modal.present();
  }

  //this function is called when the users presses the 'remove' option after clicking a home's marker
  //the corresponding home is passed as a parameter
  removeHome(home){
  /*alertCtrl.create() allows us to define an alert popup before using it.
  In this case, we'd like the user to confirm that they wish to remove a home*/

  let alert = this.alertCtrl.create({
    title: 'Are you sure?',
    message: 'Are you sure you want to remove this home?',
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel',
        handler: () => {}
      },
      {
        text: 'Remove',
        handler: () => {
          this.db.removeHome(home.id, home.postStatus);
        }
      }
    ]
  });

  //present the alert popup
  alert.present();
  }

  /*When the user clicks a home marker,
  an action sheet is displayed with a number of options

  The options depend on whether (i) the user is logged in
  (ii) the user has bookmarked the selected home

  this function accepts a home as a parameter and returns the appropriate buttons for the current user*/
  getRequiredButtons(home){
    var possibleButtons = [
      {
        icon: 'home',
        text: 'View Details',
        handler: () => {
          this.goToHomeDetail(home);
        }
      },
      {
        icon: 'bookmark',
        text: 'Bookmark',
        handler: () => {
          this.addToFavourites(home);
        }
      },
      {
        icon: 'bookmark',
        text: 'Bookmarked',
        handler: () => {
          this.removeFromFavourites(home);
        }
      },
      {
        icon: 'create',
        text: 'Edit',
        handler: () => {
          this.editHome(home);
        }
      },
      {
        icon: 'trash',
        text: 'Remove',
        role: 'destructive',
        handler: () => {
          this.removeHome(home);
        }
      }
    ];

    //The 'View Details' button should always be an option
    var buttons = [possibleButtons[0]];

    //all others should only be displayed if the current user is logged in
    if(this.auth.getCurrentUser()!=null){
    /*if the user has already bookmarked the selected home,
    we should display the 'bookmarked' button, which allows them to 'unbookmark' the selected home,
    as well as the 'edit' and 'remove' buttons*/
    if(home.userBookmarked==true){
      buttons.push(possibleButtons[2]);
      buttons.push(possibleButtons[3]);
      buttons.push(possibleButtons[4]);
    }
    else{
      /*Otherwise, we should display the 'bookmark' button,
      which allows them to 'bookmark' the selected home,
      as well as the 'edit' and 'remove' buttons*/
      buttons.push(possibleButtons[1]);
      buttons.push(possibleButtons[3]);
      buttons.push(possibleButtons[4]);
    }
  }
  return buttons;
  }
}
