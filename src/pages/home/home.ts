import { Component, ViewChild } from '@angular/core';
import { App, Nav, ModalController, AlertController } from 'ionic-angular';
import { ModalPage } from '../modal/modal';
import { HomeDetailPage } from '../home-detail/home-detail';
import { NavController, Events } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { FacetPage } from '../facet/facet'
import { PopoverController } from 'ionic-angular';
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

    last=12;

    constructor(public navCtrl: NavController, public modalCtrl: ModalController, public popoverCtrl: PopoverController, public db: DatabaseProvider, public events: Events, private geolocation: Geolocation, public auth: AuthProvider, public appCtrl: App, public alertCtrl: AlertController) {}

    //this function is called when the user selects a home
    goToHomeDetail(h) {
        /*Redirect from the tabs page to the HomeDetailPage of a given home, passing that home as a parameter.
        This parameter can then be accessed using the Ionic NavParams package*/
        this.appCtrl.getRootNav().push(HomeDetailPage, {
            home: h
        });
    }

    /*this function is called when the user selects a 'bookmark' button below a home
    this button will only be displayed if the user has not already bookmarked the home

    home stores the home that the user is adding to their bookmarks,
    we use this parameter to add its id to the list of homes bookmarked by the current user*/
    addToFavourites(home){
        //add the home to the user's list of bookmarked homes in the firebase database
        this.db.addToFavourites(home.id);

        //add the home to the user's list of bookmarked homes locally
        home.userBookmarked=true;
    }

    /*this function is called when the user selects a 'bookmark' button below a home
    this button will only be displayed if the user has already bookmarked the home

    home stores the home that the user is removing from their bookmarks,
    we use this parameter to remove its id from the list of homes bookmarked by the current user*/
    removeFromFavourites(home){
        //remove the home from the user's list of bookmarked homes in the firebase database
        firebase.database().ref().child('/userProfile/'+this.auth.getCurrentUser().uid+'/favourites/'+home.id).remove();

        //remove the home from the user's list of bookmarked homes locally
        home.userBookmarked=false;
    }

    /*Mark this home as 'deleted', this will hide it from the search queries, however,
    users that have bookmarked the home and the homes original contributer can still view it

    homeID stores the ID of the home that the user is removing*/
    removeHome(home){
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
                    this.db.removeHome(home.id, home.postStatus);
                }
              }
            ]
        });
        alert.present();
    }

    //this function is called when the users presses the 'edit' button below a home
    //the corresponding home is passed as a parameter
    editHome(home){
        /*Open post page, passing the desired home as a parameter.
        Post page metadata values will default to the values of the desired home*/
        let modal = this.modalCtrl.create(ModalPage, {draft: home});
        modal.present();
    }

    presentModal(){
        /*getCurrentUser() returns null if the user is currently not logged in.
        The modal page allows the user to contribute to the dataset by posting a home.

        We only allow the user to do so if they are logged in,
        otherwise this function will redirect the user to the login page*/
        if(this.auth.getCurrentUser()!=null){
            let modal = this.modalCtrl.create( ModalPage );
            modal.present();
        }
        else{
            this.appCtrl.getRootNav().push(LoginPage);
        }
    }

    openFacet(){
        //Facet page, allowing the user to update the search query, is displayed as a modal
        let modal = this.modalCtrl.create( FacetPage );
        modal.present();
    }

    /*html infiniteList element executes this function to load more homes.
    All homes are already stored in the homes variable, but performance worsens when we try to load too many images at once, so we load them display them 12 at a time to improve perfomance.
    this.last stores the index of the last home that should be displayed*/
    doInfinite(infiniteScroll){
        setTimeout(() => {
          this.last+=12;
          infiniteScroll.complete();
        }, 500);
    }
}
