import { Component } from '@angular/core';
import { App, NavController, NavParams, ActionSheetController } from 'ionic-angular';
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
import 'leaflet';
import 'leaflet.markercluster';

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
  markers: any;
  map: L.Map;
  center: L.PointTuple;
  currentLatitude: number; 
  currentLongitude: number;

  constructor(public navCtrl: NavController, public navParams: NavParams, public modalCtrl: ModalController, private geolocation: Geolocation, private spinnerDialog: SpinnerDialog, private nativePageTransitions: NativePageTransitions, public events: Events, public db: DatabaseProvider, public auth: AuthProvider, public appCtrl: App, public actionSheetCtrl: ActionSheetController) {
        this.markers=L.markerClusterGroup({
            showCoverageOnHover: false
        });
        
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
            this.markers.clearLayers()
            for(let home of this.homes){
                this.markLocations(home);
            }
      });
  }

  ionViewDidLoad() {
    if(this.map === undefined){
      this.initMap();
    }
    console.log('ionViewDidLoad MapPage');
  }

  initMap() {
    this.spinnerDialog.show();
    this.map = L.map('map', {
      center: this.center,
      zoom: 13
    });
    L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    this.spinnerDialog.hide();
  }
  
  markLocations(home){
         var me=this;
         this.map.removeLayer(this.markers);
         var marker = L.marker([home.lat, home.long]);
                                //.bindPopup('<img src="'+home.thumbnail.url+'"><h4 style="text-transform: capitalize;">'+home.title+'</h4>');
         marker.on("click", function(e){
            const actionSheet = me.actionSheetCtrl.create({
                title: home.title,
                buttons: [
                    {
                        icon: 'home',
                        text: 'View Details',
                        handler: () => {
                            me.goToHomeDetail(home);
                        }
                    },
                    {
                        icon: 'bookmark',
                        text: 'Bookmark',
                        handler: () => {
                            me.addToFavourites(home.id);
                        }
                    },
                    {
                        icon: 'create',
                        text: 'Edit',
                        handler: () => {
                            me.editHome(home);
                        }
                    }
                ]
            });
            actionSheet.present();
         })
         this.markers.addLayer(marker);
         this.map.addLayer(this.markers);
  }
  
  goToHomeDetail(h) {
        this.appCtrl.getRootNav().push(HomeDetailPage, {
            home: h
        });
  }
  presentModal(){
    if(this.auth.getCurrentUser()!=null){
        let modal = this.modalCtrl.create( ModalPage );
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
  
  addToFavourites(homeID){
    this.db.addToFavourites(homeID);
  }
  
  editHome(home){
    let modal = this.modalCtrl.create(ModalPage, {draft: home});
    modal.present();
  }
}
