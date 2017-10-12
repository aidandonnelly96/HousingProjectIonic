import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';


/**
 * Generated class for the LocationSearchPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-location-search',
  templateUrl: 'location-search.html',
})
export class LocationSearchPage {
  searchValue:string;
  fromValue:string;
  items;

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController) {
    this.searchValue="";
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LocationSearchPage');
  }

 ngOnInit(){

// get the two fields
    var input_from = document.getElementById('journey_from').getElementsByTagName('input')[0];

// set the options
    let options = {
        types: []
    };

// create the two autocompletes on the from and to fields
    let autocomplete1 = new google.maps.places.Autocomplete(input_from, options);


// we need to save a reference to this as we lose it in the callbacks
    let self = this;

    // add the first listener
    google.maps.event.addListener(autocomplete1, 'place_changed', function() {

        let place = autocomplete1.getPlace();
        let geometry = place.geometry;
        if ((geometry) !== undefined) {

            console.log(place.name);

            console.log(geometry.location.lng());

            console.log(geometry.location.lat());
            
            console.log(place.types);
        }
    });
  }
}