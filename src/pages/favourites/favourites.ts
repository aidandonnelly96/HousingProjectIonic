import { Component } from '@angular/core';
import { App, IonicPage, NavController, NavParams } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth'
import { DatabaseProvider } from '../../providers/database/database';
import { HomeDetailPage } from '../home-detail/home-detail';

import firebase from 'firebase';

/**
 * Generated class for the FavouritesPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@Component({
  selector: 'page-favourites',
  templateUrl: 'favourites.html',
})
export class FavouritesPage {
    favouriteIDs=[];
    favourites=[];
    show=true;
    uid: string;

    constructor(public navCtrl: NavController, public navParams: NavParams, public auth: AuthProvider, public db: DatabaseProvider, public appCtrl: App) {
        this.uid=this.auth.getCurrentUser().uid;
        this.getFavouritesByUserID(this.auth.getCurrentUser().uid);
    }

    ionViewDidLoad() {
    console.log('ionViewDidLoad FavouritesPage');
    }
    getFavouritesByUserID(uid){
        console.log("getting");
        var favs=[];
        var favQuery = firebase.database().ref('/favourites');
        var me = this;
        favQuery.once('value')
             .then(parentSnap => {
                    parentSnap.forEach(function(snap)
                    {
                        if(snap.val().userID==uid){
                            var homeQuery = firebase.database().ref('/homes/').child(snap.val().homeID);
                            homeQuery.once('value')
                                .then(homeSnap => {
                                    favs.push(homeSnap.val());
                                    me.favourites=favs;
                                })
                        }
                    })
        });
    }
    removeFromFavourites(id){
        var favQuery = firebase.database().ref('/favourites');
        var me = this;
        favQuery.once('value')
             .then(parentSnap => {
                    parentSnap.forEach(function(snap)
                    {
                        if(snap.val().userID==me.uid){
                            if(snap.val().homeID==id){
                                console.log(snap.key);
                                firebase.database().ref('/favourites/'+snap.key).remove().then(function(data){
                                    me.getFavouritesByUserID(me.uid);
                                });
                            }
                        }
                    })
        });
    }
    goToHomeDetail(h) {
        this.appCtrl.getRootNav().push(HomeDetailPage, {
            home: h
        });
    }

}
