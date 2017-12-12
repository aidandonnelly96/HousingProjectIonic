import { Component, ViewChild } from '@angular/core';
import { Nav, App, IonicPage, NavController, NavParams } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { HomeDetailPage } from '../home-detail/home-detail';

import firebase from 'firebase';

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
  
    constructor(public navCtrl: NavController, public navParams: NavParams, public db: DatabaseProvider,  public appCtrl: App) {
        this.id = navParams.get("id");
        this.homes=this.db.getHistoryForHome(this.id);
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad HistoryPage');
    }

    goToHomeDetail(h) {
        this.navCtrl.push(HomeDetailPage, {
            home: h
        });
    }

}
