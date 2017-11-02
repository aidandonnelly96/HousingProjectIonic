import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, ViewController } from 'ionic-angular';
import { LocationSearchPage } from '../location-search/location-search'
import { AutocompletePage } from '../autocomplete/autocomplete';
import { DatabaseProvider } from '../../providers/database/database';
import {Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';


/**
 * Generated class for the FacetPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-facet',
  templateUrl: 'facet.html',
})
export class FacetPage {
    public search: FormGroup;
    address;
    searchValue:string;
    coords: Array<number>;
    fromValue:string;
    
    private distance;
  constructor(public navCtrl: NavController, public navParams: NavParams, public modalCtrl: ModalController, public viewCtrl: ViewController, public db: DatabaseProvider, private formBuilder: FormBuilder) {
    this.address = {
      place: ''
    };
    this.searchValue="";
    this.distance =0;
    this.search = new FormGroup({
       distance: new FormControl(),
       buildingType: new FormControl(),
       location: new FormControl(),
       status: new FormControl()
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad FacetPage');
  }
  
  closeFacet(){
    this.navCtrl.pop();
  }

  showAddressModal () {
    let modal = this.modalCtrl.create(AutocompletePage);
    modal.onDidDismiss(data => {
      console.log(data);
      if(data!=null){
          this.coords=[data[1], data[2]];
          this.address.place = data[0];
      }
    });
    modal.present();
  }
  applyFilter() {
       //console.log(this.search.value.distance);
     this.db.getRequestedHomes(Number(this.coords[0]), Number(this.coords[1]), parseInt(this.search.value.distance), this.search.value.buildingType, this.search.value.status);
     this.viewCtrl.dismiss();
  }
}
