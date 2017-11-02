import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, NavController, Events } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { MapPage } from '../pages/map/map'
import { HomePage } from '../pages/home/home'
import { CameraPage } from '../pages/camera/camera'
import { TabsPage } from '../pages/tabs/tabs';
import { LoginPage } from '../pages/login/login';
import { AuthProvider } from '../providers/auth/auth';
import { DatabaseProvider } from '../providers/database/database';
import { MenuController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';


import * as firebase from 'firebase/app';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;
  //rootPage:any;
  rootPage:any = TabsPage;
  
  homes: any[] = []; 
  
  status: string;
  buildingType: string;

  pages: Array<{title: string, component: any, icon: string}>;
  login: Array<{component: any}>;

  constructor(platform: Platform, statusBar: StatusBar, public geolocation: Geolocation, splashScreen: SplashScreen, public authProvider: AuthProvider, public events: Events, private menu: MenuController, public alertCtrl: AlertController, public db: DatabaseProvider) {
     this.status="Any";
     this.buildingType="Any";
     events.subscribe('home:entered', (time) => {
            this.homes=this.db.homes;
            console.log(this.homes);
      });
     this.getHomesForCurrentLocation();
     this.pages = [
            { title: 'My Account', component: CameraPage, icon: 'person' },
            { title: 'My Homes', component: CameraPage, icon:  'home'},
            { title: 'Capture', component: CameraPage, icon: 'camera' }
     ];
     this.login = [
            { component: LoginPage }
     ];
    
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
        statusBar.styleDefault();
        splashScreen.hide();
        // let status bar overlay webview
        statusBar.overlaysWebView(false);

        // set status bar to white
        statusBar.backgroundColorByHexString('#455A64');
    });
    
        
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            menu.enable(true, 'authenticated');
            menu.enable(false, 'unauthenticated');
        } else {
            menu.enable(false, 'authenticated');
            menu.enable(true, 'unauthenticated');
        }
    });
  }
  
  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.push(page.component);
  }
  
  presentConfirmLogout() {
  const alert = this.alertCtrl.create({
    title: 'Log out',
    message: 'Are you sure you want to log out?',
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
        }
      },
      {
        text: 'Ok',
        handler: () => {
          this.authProvider.logoutUser();
        }
      }
    ]
  });
  alert.present();
}
  
  logoutUser(){
    this.authProvider.logoutUser();
  }
  
  getHomesForCurrentLocation(){
    this.geolocation.getCurrentPosition().then((resp) => {
         this.db.userLat=resp.coords.latitude;
         this.db.userLng=resp.coords.longitude;
         console.log(this.db.userLat);
         this.db.getRequestedHomes(resp.coords.latitude, resp.coords.longitude, 5, this.buildingType, this.status);
    }).catch((error) => {
         this.db.getRequestedHomes(53.3813572, -6.5940997, 5, this.buildingType, this.status);
    });
  }
}
