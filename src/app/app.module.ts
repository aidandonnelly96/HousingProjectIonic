import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation';
import { NativePageTransitions } from '@ionic-native/native-page-transitions';
import { HTTP } from '@ionic-native/HTTP';
import { StatusBar } from '@ionic-native/status-bar';

import { NativeGeocoder, NativeGeocoderReverseResult, NativeGeocoderForwardResult } from '@ionic-native/native-geocoder';

import { SplashScreen } from '@ionic-native/splash-screen';

import { IonicApp, IonicModule, IonicErrorHandler, NavController } from 'ionic-angular';
import { MyApp } from './app.component';

import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';
import { MapPage } from '../pages/map/map';
import { CameraPage } from '../pages/camera/camera';
import { ModalPage } from '../pages/modal/modal';
import { HomeDetailPage } from '../pages/home-detail/home-detail';
import { HomeDetailPopover } from '../pages/home-detail/home-detail';
import { LoginPage } from '../pages/login/login';
import { FacetPage } from '../pages/facet/facet';
import { Camera } from '@ionic-native/camera';
import { AutocompletePage } from '../pages/autocomplete/autocomplete';
import { SignupPage } from '../pages/signup/signup';


import { SpinnerDialog } from '@ionic-native/spinner-dialog';

import { AuthProvider } from '../providers/auth/auth';
import { DatabaseProvider } from '../providers/database/database';

import * as firebase from 'firebase/app';

firebase.initializeApp({
        apiKey: "AIzaSyDYfzqcaXSUNRKhVM60RXQaQsIOp0Amsbo",
        authDomain: "finalyearhousingproject.firebaseapp.com",
        databaseURL: "https://finalyearhousingproject.firebaseio.com",
        projectId: "finalyearhousingproject",
        storageBucket: "finalyearhousingproject.appspot.com",
        messagingSenderId: "1021387443585"
    });

@NgModule({
  declarations: [
    MyApp,
    ModalPage,
    CameraPage,
    HomeDetailPage,
    HomeDetailPopover,
    LoginPage,
    AutocompletePage,
    SignupPage,
    FacetPage,
    HomePage,
    TabsPage,
    MapPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LoginPage,
    FacetPage,
    CameraPage,
    AutocompletePage,
    HomeDetailPopover,
    SignupPage,
    HomeDetailPage,
    HomePage,
    ModalPage,
    TabsPage,
    MapPage
  ],
  providers: [
    NativePageTransitions,
    StatusBar,
    AuthProvider,
    SpinnerDialog,
    Camera,
    NativeGeocoder,
    HTTP,
    AutocompletePage,
    Geolocation,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    AuthProvider,
    DatabaseProvider,
  ]
})
export class AppModule {}
