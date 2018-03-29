import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides} from 'ionic-angular';

/**
 * Generated class for the FullscreenPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-fullscreen',
  templateUrl: 'fullscreen.html',
})
export class FullscreenPage {

  @ViewChild(Slides) slides: Slides;
  sources=[];
  currentIndex: number;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    //image sources are passed from the HomeDetailPage
    this.sources=navParams.get("sources");
  }

  /*ionViewDidLoad is an Ionic event that fires once the page has loaded*/
  ionViewDidLoad() {
    //the index of the selected image is also passed so we can start at that index in the list of sources
    this.slides.initialSlide= this.navParams.get("currentIndex");
  }

  backToDetail(){
    //pop one page from the navigation stack, returning to the previous page, in this case it w
    this.navCtrl.pop();
  }
}
