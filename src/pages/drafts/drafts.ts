import { Component } from '@angular/core';
import { App, IonicPage, NavController, NavParams } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth'
import { DatabaseProvider } from '../../providers/database/database';
import { HomeDetailPage } from '../home-detail/home-detail';
import { ModalController } from 'ionic-angular';
import { ModalPage } from '../modal/modal';

import firebase from 'firebase';

/**
 * Generated class for the DraftsPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-drafts',
  templateUrl: 'drafts.html',
})
export class DraftsPage {

    drafts=[];

    constructor(public navCtrl: NavController, public navParams: NavParams, public auth: AuthProvider, public db: DatabaseProvider, public modalCtrl: ModalController, public appCtrl: App) {
        this.getDraftsByUserID(this.auth.getCurrentUser().uid);
    }

    ionViewDidLoad() {
    console.log('ionViewDidLoad MypostsPage');
    }
    getDraftsByUserID(uid){
        var query = firebase.database().ref('/homes');
        var me = this;
        query.once('value')
             .then(parentSnap => {
                    parentSnap.forEach(function(snap)
                    {
                        if(snap.val().userID==uid){
                            if(snap.val().postStatus=="draft"){
                                me.drafts.push(snap.val());
                            }
                        }
                    })
        });
    }
    editDraft(draft) {
        let modal = this.modalCtrl.create(ModalPage, {draft: draft});
        modal.present();
    }
    removeFromDrafts(id){ 
        firebase.database().ref('/homes/'+id).remove();
    }

}
