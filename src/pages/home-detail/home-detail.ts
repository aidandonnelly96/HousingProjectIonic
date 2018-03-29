import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { PopoverController, Slides } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { AuthProvider } from '../../providers/auth/auth';
import { FullscreenPage } from '../fullscreen/fullscreen';
import { HomeDetailPopoverPage } from '../home-detail-popover/home-detail-popover';
import { HomemapPage } from '../homemap/homemap';
import { InfoPage } from '../info/info';

import firebase from 'firebase';

/**
 * Generated class for the HomeDetailPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-home-detail',
  templateUrl: 'home-detail.html',
})
export class HomeDetailPage {

    @ViewChild(Slides) slides: Slides;

    //the home that is currently in view
    public home: any;

    //the images stored with the current home
    sources=[];

    //we hide the tabbed interface until the home has loaded,
    //this variable tells us when the home has finished loading
    loaded=false;
    deleted=false;

    /*this page contains a tabbed view below a sliding image gallery

    the tabs are defined here*/
    tab1Root: any = HomemapPage;
    tabRootMap: any = InfoPage;

    constructor(public navCtrl: NavController, public navParams: NavParams, public popoverCtrl: PopoverController, public db: DatabaseProvider, public auth: AuthProvider, private toastCtrl: ToastController) {

        /*when a user selects a home from the map view or list view, the selected home is passed as a parameter to this page
        navParams.get() retrieves that parameter, we then store it in this.home and use the id to retrieve the corresponding images*/
        this.home = navParams.get("home");
        this.getImageSourcesForThisHome();
        this.loaded=true;
    }

    getImageSourcesForThisHome(){
        //firebase database query following the path to the images corresponding to this home
        var query=firebase.database().ref('/homes/'+this.home.id+'/images/');
        var me=this;
        query.once('value')
            .then(homeSnap => {
                homeSnap.forEach(function(snap)
                    {
                        me.sources.push(snap.val().url);
                    })
            });
    }

    /*this popover displays a list of options for the user to interact with this home: Put Back, Revert, Edit, View History and Remove
    when the user chooses to present the popoever, the click event is passed to this function*/
    presentPopover(myEvent) {

        //create the popover, passing the current home as a parameter
        let popover = this.popoverCtrl.create(HomeDetailPopoverPage, {
            home: this.home
        });

        //display the popover, passing the click event as a parameter, which the PopoverController will use to determine its location on the screen
        popover.present({
            ev : myEvent
        });
    }


    //opens a full screen view of the images for this home
    goToFullScreen(){

        var me=this;

        //push a new page(FullscreenPage) to the navigation stack,
        //passing the image sources and the index of the image that is current in view
        this.navCtrl.push(FullscreenPage, {
            sources: me.sources,
            currentIndex: this.slides.getActiveIndex()
        });
    }
}
