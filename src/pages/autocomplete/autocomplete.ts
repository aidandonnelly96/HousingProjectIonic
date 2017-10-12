import {Component, NgZone} from '@angular/core';
import {ViewController, NavController} from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { HTTP } from '@ionic-native/HTTP';

import { NativeGeocoder, NativeGeocoderReverseResult, NativeGeocoderForwardResult } from '@ionic-native/native-geocoder';


@Component({
  templateUrl: 'autocomplete.html'
})

export class AutocompletePage {
  autocompleteItems;
  autocomplete;

  latitude: number = 0;
  coords: Array<{lng: number, lat: number}>;
  longitude: number = 0;
  geo: any

  service = new google.maps.places.AutocompleteService();

  constructor (public viewCtrl: ViewController, private zone: NgZone, public navCtrl: NavController, private geolocation: Geolocation, private nativeGeocoder: NativeGeocoder) {
    this.getLocation();
    this.autocompleteItems = [];
    this.autocomplete = {
      query: ''
    };
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  chooseItem(item: any) {
    this.viewCtrl.dismiss(item);
  }

  updateSearch() {
    if (this.autocomplete.query == '') {
      this.autocompleteItems = [];
      return;
    }
    let me = this;
    this.service.getPlacePredictions({ input: this.autocomplete.query }, function (predictions, status) {
      me.autocompleteItems = []; 
      me.zone.run(function () { 
        predictions.forEach(function (prediction) {
          me.autocompleteItems.push(prediction.description);
        });
      });
    });
  }
 
 getLocation(){
        this.geolocation.getCurrentPosition().then((resp) => {
             this.coords = [
                {lng: resp.coords.longitude, lat: resp.coords.latitude}
             ];
             console.log(this.coords);
        }).catch((error) => {
          console.log('Error getting location', error);
        });
 }

 geoCode(place: any){
   this.nativeGeocoder.forwardGeocode(place)
                      .then((coordinates: NativeGeocoderForwardResult) => {
                        var returnItem: (any|any|any) = [place, coordinates.latitude, coordinates.longitude]
                        this.chooseItem(returnItem);
                      })
                      .catch((error: any) => console.log(error));
 }
 selectCurrentLocation(){
    this.nativeGeocoder.reverseGeocode(this.coords[0].lat, this.coords[0].lng)
                       .then((result: NativeGeocoderReverseResult) => {
                            console.log(result);
                            this.autocomplete.query=result.locality;
                            console.log(result.locality);
                            var returnItem: (any|any|any) = [result.locality, this.coords[0].lat, this.coords[0].lng];
                            this.chooseItem(returnItem);
                       })
                       .catch((error: any) => console.log(error));
 }
 closemodal(){
    this.viewCtrl.dismiss();
 }
}