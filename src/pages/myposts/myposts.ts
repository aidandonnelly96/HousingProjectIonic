import { Component } from '@angular/core';
import { PopoverController, ModalController, App, NavController, NavParams, AlertController } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth'
import { DatabaseProvider } from '../../providers/database/database';
import { HomeDetailPage } from '../home-detail/home-detail';
import { MypostsfilterPage } from '../mypostsfilter/mypostsfilter';
import { ModalPage } from '../modal/modal';

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
    visibleHomes=[];
    statusFilter="all";
    last=12;
    months: string[]=["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

    constructor(public navCtrl: NavController, public navParams: NavParams, public auth: AuthProvider, public db: DatabaseProvider, public modalCtrl: ModalController, public appCtrl: App, public alertCtrl: AlertController, public popoverCtrl: PopoverController) {

        //this page is only accessible from the MyAccount page.
        //Meaning unauthenticated users cannot access it - no need to check for getCurrentUser==null
        this.getPostsByUserID(this.auth.getCurrentUser().uid);
    }

    getPostsByUserID(uid){
        //query of all homes posted by the current user
        var query = firebase.database().ref().child('/homes/').orderByChild("userID").equalTo(uid);
        var me = this;

        /*Realtime database allows us to listen for updates in the DatabaseProvider
        AngularJS will update the UI when we execute visibleHomes.unshift(home) after a child is added*/
        query.on("child_added", function(addSnap){
              /*This tab only displays published, edited and deleted homes, so we filter out the drafts

              The page also allows the user to manually filter by post status(published, edited etc.),
              me.statusFilter stores the users desired post status, so we compare against that too

              If the home's post status matches the users desired filter, or the filter is "all", we'll display it immediately*/
              if(addSnap.val().postStatus!="draft" && (addSnap.val().postStatus==me.statusFilter || me.statusFilter=='all')){
                  let home=addSnap.val();
                  var dateSuffix="";

                  //Calculating time since posted using the unix timestamp of when each home was posted
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

                  //Concatenate the suffix to the date, month and year parts of the timestamp
                  var datePosted=dt.getDate()+dateSuffix+" "+me.months[dt.getMonth()]+" "+dt.getFullYear();
                  home.datePosted=datePosted;

                  //add this home to the total list of homes
                  me.homes.unshift(home);

                  //add this to the list of visible homes too, as the first if statement verifies that the user wishes to view it now
                  me.visibleHomes.unshift(home);
              }

              /*This tab only displays published, edited and deleted homes, so we filter out the drafts

                If the home's post status does NOT match the user's desired filter AND the filter is not "all",
                we'll keep the home hidden for now, but store it in this.homes for later in case the user changes their filter later on*/
              else if(addSnap.val().postStatus!="draft" ){
                  let home=addSnap.val();
                  var dateSuffix="";
                  var dt=new Date(home.posted);

                  //Calculating time since posted using the unix timestamp of when each home was posted
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

                  //Concatenate the suffix to the date, month and year parts of the timestamp
                  var datePosted=dt.getDate()+dateSuffix+" "+me.months[dt.getMonth()]+" "+dt.getFullYear();
                  home.datePosted=datePosted;

                  /*Only add this to the total list of homes,
                  as the if-else statement verifies that the user doesnt wish to see it yet*/
                  me.homes.unshift(home);
              }
        });

        /*Realtime database allows us to listen for updates in the DatabaseProvider
        AngularJS will update the UI when we execute visibleHomes.unshift(home) after a child is changed
        and remove the home if necessary*/
        query.on("child_changed", function(changeSnap){

            /*For each object in me.homes and me.visibleHomes,
            if its ID matches the ID of the child that was changed, remove it from the list*/
            me.homes=me.homes.filter(obj => obj.id !== changeSnap.val().id);
            me.visibleHomes=me.visibleHomes.filter(obj => obj.id !== changeSnap.val().id);

            /*This tab only displays published, edited and deleted homes, so we filter out the drafts

            If the home's post status matches the users desired filter, or the filter is "all", we'll display it immediately*/
            if(changeSnap.val().postStatus!="draft"){
                if(changeSnap.val().postStatus==me.statusFilter || me.statusFilter=="all"){
                    let home=changeSnap.val();
                    if(home!=null){
                        home.userBookmarked=true;
                    }

                    //Calculating time since posted using the unix timestamp of when each home was posted
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

                    //Concatenate the suffix to the date, month and year parts of the timestamp
                    var datePosted=dt.getDate()+dateSuffix+" "+me.months[dt.getMonth()]+" "+dt.getFullYear();
                    home.datePosted=datePosted;
                    me.homes=me.homes.filter(obj => obj.id != changeSnap.val().id);
                    me.visibleHomes=me.visibleHomes.filter(obj => obj.id != changeSnap.val().id);


                    //add this home to the total list of homes
                    me.homes.unshift(home);

                    //add this to the list of visible homes too, as the first if statement verifies that the user wishes to view it now
                    me.visibleHomes.unshift(home);
                }

                /*This tab only displays published, edited and deleted homes, so we filter out the drafts

                  If the home's post status does NOT match the user's desired filter AND the filter is not "all",
                  we'll keep the home hidden for now, but store it in this.homes for later in case the user changes their filter later on*/
                else if(changeSnap.val().postStatus!="draft" ){
                    let home=changeSnap.val();
                    var dateSuffix="";

                    //Calculating time since posted using the unix timestamp of when each home was posted
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

                    //Concatenate the suffix to the date, month and year parts of the timestamp
                    var datePosted=dt.getDate()+dateSuffix+" "+me.months[dt.getMonth()]+" "+dt.getFullYear();
                    home.datePosted=datePosted;
                    me.homes=me.homes.filter(obj => obj.id != changeSnap.val().id);
                    me.visibleHomes=me.visibleHomes.filter(obj => obj.id != changeSnap.val().id);

                    /*Only add this to the total list of homes,
                    as the if-else statement verifies that the user doesnt wish to see it yet*/
                    me.homes.unshift(home);
                }
            }
        });
        query.on("child_removed", function(removeSnap){
            /*For each object in me.homes and me.visibleHomes,
            if its ID matches the ID of the child that was removed, remove it from the list*/
            me.homes=me.homes.filter(obj => obj.id !== removeSnap.val().id);
            me.visibleHomes=me.visibleHomes.filter(obj => obj.id != removeSnap.val().id);
        });
    }

    //This function is called when the user selects a home to view in further detail
    goToHomeDetail(h) {
        /*getRootNav() gets the root of the current navigation stack, in this case, the MyAccount page.

        Redirect to a detailed view of a home. The home is passed as a parameter and can be accessed using navParams.get("home")*/
        this.appCtrl.getRootNav().push(HomeDetailPage, {
            home: h
        });
    }

    //If a home has been removed, the user can choose to put it back, if they believe it was incorrectly removed
    putBack(h){
        this.db.putBack(h);
    }

    /*If a home has been edited, the user can choose to revert to their desired version,
    if they believe it was incorrectly edited*/
    revert(h){
        this.db.revert(h);
    }

    /*this function is called when the user clicks the "remove" text below each home

    this function prompts the user to confirm their action and then marks the home as "deleted",
    hiding it from seach queries*/
    removeHome(home){
        let alert = this.alertCtrl.create({
            title: 'Are you sure?',
            message: 'Are you sure you want to remove this home?',
            buttons: [
              {
                //if the user chooses cancel, do nothing and close the alert popup
                text: 'Cancel',
                role: 'cancel',
                handler: () => {}
              },
              {
                text: 'Remove',
                handler: () => {
                    //mark the home as "deleted" and hide it from search queries
                    this.db.removeHome(home.id, home.postStatus);
                }
              }
            ]
        });
        alert.present();
    }

    /*this function is called when the user clicks the "edit" text below each home

    this function redirects the user to a page from which they can post a home,
    passing the selected home as a parameter, which can be accessed using navParams.get("draft")*/
    editHome(home){
        let modal = this.modalCtrl.create(ModalPage, {draft: home});
        modal.present();
    }

    /*this function is called when the user clicks the funnel icon above the listed homes

    this click event passes an event object to the function*/
    showFilterPopover(myEvent){

        /*Passing the current statusFilter so we can indicate to the user which filter is currently selected*/
        let popover = this.popoverCtrl.create(MypostsfilterPage, {currentFilter: this.statusFilter});
        popover.present({

            /*the on-screen location of where the click occured can be used
                              to display the popover in the right place*/
            ev : myEvent
        });

        /*when the popover is dismissed, it returns the selected value(from "All", "Published", "Edited" or "Removed")*/
        popover.onDidDismiss(data=>{
          if(data!=undefined && data.filter!=this.statusFilter){
              this.statusFilter=data.filter;

              /*reset the number of homes to display to 12.
              The infinitescroll component will increment this value*/
              this.last=12;

              if(data.filter=='all'){
                  this.visibleHomes=this.homes;
              }
              else{
                  /*For each object in me.homes add it to this.visibleHomes if and only if,
                  its post status matches the users filter*/
                  this.visibleHomes=this.homes.filter(home => home.postStatus==data.filter);
              }
          }
        });
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
