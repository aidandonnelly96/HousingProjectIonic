import { Component } from '@angular/core';
import { App, IonicPage, NavController, NavParams } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth'
import { DatabaseProvider } from '../../providers/database/database';
import { HomeDetailPage } from '../home-detail/home-detail';
import { ModalController } from 'ionic-angular';
import { AccountPage } from '../account/account';


import firebase from 'firebase';

/**
 * Generated class for the MypostsPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@Component({
  selector: 'page-myposts',
  templateUrl: 'myposts.html',
})
export class MypostsPage {
    homes=[];

    constructor(public navCtrl: NavController, public navParams: NavParams, public auth: AuthProvider, public db: DatabaseProvider, public modalCtrl: ModalController, public appCtrl: App) {
        this.getPostsByUserID(this.auth.getCurrentUser().uid);
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad MypostsPage');
    }
    getPostsByUserID(uid){
        var query = firebase.database().ref('/homes');
        var me = this;
        query.once('value')
             .then(parentSnap => {
                    parentSnap.forEach(function(snap)
                    {
                        if(snap.val().userID==uid){
                            if(snap.val().postStatus!="draft"){
                                me.homes.push(snap.val());
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
