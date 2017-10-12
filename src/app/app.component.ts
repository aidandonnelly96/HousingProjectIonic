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


import * as firebase from 'firebase/app';


@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;
  //rootPage:any;
  rootPage:any = TabsPage;

  pages: Array<{title: string, component: any, icon: string}>;
  
  
  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen,  public authProvider: AuthProvider, public events: Events) {
    firebase.initializeApp({
        apiKey: "AIzaSyDYfzqcaXSUNRKhVM60RXQaQsIOp0Amsbo",
        authDomain: "finalyearhousingproject.firebaseapp.com",
        databaseURL: "https://finalyearhousingproject.firebaseio.com",
        projectId: "finalyearhousingproject",
        storageBucket: "finalyearhousingproject.appspot.com",
        messagingSenderId: "1021387443585"
    });
    
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
        
        if(authProvider.getCurrentUser()===null){
            this.pages = [
            { title: 'Login', component: LoginPage, icon:  'log-in'}
           ];
        }
        else{
            this.pages = [
            { title: 'My Account', component: CameraPage, icon: 'person' },
            { title: 'Capture', component: CameraPage, icon: 'camera' },
            { title: 'My Homes', component: CameraPage, icon:  'home'},
            { title: 'Log out', component: CameraPage, icon:  'log-out'}
           ];
        }
      statusBar.styleDefault();
      splashScreen.hide();
    });
    
    events.subscribe('user:login', () => {
        this.loggedIn();
    });
  }
  
  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.push(page.component);
  }
  
  loggedIn() {
    if(this.authProvider.getCurrentUser()===null){
            this.pages = [
            { title: 'Login', component: LoginPage, icon:  'log-in'}
           ];
        }
        else{
            this.pages = [
            { title: 'My Account', component: CameraPage, icon: 'person' },
            { title: 'Capture', component: CameraPage, icon: 'camera' },
            { title: 'My Homes', component: CameraPage, icon:  'home'},
            { title: 'Log out', component: CameraPage, icon:  'log-out'}
           ];
        }
  }

}
