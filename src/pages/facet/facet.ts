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
    private size;
    
  constructor(public navCtrl: NavController, public navParams: NavParams, public modalCtrl: ModalController, public viewCtrl: ViewController, public db: DatabaseProvider, private formBuilder: FormBuilder) {
    this.address = {
      place: ''
    };
    this.searchValue="";
    this.distance =1;
    this.size = { lower: 500,
                 upper: 10000 };
    this.search = this.formBuilder.group({
        distance: [''],
        buildingType: ['Any'],
        location: [''],
        status: ['Any'],
        info: ['Any'],
        size: [''],
        time: ['Any'],
        room: ['Any'],
        windows: ['Any'],
        rooms: ['Any'],
        furniture: ['Any'],
        electricity: ['Any'],
        plumbing: ['Any'],
        roof: ['Any'],
        garden: ['Any'],
        user: ['Any']
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
     this.db.getRequestedHomes(Number(this.coords[0]), Number(this.coords[1]), parseInt(this.search.value.distance), this.search.value.size.lower, this.search.value.size.upper,  this.search.value.status, this.search.value.time, this.search.value.buildingType, this.search.value.electricity, this.search.value.plumbing, this.search.value.furniture, this.search.value.rooms, this.search.value.roof, this.search.value.garden, this.search.value.windows);
     this.viewCtrl.dismiss();
  }
}
