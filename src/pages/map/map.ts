import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { ModalController, ViewController, Events } from 'ionic-angular';
import { ModalPage } from '../modal/modal';
import { Geolocation } from '@ionic-native/geolocation';
import { SpinnerDialog } from '@ionic-native/spinner-dialog';
import { FacetPage } from '../facet/facet';
import { NativePageTransitions, NativeTransitionOptions } from '@ionic-native/native-page-transitions';
import { AuthProvider } from '../../providers/auth/auth';
import { DatabaseProvider } from '../../providers/database/database';
import { HomeDetailPage } from '../home-detail/home-detail';
import { LoginPage } from '../login/login';

import L from "leaflet";

import firebase from 'firebase';

/*
  Generated class for the Map page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-map',
  templateUrl: 'map.html'
})
export class MapPage {
  homes = []; 
  markers = [];
  map: L.Map;
  center: L.PointTuple;
  currentLatitude: number; 
  currentLongitude: number;

  constructor(public navCtrl: NavController, public navParams: NavParams, public modalCtrl: ModalController, private geolocation: Geolocation, private spinnerDialog: SpinnerDialog, private nativePageTransitions: NativePageTransitions, public events: Events, public db: DatabaseProvider, public auth: AuthProvider) {
        events.subscribe('home:entered', (time) => {
            console.log("map home:entered");
            for(let marker of this.markers){
                this.map.removeLayer(marker);
            }
            this.homes=this.db.homes;
            this.center = [this.db.currentLat, this.db.currentLong];
            if(this.map === undefined){
              this.initMap();
            }
            this.recenterMap();
            for(let home of this.homes){
                this.markLocations(home);
            }
      });
      /*events.subscribe('new home', (home, time) => {
            console.log("map new home");
            if(this.map===undefined){
                this.initMap();
            }
            this.markLocations(home);
      });*/
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MapPage');
    
    this.currentLatitude=53.3813572;
    this.currentLongitude=-6.5940997;
    
    this.center = [this.currentLatitude, this.currentLongitude];
    
    //set map center
    //this.getCurrentLocation();
  }

  initMap() {
    this.spinnerDialog.show();
    this.map = L.map('map', {
      center: this.center,
      zoom: 13
    });
    //Add OSM Layer
    L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(this.map);

    this.spinnerDialog.hide();
  }
  
  markLocations(home){
         var marker = L.marker([home.lat, home.long]).addTo(this.map)
                                .bindPopup('<img src="'+home.thumbnail.url+'">'+home.title);
         this.markers.push(marker);
  }
  
  goToHomeDetail(homeTitle, homeStatus) {
    console.log("running click");
    /*this.navCtrl.push(HomeDetailPage, {
        title: homeTitle,
        status: homeStatus
    });*/
  }
  presentModal(){
    if(this.auth.getCurrentUser()!=null){
        let modal = this.modalCtrl.create(ModalPage);
        modal.present();
    }
    else{
        this.navCtrl.push(LoginPage);
    }
  }
  
  recenterMap(){
    this.map.panTo(this.center);
  }
  
  openFacet(){
    let modal = this.modalCtrl.create( FacetPage );
    modal.present();
  }
}
