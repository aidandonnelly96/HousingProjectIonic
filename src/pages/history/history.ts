import { Component } from '@angular/core';
import { App, IonicPage, NavController, NavParams, AlertController, ModalController } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { AuthProvider } from '../../providers/auth/auth';
import { HomeDetailPage } from '../home-detail/home-detail';
import { ModalPage } from '../modal/modal';

/**
 * Generated class for the HistoryPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-history',
  templateUrl: 'history.html',
})
export class HistoryPage {
  homes=[];
  private id: string;

    constructor(public navCtrl: NavController, public navParams: NavParams, public db: DatabaseProvider,  public appCtrl: App, public auth: AuthProvider, public alertCtrl: AlertController, public modalCtrl: ModalController) {

        //When the user selects 'View History', the home-detail Popover redirects to the HistoryPage, passing the id of the desired home as a parameter
        //navParams.get() retrieves that parameter
        this.id = navParams.get("id");

        //once we've retrieved the home id, we can retrieve its predecessors
        this.homes=(this.db.getHistoryForHome(this.id));
    }


    /*this function is called when the user selects a home

    h stores the home which the user has requested a detailed view of,
    including all of its child attributes

    We pass h to the HomeDetailPage, which can use navParams.get("home") to retrieve it
    It can then display all of the child attributes stored on that home*/
    goToHomeDetail(h) {

        //Redirect from the tabs page to the HomeDetailPage of a given home, passing that home as a parameter.
        this.navCtrl.push(HomeDetailPage, {
            home: h
        });
    }

    //If a home has been removed, the user can choose to put it back, if they believe it was incorrectly removed
    //h stores the home that the current user would like to put back, along with its child attributes
    putBack(h){
        this.db.putBack(h);
    }

    //If a home has been edited, the user can choose to revert to that version, if they believe it was incorrectly edited
    //h stores the version of the home that the user would like to revert to
    revert(h){
        this.db.revert(h);
    }


    //this function is called when the users presses the 'remove' button below a home
    //the id of the corresponding home is passed as a parameter
    removeHome(home){


        /*alertCtrl.create() allows us to define an alert popup before using it.
        In this case, we'd like the user to confirm that they wish to remove a home*/

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

                    //mark a home as 'deleted' in the firebase database
                    this.db.removeHome(home.id, home.postStatus);
                }
              }
            ]
        });

        //display the alert popup
        alert.present();
    }

    //this function is called when the users presses the 'edit' button below a home
    //the corresponding home is passed as a parameter
    editHome(home){

        //display the post page, passing the desired home as a parameter.
        let modal = this.modalCtrl.create(ModalPage, {draft: home});
        modal.present();
    }
}
