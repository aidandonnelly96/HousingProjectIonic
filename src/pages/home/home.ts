import { Component, ViewChild } from '@angular/core';
import { Nav, ModalController, ViewController } from 'ionic-angular';
import { ModalPage } from '../modal/modal';
import { HomeDetailPage } from '../home-detail/home-detail';
import { NavController, Events } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { FacetPage } from '../facet/facet'
import { PopoverController } from 'ionic-angular';
import { NativePageTransitions, NativeTransitionOptions } from '@ionic-native/native-page-transitions';
import { DatabaseProvider } from '../../providers/database/database';
import { AuthProvider } from '../../providers/auth/auth'
import { LoginPage } from '../login/login';

import firebase from 'firebase';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

@ViewChild(Nav) nav: Nav;
    homes = []; 
    currentLatitude: number; 
    currentLongitude: number;

    constructor(public navCtrl: NavController, public modalCtrl: ModalController, public popoverCtrl: PopoverController, private nativePageTransitions: NativePageTransitions, public db: DatabaseProvider, public events: Events, private geolocation: Geolocation, public auth: AuthProvider) {
        this.homes = this.db.homes;
        events.subscribe('home:entered', (time) => {
            this.homes=this.db.homes;
        });
    }
    goToHomeDetail(h) {
        this.navCtrl.push(HomeDetailPage, {
            home: h
        });
    }

    addToFavourites(homeID, slidingItem){
        slidingItem.close();
        this.db.addToFavourites(homeID);
    }

    doRefresh(refresher) {
      console.log("refreshing");

      setTimeout(() => {
          console.log('Async operation has ended');
          refresher.complete();
      }, 2000);
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

    openFacet(){
        let modal = this.modalCtrl.create( FacetPage );
        modal.present();
    }
}
