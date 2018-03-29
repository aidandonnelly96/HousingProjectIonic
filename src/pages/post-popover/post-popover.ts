import { Component } from '@angular/core';
import { App, IonicPage, NavController, NavParams, ViewController, ModalController } from 'ionic-angular';
import { DraftsPage } from '../drafts/drafts';

/**
 * Generated class for the PostPopoverPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-post-popover',
  templateUrl: 'post-popover.html',
})
export class PostPopoverPage {

  modalThis: any;

  constructor(public appCtrl: App, public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController, public modalCtrl: ModalController) {

    /*If the user chooses a draft to edit we'll close the first post page
      as it wouldn't make sense to redirect them to the post page directly after submitting a home

      Passing the context of the first post page allows us to access its viewController,
      and to close the window once the user selects a draft to edit*/
    this.modalThis=navParams.get("modalThis");
  }

  chooseFromDrafts(){
    //hide this window
    this.viewCtrl.dismiss();

    /*We pass the context of the original post page to the drafts page,
      once the user selects a dradt to edit, we'll use that context to close the window*/
    let modal=this.modalCtrl.create(DraftsPage, {modalThis: this.modalThis});
    modal.present();
  }

}
