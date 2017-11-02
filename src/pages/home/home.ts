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


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

 @ViewChild(Nav) nav: Nav;
  homes = []; 
  currentLatitude: number; 
  currentLongitude: number;

    constructor(public navCtrl: NavController, public modalCtrl: ModalController, public popoverCtrl: PopoverController, private nativePageTransitions: NativePageTransitions, public db: DatabaseProvider, public events: Events, private geolocation: Geolocation) {
        this.homes = this.db.homes;
        events.subscribe('home:entered', (time) => {
            this.homes=this.db.homes;
        });
    }

    goToHomeDetail(homeID, homeTitle, homeStatus) {
        this.navCtrl.push(HomeDetailPage, {
            id: homeID,
            title: homeTitle,
            status: homeStatus
        });
    }

    ionViewWillLeave() {

     let options: NativeTransitionOptions = {
        direction: 'right',
        duration: 500,
        iosdelay: 150,
        androiddelay: 150,
        fixedPixelsTop: 0,
        fixedPixelsBottom: 55
       };

     this.nativePageTransitions.slide(options);

    }
    
    /*getRequestedHomes(center, radius){
        console.log(this.currentLatitude+" "+ this.currentLongitude)
        var homes = this.db.getRequestedHomes(this.currentLatitude, this.currentLongitude, 5);
        this.homes = homes;
        console.log(homes);
    }*/

    doRefresh(refresher) {
      console.log("refreshing");
      
      setTimeout(() => {
          console.log('Async operation has ended');
          refresher.complete();
      }, 2000);
    }

    presentModal(){
        let modal = this.modalCtrl.create(ModalPage);
        modal.present();
    }

    openFacet(){
        let modal = this.modalCtrl.create( FacetPage );
        modal.present();
    }
}
