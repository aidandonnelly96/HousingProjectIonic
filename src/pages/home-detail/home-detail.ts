import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { PopoverController, ViewController, ModalController } from 'ionic-angular';
import { NativePageTransitions, NativeTransitionOptions } from '@ionic-native/native-page-transitions';
import { DatabaseProvider } from '../../providers/database/database';
import { HistoryPage } from '../history/history';
import { HomeDetailPopoverPage } from '../home-detail-popover/home-detail-popover';
import { ModalPage } from '../modal/modal';

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
    sources = [];

    constructor(public navCtrl: NavController, public navParams: NavParams, public popoverCtrl: PopoverController, private nativePageTransitions: NativePageTransitions, public db: DatabaseProvider) {
        this.sources = [];
        this.home = navParams.get("home");
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
        var now= new Date().getTime();
        this.posted=this.msToTime(now-timePosted);
        this.getImageSourcesForThisHome();
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad HomeDetailPage');
    }
     
    getImageSourcesForThisHome(){
        var imageSources = [];
        var query=firebase.database().ref('/homes/'+this.id+'/images/');
        var me=this;
        query.once('value')
            .then(homeSnap => {
                homeSnap.forEach(function(snap)
                    {
                        me.sources.push(snap.val().url); 
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
        let popover = this.popoverCtrl.create(HomeDetailPopoverPage, {
            id: this.id,
            home: this.home
        });
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
