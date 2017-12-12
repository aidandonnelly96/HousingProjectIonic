import { Component } from '@angular/core';
import { ModalController, ViewController, IonicPage, NavController, NavParams } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
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

    constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController, public db: DatabaseProvider, public modalCtrl: ModalController) {
        this.home=navParams.get("home");
        this.id=navParams.get("id");
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad HomeDetailPopoverPage');
    }
    viewHistory(){
        this.navCtrl.push(HistoryPage, {id: this.id});
    }
    editHome(){
        let modal = this.modalCtrl.create(ModalPage, {draft: this.home});
        modal.present();
    }

}
