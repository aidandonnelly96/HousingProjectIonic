import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, Events } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { TabsPage } from '../pages/tabs/tabs';
import { GalleryPage } from '../pages/gallery/gallery';
import { LoginPage } from '../pages/login/login';
import { AccountPage } from '../pages/account/account';
import { AuthProvider } from '../providers/auth/auth';
import { DatabaseProvider } from '../providers/database/database';
import { MenuController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';

import * as firebase from 'firebase/app';

@Component({
  templateUrl: 'app.html',
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;
  //rootPage:any;
  rootPage:any = TabsPage;

  homes: any[] = [];

  status: string;
  buildingType: string;

  pages: Array<{title: string, component: any}>;
  login: Array<{component: any}>;

  constructor(platform: Platform, statusBar: StatusBar, public geolocation: Geolocation, splashScreen: SplashScreen, public authProvider: AuthProvider, public events: Events, private menu: MenuController, public alertCtrl: AlertController, public db: DatabaseProvider) {

    var me=this;
    //this.updateExisting();

    //execute default search
    this.getHomesForIreland();
    this.geolocation.getCurrentPosition().then((resp) => {
        me.db.userLat=resp.coords.latitude;
        me.db.userLng=resp.coords.longitude;
        console.log("resp: "+resp)
    }).catch((error) => {
         console.log(error);
    });

    /*Once the user opens the application, we begin watching their location
    so we can use it if they wish to contribute a homes

    every time their location updates, we update the userLat and userLng fields on the
    database provider*/
    let watch = this.geolocation.watchPosition();
    watch.subscribe((data) => {
        if(data!=undefined){
            me.db.userLat=data.coords.latitude;
            me.db.userLng=data.coords.longitude;
            console.log("data: "+data)
        }
    });

     //the following arrays define the objects that are displayed in the side menuClose
     //authenticated
     this.pages = [
            { title: 'My Account', component: AccountPage },
            { title: 'Gallery', component: GalleryPage }
     ];

     //unauthenticated
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


    /*here, we listen for changes in the users authentication state and update
    the side menu accordingly*/
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            /*if the user is logged in, we should display the "My Account" and "Gallery" options,
            and hide the "Log in option" */
            menu.enable(true, 'authenticated');
            menu.enable(false, 'unauthenticated');
        } else {
            /*If the user is not logged in, we should display the "Log in" option,
            and hide the "My Account" and "Gallery options"*/
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

      //prompt the user to confirm their wish to log out
      const alert = this.alertCtrl.create({
        title: 'Log out',
        message: 'Are you sure you want to log out?',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
              //If the user cancels their action, do nothing. The alert popup will close automatically
            }
          },
          {
            text: 'Ok',
            handler: () => {
              //if the user confirms their action, log them out
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
  getHomesForIreland(){
    /*this function executes the default search and retrieves all published homes in Ireland

    53.41541685357065, -7.956286483637438 is the approximate centre of Ireland,
    356 is the approximate distance in kilometers from the centre of Ireland to the
    furthest edge of the country*/
    this.db.getHomes("Ireland", 53.41541685357065, -7.956286483637438, 356, 15, 500, "Any", "Any", "Any", "Any", "Any", "Any", "Any", "Any", "Any", "Any");
  }

/*updateExisting(){
    this.db.updateExisting();
}*/
}
