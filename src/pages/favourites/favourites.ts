import { Component } from '@angular/core';
import { App, NavController, NavParams, AlertController, ModalController } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth'
import { DatabaseProvider } from '../../providers/database/database';
import { HomeDetailPage } from '../home-detail/home-detail';
import { ModalPage } from '../modal/modal';

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
    favourites=[];

    /*We display bookmarked homes incrementally,
    beginning at 12 and incrementing by 12 each time the user makes a request to load more*/
    last:12;
    months: string[]=["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

    constructor(public navCtrl: NavController, public navParams: NavParams, public auth: AuthProvider, public db: DatabaseProvider, public appCtrl: App, public alertCtrl: AlertController, public modalCtrl: ModalController) {
        this.getFavouritesByUserID(this.auth.getCurrentUser().uid);
    }

    getFavouritesByUserID(uid){

        //firebase realtime database query returning the IDs of the home that the current user has bookmarked
        var favQuery=firebase.database().ref().child('userProfile/'+uid+'/favourites');
        var me=this;

        //firebase realtime database allows us to listen for deletions in the database
        favQuery.on("child_removed", function(removeSnap){
            //if a user un-bookmarks a home, we remove it from the list in real time
            me.favourites=me.favourites.filter(obj => obj.id !== removeSnap.val().homeID);
        });

        //firebase realtime database allows us to listen for new elements being added to the database
        favQuery.on("child_added", function(addSnap){

            //the favQuery simply returns the ID of the home, once we have that, we can retrieve the home itself using the following query
            var homeQuery = firebase.database().ref('/homes/').child(addSnap.val().homeID);
                homeQuery.once('value')
                    .then(homeSnap => {
                        let home=homeSnap.val();
                        if(homeSnap.val()!=null){
                            home.userBookmarked=true;
                        }

                        //calculate the date suffix based on the unix timestamp of when the home was posted
                        var dateSuffix="";
                        var dt=new Date(home.posted);
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

                        //concatenate the suffix with the date, month and year parts of the timestamp
                        var datePosted=dt.getDate()+dateSuffix+" "+me.months[dt.getMonth()]+" "+dt.getFullYear();
                        home.datePosted=datePosted;

                        //push the home to the top of the list
                        me.favourites.unshift(home);
                    });
        });

    }

    /*id stores the ID of a home
    this function removes that id from the user's list of bookmarked homes*/
    removeFromFavourites(id){
        //delete the id from the current user's list of favourites
        firebase.database().ref().child('userProfile/'+this.auth.getCurrentUser().uid+'/favourites/'+id).remove();
    }

    /*h stores the home which the user has requested a detailed view of,
    including all of its child attributes

    We pass h to the HomeDetailPage, which can use navParams.get("home") to retrieve it
    It can then display all of the child attributes stored on that home*/
    goToHomeDetail(h) {
        //redirect to a detailed view of the desired home, passing the desired home as a parameter to the page
        this.appCtrl.getRootNav().push(HomeDetailPage, {
            home: h
        });
    }

    /*Mark this home as 'deleted', this will hide it from the search queries, however,
    users that have bookmarked the home and the homes original contributer can still view it

    home stores the home the user is removing*/
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
                    //mark home as 'deleted' locally
                    home.postStatus="deleted";

                    //mark home as 'deleted' in database
                    this.db.removeHome(home.id, home.postStatus);
                }
              }
            ]
        });
        alert.present();
    }

    /*home stores the home that the user wishes to edit, along with all of its child attributes
    these attributes can be used to populate the fields in the "homes" form in the ModalPage*/
    editHome(home){
        /*Open post page, passing the desired home as a parameter.
        Post page metadata values will default to the values of the desired home*/
        let modal = this.modalCtrl.create(ModalPage, {draft: home});
        modal.present();
    }

    /*If a home that has been bookmarked by a user has been removed, the user can choose to put it back, if they believe it was incorrectly removed
      h stores the home that the user is placing back into public view*/
    putBack(h){
        this.db.putBack(h);
    }

    /*If a home that has been bookmarked by a user has been edited, the user can choose to revert to their bookmarked version,
    if they believe it was incorrectly edited

    h stores the version of the home that the user is reverting to*/
    revert(h){
        this.db.revert(h);
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
