import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { PopoverController, ViewController } from 'ionic-angular';
import { NativePageTransitions, NativeTransitionOptions } from '@ionic-native/native-page-transitions';
import { DatabaseProvider } from '../../providers/database/database';

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
    
    public title: string;
    public id: string;
    public status: string;
    sources = [];

    constructor(public navCtrl: NavController, public navParams: NavParams, public popoverCtrl: PopoverController, private nativePageTransitions: NativePageTransitions, public db: DatabaseProvider) {
        this.sources = [];
        this.title = navParams.get("title");
        this.id = navParams.get("id");
        this.status = navParams.get("status");
        this.getImageSourcesForThisHome();
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad HomeDetailPage');
    }
    
    ionViewWillLeave() {

         let options: NativeTransitionOptions = {
            direction: 'left',
            duration: 500,
            //slidePixels: 20,
            iosdelay: 100,
            androiddelay: 150,
            fixedPixelsTop: 0,
            fixedPixelsBottom: 55
           };

         this.nativePageTransitions.slide(options);
           //.then(onSuccess)
           //.catch(onError);

    }
    
    getImageSourcesForThisHome(){
        var imageSources = [];
        var query = firebase.database().ref('/images');
        var me = this;
        query.once('value')
             .then(parentSnap => {
                    parentSnap.forEach(function(snap)
                    {
                        console.log(snap.val().url);
                        console.log(snap.val().forHome)
                        console.log(me.id)
                        if(snap.val().forHome==me.id){
                            me.sources.push(snap.val().url);
                        }
                    })
        });
    }
    
    presentPopover(myEvent) {
        let popover = this.popoverCtrl.create(HomeDetailPopover);
        popover.present({
          ev : {
              target : {
                getBoundingClientRect : () => {
                  return {
                    top: '15',
                    left: '1000'
                  };
                }
              }
            }
        });
    }
}

@Component({
  template: `
  <ion-content style="height: 20%" class="custom-popover">
    <ion-list>
      <button ion-item (click)="close()">Report</button>
      <button ion-item (click)="close()">Edit</button>
    </ion-list>
    </ion-content>
  `
})
export class HomeDetailPopover {
  constructor(public viewCtrl: ViewController) {}

  close() {
    this.viewCtrl.dismiss();
  }
}
