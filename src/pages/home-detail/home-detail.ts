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
    public address: string;
    public type: string;
    public id: string;
    public info: string;
    public posted: string;
    public status: string;
    sources = [];

    constructor(public navCtrl: NavController, public navParams: NavParams, public popoverCtrl: PopoverController, private nativePageTransitions: NativePageTransitions, public db: DatabaseProvider) {
        this.sources = [];
        var home = navParams.get("home");
        this.title = home.title;
        this.id = home.id;
        this.type = home.buildingType;
        this.status = home.status;
        this.address = home.address;
        this.info = home.info;
        var timePosted = home.posted;
        var now= new Date().getTime();
        this.posted=this.msToTime(now-timePosted);
        this.getImageSourcesForThisHome();
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad HomeDetailPage');
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
    msToTime(s) {
      var ms = s % 1000;
      s = (s - ms) / 1000;
      var secs = s % 60;
      s = (s - secs) / 60;
      var mins = s % 60;
      var hrs = (s - mins) / 60;
      if(hrs==0 && mins==0)
          return 'just a moment ago';
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
