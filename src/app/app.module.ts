import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation';
import { HTTP } from '@ionic-native/HTTP';

import { NativeGeocoder, NativeGeocoderReverseResult, NativeGeocoderForwardResult } from '@ionic-native/native-geocoder';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { IonicApp, IonicModule, IonicErrorHandler, NavController } from 'ionic-angular';
import { MyApp } from './app.component';

import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';
import { MapPage } from '../pages/map/map';
import { CameraPage } from '../pages/camera/camera';
import { ModalPage } from '../pages/modal/modal';
import { HomeDetailPage } from '../pages/home-detail/home-detail';
import { LoginPage } from '../pages/login/login';
import { FacetPage } from '../pages/facet/facet';
import { Camera } from '@ionic-native/camera';
import { AutocompletePage } from '../pages/autocomplete/autocomplete';
import { SignupPage } from '../pages/signup/signup';


import { SpinnerDialog } from '@ionic-native/spinner-dialog';

import { AuthProvider } from '../providers/auth/auth';
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { DatabaseProvider } from '../providers/database/database';

var firebaseConfig = {
    apiKey: "AIzaSyDYfzqcaXSUNRKhVM60RXQaQsIOp0Amsbo",
    authDomain: "finalyearhousingproject.firebaseapp.com",
    databaseURL: "https://finalyearhousingproject.firebaseio.com",
    projectId: "finalyearhousingproject",
    storageBucket: "finalyearhousingproject.appspot.com",
    messagingSenderId: "1021387443585"
  };

@NgModule({
  declarations: [
    MyApp,
    ModalPage,
    CameraPage,
    HomeDetailPage,
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
    IonicModule.forRoot(MyApp),
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireAuthModule,
    AngularFireDatabaseModule,
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LoginPage,
    FacetPage,
    CameraPage,
    AutocompletePage,
    SignupPage,
    HomeDetailPage,
    HomePage,
    ModalPage,
    TabsPage,
    MapPage
  ],
  providers: [
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
