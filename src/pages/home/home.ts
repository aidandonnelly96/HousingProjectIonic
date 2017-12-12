import { Component, ViewChild } from '@angular/core';
import { App, Nav, ModalController, ViewController, AlertController } from 'ionic-angular';
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
    
    numHomes: number;

    constructor(public navCtrl: NavController, public modalCtrl: ModalController, public popoverCtrl: PopoverController, private nativePageTransitions: NativePageTransitions, public db: DatabaseProvider, public events: Events, private geolocation: Geolocation, public auth: AuthProvider, public appCtrl: App, public alertCtrl: AlertController) {
        this.homes = this.db.homes;
        this.numHomes=this.homes.length;
        events.subscribe('home:entered', (time) => {
            this.homes=this.db.homes;
            this.numHomes=this.homes.length;
        });
    }
    goToHomeDetail(h) {
        this.appCtrl.getRootNav().push(HomeDetailPage, {
            home: h
        });
    }

    addToFavourites(homeID, slidingItem){
        slidingItem.close();
        this.db.addToFavourites(homeID);
    }
    
    removeHome(homeID, slidingItem){
        slidingItem.close();
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
                    this.db.removeHome(homeID);
                }
              }
            ]
        });
        alert.present();
    }
    editHome(home, slidingItem){
        slidingItem.close();
        let modal = this.modalCtrl.create(ModalPage, {draft: home});
        modal.present();
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

    openFacet(){
        let modal = this.modalCtrl.create( FacetPage );
        modal.present();
    }
}
