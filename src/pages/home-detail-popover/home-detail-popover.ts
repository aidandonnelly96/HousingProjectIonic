import { Component } from '@angular/core';
import { AlertController, ModalController, ViewController, IonicPage, NavController, NavParams, App } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { AuthProvider } from '../../providers/auth/auth';
import { ModalPage } from '../modal/modal';
import { HistoryPage } from '../history/history';

/**
 * Generated class for the HomeDetailPopoverPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-home-detail-popover',
  templateUrl: 'home-detail-popover.html',
})
export class HomeDetailPopoverPage {

    home: any;
    id: any;

    /*this page acts as a popover, and displays a list of options relating to a home. Options are as follows
        View History: As any user can edit any home, we've decided to store the history of each home, ie. how the home changed over time. This feature will help us to resolve controversial homes, ie. those that are edited back and forth a number of times by different users

        Remove: Mark the home as 'deleted', this will hide it from search query results

        Revert: If a home has been edited, a user can choose to revert back to their desired version

        Put back: If a home has been deleted, a user can choose to put it back*/

    constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController, public db: DatabaseProvider, public modalCtrl: ModalController, public appCtrl: App, public alertCtrl: AlertController, public auth: AuthProvider ) {

        //This page is only used in the HomeDetailPage, which passes the desired home as a parameter to this page. navParams.get() retrieves that parameter
        this.home=navParams.get("home");

        //once we've retrieved the home parameter, we can retrieve its id, which will be used by the options detailed above
        this.id=this.home.id;
    }

    /*As any user can edit any home, we've decided to store the history of each home, ie. how the home changed over time. This feature will help us to resolve controversial homes, ie. those that are edited back and forth a number of times by different users*/
    viewHistory(){

        //hide the popover
        this.viewCtrl.dismiss();

        /*getRootNav, returns the component at the root of the current navigation stack. In this case, thats the HomeDetailPage
        calling push() from the HomeDetailPage means that when the user chooses to pop a page from the HistoryPage, they will be redirected to the HomeDetailPage
        We pass the id of the current home as a parameter to the HistoryPage*/
        this.appCtrl.getRootNav().push(HistoryPage, {id: this.id});
    }

    /*Open the post modal, with the desired home as a parameter.
    This parameter can then be accessed using the Ionic NavParams package

    the home parameter stores the home the user is editing, along with all child attributes*/
    editHome(home){
        //hide the popover
        this.viewCtrl.dismiss();

        //display the post page as a modal, passing the current home as a parameter
        let modal = this.modalCtrl.create(ModalPage, {draft: home});
        modal.present();
    }

    /*This function will be called when the user selects the 'revert' option in the popover.
    This option will only be display if the current homes post status is 'edited'

    h stores the version of the home that the user is reverting to*/
    revert(h){
        /*If a home that has been bookmarked by a user has been edited, the user can choose to revert to their bookmarked version,
        if they believe it was incorrectly edited*/

        this.viewCtrl.dismiss();
        this.db.revert(h);
    }

    /*This function will be called when the user selects the 'put back' option in the popover.
    This option will only be display if the current homes post status is 'deleted'

    home stores the home that the user is putting back*/
    putBack(home){
        /*If a home has been deleted, the user can choose to put it back,
        if they believe it was incorrectly deleted*/

        this.db.putBack(home);
    }


    /*This function will be called when the user selects the 'remove' option in the popover. This option will only be display if the current homes post status is 'published'
    Mark this home as removed, this will hide it from the search queries, however,
    users that have bookmarked the home and the homes original contributer can still view it*/
    removeHome(home){
        this.viewCtrl.dismiss();
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
                    //mark the home as 'deleted'
                    this.db.removeHome(home.id, home.postStatus);
                }
              }
            ]
        });

        //display the alert popup
        alert.present();
    }

}
