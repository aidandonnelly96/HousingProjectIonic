import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';
import { DatabaseProvider } from '../../providers/database/database';
import firebase from 'firebase';

/**
 * Generated class for the InfoPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-info',
  templateUrl: 'info.html',
})
export class InfoPage {
    public home: any;
    public title: string;
    public address: string;
    public type: string;
    public id: string;
    public info: string;
    public status: string;
    public garden: string;
    public plumbing: string;
    public roof: string;
    public windows: string;
    public rooms: string;
    public estTime: string;
    public estSize: string;
    public electricity: string;
    public furniture: string;
    public relation: string;
    public posted: string;
    bookmarked = false;

  constructor(public navCtrl: NavController, public navParams: NavParams, public auth: AuthProvider, public db: DatabaseProvider, public toastCtrl: ToastController) {
        this.home=navParams.data;  

        /*If the current user is logged in, we listen to updates in the user's bookmarked homes and update the view accordingly
        As the user bookmarks/un-bookmarks the home, we update bookmark icon*/
        if(this.auth.getCurrentUser()!=undefined){
            var bookmarkQuery=firebase.database().ref().child('/userProfile/'+this.auth.getCurrentUser().uid+'/favourites/'+this.home.id);
            var me=this;
            bookmarkQuery.on("child_added", function(addSnap){
                if(addSnap.val()==me.home.id){
                        me.bookmarked=true;
                }
            });
            bookmarkQuery.on("child_removed", function(removeSnap){
                if(removeSnap.val()==me.home.id){
                        me.bookmarked=false;
                }
            });
        }
        this.title = this.home.title;
        this.address = this.home.address; 
        this.status = this.home.status;
        this.type = this.home.buildingType;
        this.estSize = this.home.EstPropertySize;
        this.estTime = this.home.timeLeftVacant;
        this.electricity = this.home.electricity;
        this.plumbing = this.home.plumbing;
        this.windows = this.home.windows;
        this.roof = this.home.roof;
        this.garden = this.home.garden;
        this.furniture = this.home.furniture;
        this.rooms = this.home.rooms;
        this.relation = this.home.usersRelation;
        this.info = this.home.info;
        this.id = this.home.id;

        var timePosted = this.home.posted;
        var now=new Date().getTime();
        this.posted=this.msToTime(now-timePosted);
    }

    //convert the unix timestamp on the current home to a time
    msToTime(s) {
        var ms = s % 1000;
        s = (s - ms) / 1000;
        var secs = s % 60;
        s = (s - secs) / 60;
        var mins = s % 60;
        var hrs = (s - mins) / 60;
        if(hrs==0 && mins==0)
          return 'Just a moment ago';
        else if(hrs==0 && mins==1){
          return mins+' minute ago';
        }
        else if(hrs==0)
          return mins+' minutes ago';
        else if(hrs==1){
          return hrs+' hour ago';
        }
        else if(hrs<24){
          return hrs+' hours ago';
        }
        else if(hrs<48){
          return '1 day ago';
        }
        else{
          return Math.floor(hrs/24)+' days ago';
        }
    }
    
    //If a home has been removed, the user can choose to put it back, if they believe it was incorrectly removed
    putBack(){
        this.home.postStatus="published";
        this.db.putBack(this.home);
    }
    
    //If a home has been edited, the user can choose to revert to their desired version, if they believe it was incorrectly edited
    revert(){
        this.home.postStatus="published";
        this.db.revert(this.home);
    }
    
    //this function handles both bookmarking and un-bookmarking the home
    toggleBookmarked(){
        
        //if the home is already bookmarked, we'd like to un-bookmark it
        if(this.bookmarked){
            
            //firebase query to remove this home from the current user's list of bookmarked homes 
            firebase.database().ref().child('/userProfile/'+this.auth.getCurrentUser().uid+'/favourites/'+this.home.id).remove();
            
            //mark the home as bookmarked locally
            this.bookmarked=false;
            
            //display a toast to indicate the home has been un-bookmarked
            let toast = this.toastCtrl.create({
                message: 'Home removed from bookmarks.',
                duration: 3000,
                position: 'bottom',
                showCloseButton: true,
                closeButtonText: "Ok"
              });

              toast.onDidDismiss(() => {
                console.log('Dismissed toast');
              });

              toast.present();
        }
        
        //otherwise we'd like to bookmark it
        else{
        
            //firebase query to add this home to the current user's list of bookmarked homes 
            firebase.database().ref().child('/userProfile/'+this.auth.getCurrentUser().uid+'/favourites/'+this.home.id).set({homeID: this.home.id});
            
            //mark the home as bookmarked locally
            this.bookmarked=true;
            
            //display a toast to indicate the home has been bookmarked
            let toast = this.toastCtrl.create({
                message: 'Home bookmarked.',
                duration: 3000,
                position: 'bottom',
                showCloseButton: true,
                closeButtonText: "Ok"
              });

              toast.onDidDismiss(() => {
                console.log('Dismissed toast');
              });

              toast.present();
        }
    }
}
