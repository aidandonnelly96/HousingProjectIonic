import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation';
import { NativePageTransitions } from '@ionic-native/native-page-transitions';
import { HTTP } from '@ionic-native/HTTP';
import { StatusBar } from '@ionic-native/status-bar';

import { NativeGeocoder } from '@ionic-native/native-geocoder';

import { SplashScreen } from '@ionic-native/splash-screen';

import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';
import { MapPage } from '../pages/map/map';
import { HomemapPage } from '../pages/homemap/homemap';
import { InfoPage } from '../pages/info/info';
import { ModalPage } from '../pages/modal/modal';
import { HomeDetailPage } from '../pages/home-detail/home-detail';
import { HistoryPage } from '../pages/history/history';
import { HomeDetailPopoverPage } from '../pages/home-detail-popover/home-detail-popover';
import { LoginPage } from '../pages/login/login';
import { SearchPage } from '../pages/search/search';
import { MypostsPage } from '../pages/myposts/myposts';
import { FavouritesPage } from '../pages/favourites/favourites';
import { DraftsPage } from '../pages/drafts/drafts';
import { SettingsPage } from '../pages/settings/settings';
import { AccountPage } from '../pages/account/account';
import { ImagePickerPage } from '../pages/image-picker/image-picker';
import { ResetPasswordPage } from '../pages/reset-password/reset-password';
import { FacetPage } from '../pages/facet/facet';
import { FullscreenPage } from '../pages/fullscreen/fullscreen';
import { Camera } from '@ionic-native/camera';
import { SignupPage } from '../pages/signup/signup';
import { GalleryPage } from '../pages/gallery/gallery';
import { PostPopoverPage } from '../pages/post-popover/post-popover';
import { LocationPickerPage } from '../pages/location-picker/location-picker';
import { MypostsfilterPage } from '../pages/mypostsfilter/mypostsfilter';

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
    HomeDetailPage,
    HomeDetailPopoverPage,
    LoginPage,
    SearchPage,
    SignupPage,
    AccountPage,
    ImagePickerPage,
    MypostsfilterPage,
    ResetPasswordPage,
    FacetPage,
    FullscreenPage,
    HistoryPage,
    MypostsPage,
    FavouritesPage,
    DraftsPage,
    SettingsPage,
    PostPopoverPage,
    LocationPickerPage,
    HomePage,
    TabsPage,
    HomemapPage,
    InfoPage,
    GalleryPage,
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
    SearchPage,
    FacetPage,
    FullscreenPage,
    HistoryPage,
    ImagePickerPage,
    MypostsfilterPage,
    HomeDetailPopoverPage,
    SignupPage,
    MypostsPage,
    FavouritesPage,
    DraftsPage,
    SettingsPage,
    PostPopoverPage,
    LocationPickerPage,
    AccountPage,
    ResetPasswordPage,
    HomeDetailPage,
    HomePage,
    ModalPage,
    TabsPage,
    HomemapPage,
    InfoPage,
    GalleryPage,
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
    Geolocation,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    AuthProvider,
    DatabaseProvider
  ]
})
export class AppModule {}
