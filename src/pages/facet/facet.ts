import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, ViewController } from 'ionic-angular';
import { SearchPage } from '../search/search';
import { DatabaseProvider } from '../../providers/database/database';
import {Validators, FormBuilder, FormGroup } from '@angular/forms';


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
    useCurrentLocation=false;
    coords: Array<number>;
    fromValue:string;

    private distance;
    private size;


  constructor(public navCtrl: NavController, public navParams: NavParams, public modalCtrl: ModalController, public viewCtrl: ViewController, public db: DatabaseProvider, private formBuilder: FormBuilder) {
    /*this.db.place stores the location of the most recently executed search, ie. 'Ireland' when the user executes a national search
    If this.db.place is defined, we know that this is not the first search, and we should populate the form with the rest of the metadata of the previous search. A clear button is displayed at the top right of the page to allow the user to remove all metadata from the search form and populate the defaults*/
    if(this.db.place!=undefined){
        this.address=this.db.place;
        this.coords=[this.db.currentLong, this.db.currentLat];
        this.distance =this.db.radius;
        this.size = { lower: this.db.lower,
                     upper: this.db.upper };
        this.search = this.formBuilder.group({
            buildingType: [this.db.buildingType],
            location: [this.db.place, Validators.compose([Validators.required])],
            status: [this.db.status],
            size: [''],
            time: [this.db.time],
            windows: [this.db.windows],
            rooms: [this.db.rooms],
            furniture: [this.db.furniture],
            electricity: [this.db.electricity],
            plumbing: [this.db.plumbing],
            roof: [this.db.roof],
            garden: [this.db.garden],
            user: ['Any']
        });
    }

    //otherwise, just populate the defaults
    else{
        this.address='';
        this.distance =1;
        this.size = { lower: 500,
                     upper: 10000 };
        this.search = this.formBuilder.group({
            distance: [''],
            buildingType: ['Any'],
            location: ['', Validators.compose([Validators.required])],
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
  }

  closeFacet(){
    //navCtrl controls the navigation. pop() pops a page from the navigation stack and redirects to the previous page
    this.navCtrl.pop();
  }

  //Open a new page where the user can select their desired location
  showAddressModal () {
    var me=this;
    let modal = this.modalCtrl.create(SearchPage);

    /*The SearchPage passes data back to the facet page, detailing the coordinates of the centre of the desired location, the locations name, and the distance to the furthest point in that location that we should search to, ie. the radius in the database's search query*/
    modal.onDidDismiss(data => {
      if(data!=null){
         me.coords=data.centre;
         me.address= data.place;
         me.distance=data.distance;
      }
    });
    modal.present();
  }

  applyFilter(){
    //close facet page
    this.navCtrl.pop();

    //execute database provider function that retrieves the desired homes
    this.db.getHomes(this.address, Number(this.coords[1]), Number(this.coords[0]), this.distance, this.search.value.size.lower, this.search.value.size.upper,  this.search.value.status, this.search.value.time, this.search.value.buildingType, this.search.value.electricity, this.search.value.plumbing, this.search.value.furniture, this.search.value.rooms, this.search.value.roof, this.search.value.garden, this.search.value.windows);
  }

  /*When the user opens the search facet page, the form will store the query metadata of the most recently executed search.
  Clicking the 'clear' button will execute this function, which resets all elements in the form to their default values*/
  clearFacet(){
        this.address="";
        this.coords=[0, 0];
        this.distance =0;
        this.size = { lower: 15,
                     upper: 500 };
        this.search = this.formBuilder.group({
            distance: [''],
            buildingType: ['Any'],
            location: ['', Validators.compose([Validators.required])],
            cl: [''],
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
}
