import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { ModalController, ViewController } from 'ionic-angular';
import { ModalPage } from '../modal/modal';
import { Geolocation } from '@ionic-native/geolocation';
import { SpinnerDialog } from '@ionic-native/spinner-dialog';
import { FacetPage } from '../facet/facet';


import L from "leaflet";

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

  homes: Array<{title: string, src: string, status: string, lat: number, lng: number}>;
  map: L.Map;
  center: L.PointTuple;
  currentLatitude: number; 
  currentLongitude: number;

  constructor(public navCtrl: NavController, public navParams: NavParams, public modalCtrl: ModalController, private geolocation: Geolocation, private spinnerDialog: SpinnerDialog) {
    this.homes = [
          { title: '7 Maynooth Road', src: 'https://thoughtcatalog.files.wordpress.com/2014/06/shutterstock_183100415.jpg?w=1000&h=666', status: 'Suitable for living', lat: 3.3813572, lng: -6.5940997},
          { title: '12 Dublin Road', src: 'http://cdn.extra.ie/wp-content/uploads/2017/06/24135659/Philip-Marley-6.jpg', status: 'Potential for Renovation', lat: 13.3813572, lng: -5.5940997},
          { title: '12 Malahide Road', src: 'http://cdn.extra.ie/wp-content/uploads/2017/06/24135659/Philip-Marley-6.jpg', status: 'Beyond Renovation', lat: 23.3813572, lng: -4.5940997},
          { title: '7 Maynooth Road', src: 'https://thoughtcatalog.files.wordpress.com/2014/06/shutterstock_183100415.jpg?w=1000&h=666', status: 'Suitable for living', lat: 33.3813572, lng: -3.5940997},
          { title: '12 Dublin Road', src: 'http://cdn.extra.ie/wp-content/uploads/2017/06/24135659/Philip-Marley-6.jpg', status: 'Potential for Renovation', lat: 43.3813572, lng: -2.5940997},
          { title: '12 Malahide Road', src: 'http://cdn.extra.ie/wp-content/uploads/2017/06/24135659/Philip-Marley-6.jpg', status: 'Beyond Renovation', lat: 53.3813572, lng: -1.5940997},
          { title: '7 Maynooth Road', src: 'https://thoughtcatalog.files.wordpress.com/2014/06/shutterstock_183100415.jpg?w=1000&h=666', status: 'Suitable for living', lat: 63.3813572, lng: 0.5940997},
          { title: '12 Dublin Road', src: 'http://cdn.extra.ie/wp-content/uploads/2017/06/24135659/Philip-Marley-6.jpg', status: 'Potential for Renovation', lat: 73.3813572, lng: 1.5940997},
          { title: '12 Malahide Road', src: 'http://cdn.extra.ie/wp-content/uploads/2017/06/24135659/Philip-Marley-6.jpg', status: 'Beyond Renovation', lat: 83.3813572, lng: 2.5940997},
          { title: '7 Maynooth Road', src: 'https://thoughtcatalog.files.wordpress.com/2014/06/shutterstock_183100415.jpg?w=1000&h=666', status: 'Suitable for living', lat: 53.3813572, lng: 3.5940997},
          { title: '12 Dublin Road', src: 'http://cdn.extra.ie/wp-content/uploads/2017/06/24135659/Philip-Marley-6.jpg', status: 'Potential for Renovation', lat: 93.3813572, lng: 4.5940997},
          { title: '12 Malahide Road', src: 'http://cdn.extra.ie/wp-content/uploads/2017/06/24135659/Philip-Marley-6.jpg', status: 'Beyond Renovation', lat: 103.3813572, lng: 5.5940997}
      ];
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MapPage');
    
    this.currentLatitude=53.3813572;
    this.currentLongitude=-6.5940997;
    
    this.center = [this.currentLatitude, this.currentLongitude];
    
    //set map center
    this.getCurrentLocation();
  }
  
  getCurrentLocation(){
        this.spinnerDialog.show();
        this.geolocation.getCurrentPosition().then((resp) => {
             console.log(resp.coords.latitude+", "+resp.coords.longitude);
             this.currentLatitude=resp.coords.latitude;
             this.currentLongitude=resp.coords.longitude;
             this.center = [this.currentLatitude, this.currentLongitude];
             this.initMap();
        }).catch((error) => {
            this.currentLatitude=53.3813572;
            this.currentLongitude=-6.5940997;
            this.center = [this.currentLatitude, this.currentLongitude];
            this.initMap();
        });
    }

  initMap() {
    this.spinnerDialog.show();
    this.map = L.map('map', {
      center: this.center,
      zoom: 13
    });
    //Add OSM Layer
    L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(this.map);
    
    /*this.homes.forEach((home) => {
        L.marker([home.lat, home.lng]).addTo(this.map)
                               .bindPopup('<img src=\"'+home.src+'\">Heres a house.')
                               .openPopup()
                               .on('click', onClick(home));
    });*/
    
    L.marker([this.currentLatitude, this.currentLongitude]).addTo(this.map)
                           .bindPopup('<img src="http://cdn.extra.ie/wp-content/uploads/2017/06/24135659/Philip-Marley-6.jpg">You are here.<br> Easily customizable.');
    this.spinnerDialog.hide();
  }
  presentModal(){
    let modal = this.modalCtrl.create(ModalPage);
    modal.present();
  }
  
  openFacet(){
    let modal = this.modalCtrl.create( FacetPage );
    let me = this;
    modal.onDidDismiss(data => {
      if(data != null && data != undefined){
        console.log(data.length);
        this.map.remove();
        this.center=data;
        this.initMap();
      }
    });
    modal.present();
  }
}
