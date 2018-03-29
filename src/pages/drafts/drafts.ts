import { Component } from '@angular/core';
import { ViewController, App, IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth'
import { DatabaseProvider } from '../../providers/database/database';
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
    modalThis: any;
    last=12;
    months: string[]=["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

    constructor(public navCtrl: NavController, public navParams: NavParams, public auth: AuthProvider, public db: DatabaseProvider, public modalCtrl: ModalController, public appCtrl: App, public alertCtrl: AlertController, public viewCtrl: ViewController) {
        this.getDraftsByUserID(this.auth.getCurrentUser().uid);

        /*When the user redirects from the ModalPage(page allowing them to contribute) to the DraftsPage,
        they pass the context of the ModalPage as a parameter.
        We use this parameter to hide the ModalPage if the user choose a draft*/
        this.modalThis=navParams.get("modalThis");
    }

    //uid is the user ID of the user we're retrieving drafts for
    getDraftsByUserID(uid){

        //Firebase query returning all homes posted by the current user
        var query = firebase.database().ref().child('/homes/').orderByChild("userID").equalTo(uid);

        //store the current context
        var me = this;

        //realtime database allows us to listen for changes in database elements
        query.on("child_changed", function(changeSnap){

            //remove a draft from the list by filtering the drafts by their IDs once its removed from the database
            me.drafts=me.drafts.filter(obj => obj.id !== changeSnap.val().id);

            //if and only if the changed home is a draft, we'd like to display it
            if(changeSnap.val().postStatus=="draft"){
                let home=changeSnap.val();
                var dateSuffix="";

                //home.posted stores the unix timestamp of when the home was posted
                var dt=new Date(home.posted);

                //calculate the date suffix
                if((dt.getDate()-1)%10==0 || dt.getDate()==1){
                    dateSuffix="st";
                }
                else if((dt.getDate()-3)%10==0 || dt.getDate()==3){
                    dateSuffix="rd";
                }
                else if((dt.getDate()-2)%10==0 || dt.getDate()==2){
                    dateSuffix="nd";
                }
                else{
                    dateSuffix="th";
                }

                //concatenate the date suffix to the date from the unix timestamp and store it in the home variable
                var datePosted=dt.getDate()+dateSuffix+" "+me.months[dt.getMonth()]+" "+dt.getFullYear();
                home.datePosted=datePosted;

                //push the home variable to the top of the list of drafts, will be displayed automatically
                me.drafts.unshift(home);
            }
        });

        query.on("child_removed", function(removeSnap){
            //remove a draft from the list by filtering the drafts by their IDs once its removed from the database
            me.drafts=me.drafts.filter(obj => obj.id !== removeSnap.val().id);
        });

        query.on("child_added", function(addSnap){
                if(addSnap.val().postStatus=="draft"){
                    let home=addSnap.val();
                    var dateSuffix="";

                    //home.posted stores the unix timestamp of when the home was posted
                    var dt=new Date(home.posted);

                    //calculate the date suffix
                    if((dt.getDate()-1)%10==0 || dt.getDate()==1){
                        dateSuffix="st";
                    }
                    else if((dt.getDate()-3)%10==0 || dt.getDate()==3){
                        dateSuffix="rd";
                    }
                    else if((dt.getDate()-2)%10==0 || dt.getDate()==2){
                        dateSuffix="nd";
                    }
                    else{
                        dateSuffix="th";
                    }

                    //concatenate the date suffix to the date from the unix timestamp and store it in the home variable
                    var datePosted=dt.getDate()+dateSuffix+" "+me.months[dt.getMonth()]+" "+dt.getFullYear();
                    home.datePosted=datePosted;

                    //push the home variable to the top of the list of drafts, will be displayed automatically
                    me.drafts.unshift(home);
                }
        });
    }
    editDraft(draft){
        //if the user has been redirected from the ModalPage, we should hide that modal page
        if(this.modalThis!=undefined){
            this.modalThis.viewCtrl.dismiss();
        }
        //open another modalpage, passing the desired draft as a parameter
        let modal = this.modalCtrl.create(ModalPage, {draft: draft});
        modal.present();
    }

    removeFromDrafts(id){
        /*alertCtrl.create() allows us to define an alert popup before using it.
        In this case, we'd like the user to confirm that they wish to remove a home*/
        let alert = this.alertCtrl.create({
            title: 'Are you sure?',
            message: 'Are you sure you want to remove this home from your drafts?',
            buttons: [
              {
                text: 'Cancel',
                role: 'cancel',
                handler: () => {}
              },
              {
                text: 'Remove',
                handler: () => {
                    this.drafts=this.drafts.filter(obj => obj.id != id);
                    this.db.deleteHome(id);
                }
              }
            ]
        });

        //present the alert popup
        alert.present();
    }

    /*html infiniteList element executes this function to load more homes.
    All homes are already stored in the homes variable, but performance worsens when we try to load too many images at once, so we load them display them 12 at a time to improve perfomance
    this.last stores the index of the last home that should be displayed*/
    doInfinite(infiniteScroll){
        setTimeout(() => {
          this.last+=12;
          infiniteScroll.complete();
        }, 500);
    }
}
