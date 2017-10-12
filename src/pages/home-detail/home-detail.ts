import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

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
    public status: string;
    public source: string;

    constructor(public navCtrl: NavController, public navParams: NavParams) {
        this.title = navParams.get("title");
        this.source = navParams.get("src");
        this.status = navParams.get("status");
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad HomeDetailPage');
    }

}
