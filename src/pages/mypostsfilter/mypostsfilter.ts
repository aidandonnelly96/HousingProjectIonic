import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

/**
 * Generated class for the MypostsfilterPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-mypostsfilter',
  templateUrl: 'mypostsfilter.html',
})
export class MypostsfilterPage {

  currentFilter
  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController) {
    /*retrieve the current status filter

    We need this as we wish to display a checkmark next to the option corresponding
    to the current filter to indicate that it is already selected*/
    this.currentFilter=navParams.get("currentFilter");
  }

  //this function is called as soon as the user selects an option, the option is stored in the filter parameter
  chooseFilter(filter){
    //close this view and pass the chosen filter back to the previous view
    this.viewCtrl.dismiss({filter: filter});
  }
}
