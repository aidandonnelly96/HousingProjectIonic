import { Component } from '@angular/core';
import { ViewController, IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import * as L from "leaflet";
import { DatabaseProvider } from '../../providers/database/database';
import { Geolocation } from '@ionic-native/geolocation';
import { NativeGeocoder, NativeGeocoderReverseResult } from '@ionic-native/native-geocoder';
import * as leafletPip from '@mapbox/leaflet-pip';

/**
 * Generated class for the LocationPickerPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-location-picker',
  templateUrl: 'location-picker.html',
})
export class LocationPickerPage {

  //leaflet map
  map: any;

  //location that the map is centred at
  center: L.PointTuple;
  marker: any;

  searchValue:string;
  fromValue:string;
  items;

  Ireland = L.geoJSON(JSON.parse('{"type": "Feature","geometry": {"type": "Polygon","coordinates": [[[-7.490091164398905,55.702709082851285],[-5.754251320648905,55.229381322226466],[-4.919290383148905,53.60591684014923],[-7.709817726898905,50.34586130340705],[-11.555032570648905,52.06638647507164],[-9.357766945648905,55.76456659391112],[-7.490091164398905,55.702709082851285]]]},"properties": {}}'));

  //the latlng the user has chosen
  lat: number;
  lng: number;
  constructor(public viewCtrl: ViewController, public navCtrl: NavController, public navParams: NavParams, public db: DatabaseProvider, public alertCtrl: AlertController, private geolocation: Geolocation, private nativeGeocoder: NativeGeocoder) {

    //this page is only accesible from the post page, which will pass the location to this page if it has been defined already
    if(navParams.get("location")!=''){

        //navParams.get() accepts a string parameter matching the name of a parameter, and retrieves that parameter
        this.fromValue=navParams.get("location");
        this.lat=navParams.get("lat");
        this.lng=navParams.get("lng");
    }
  }

  //this function is called when this page is loaded into view. Runs only once
  ionViewDidLoad() {
    if(this.map == undefined){
        this.initMap();
    }
  }

 initMap() {

    //initialize map, fitting it to the bounds of Ireland
    this.map = L.map("location-map").fitBounds([[55.38278555788504, -5.43278358141104],[51.420927438945206, -10.580171228085]]);
    L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    //add a marker to the map if the location already stores a value
    if(this.fromValue!=undefined){
        this.marker = L.marker([this.lat, this.lng]).addTo(this.map);
    }

    var me=this;

    //click event listener to add markers to the map on-click
    this.map.getContainer().addEventListener('click', function (event) {
            //click event passes an event, containing its location.

            //leaflet can use this event to convert its location on-screen to a geocoordinate
            var latlng = me.map.mouseEventToLatLng(event);

            //we only add the marker if it is within the Irish bounds
            //if((latlng.lat<55.38278555788504 && latlng.lng<-5.43278358141104) && (latlng.lat>51.420927438945206 && latlng.lng > -10.58017122808533)){
            if(leafletPip.pointInLayer([latlng.lng, latlng.lat], me.Ireland, true).length >0){
                //if a marker already exists, remove it
                if(me.marker!=undefined){
                    me.map.removeLayer(me.marker);
                }
                me.center=[latlng.lat, latlng.lng];

                //add a new marker to the map at the location the user clicked
                me.marker = L.marker([latlng.lat, latlng.lng]).addTo(me.map);


                //reverse geocode the coordinates of the marker to display the location to the user in a more user-friendly way
                me.nativeGeocoder.reverseGeocode(latlng.lat, latlng.lng)
                       .then((result: NativeGeocoderReverseResult) => {

                            //result.locality is more accurate, but not always defined, so we'll store that if its available
                            if(result.locality!=undefined){
                                me.fromValue=result.locality;
                            }

                            //otherwise, we'll store the subAdministrativeArea, which is less accurate but more reliable
                            else{
                                me.fromValue=result.subAdministrativeArea;
                            }
                       })
                       .catch((error: any) => console.log(error));
            }
            else{
              let alert = me.alertCtrl.create({
                title: 'Outside Ireland',
                subTitle: 'All submitted buildings must be in Ireland',
                buttons: ['Ok']
              });
              alert.present();
            }
    });
  }

  //this function is called when the user selects the floating action button in the bottom-right of the screen
  chooseLocation(){

    //only allow the user to choose a location if they have specified a location to choose
    if(this.center==undefined){
         let alert = this.alertCtrl.create({
            title: 'Choose a location',
            subTitle: 'You need to choose a location before continuing.',
            buttons: ['Ok']
          });
          alert.present();
    }
    else{
        //pop the current page, passing back the latlng of the chosen location, as well as its locality/subAdministrativeArea
        this.viewCtrl.dismiss({lat: this.center[0], lng: this.center[1], location: this.fromValue});
    }

  }

  ngOnInit(){

    var input_from = document.getElementById('journey_from').getElementsByTagName('input')[0];
    let self = this;
    let options = {
        types: [],
        componentRestrictions: { country: 'ie' }
    };

    //provide a searchbar to allow the user to search for locations manually
    let autocomplete1 = new google.maps.places.Autocomplete(input_from, options);

    //update the map and location when the user selects a location from the searchbar
    google.maps.event.addListener(autocomplete1, 'place_changed', function() {
        let place = autocomplete1.getPlace();
        console.log(place);
        let geometry = place.geometry;
        if ((geometry) !== undefined) {
            self.fromValue=place.name;
            self.center=[geometry.location.lat(), geometry.location.lng()];
            self.recenterMap(geometry.location.lat(), geometry.location.lng());
        }
    });
  }

  //lat,lng store the latlng of the location the user has selected
  recenterMap(lat, lng){

    //reset zoom and center of the map
    this.map.setView([lat, lng], 13);
    if(this.marker!=undefined){
        this.map.removeLayer(this.marker);
    }
    this.marker=L.marker([lat, lng]).addTo(this.map);
  }

  //this function stores the users current location
  useCurrentLocation(){
    console.log([this.db.userLng, this.db.userLat]);
    //if((this.db.userLat<55.38278555788504 && this.db.userLng<-5.43278358141104) && (this.db.userLat>51.420927438945206 && this.db.userLng > -10.58017122808533)){
    if(leafletPip.pointInLayer([this.db.userLng, this.db.userLat], this.Ireland, true).length >0){
        //if a marker already exists, remove it
        if(this.marker!=undefined){
            this.map.removeLayer(this.marker);
        }

        /*this.db.userLat/userLng stores the users current location.
        Begins reading once the user opens the app and updates live*/
        this.center=[this.db.userLat, this.db.userLng];

        var me=this;

        //reverse geocode the coordinates of the user's current location to display to the user in a more user-friendly way
        this.nativeGeocoder.reverseGeocode(this.db.userLat, this.db.userLng)
           .then((result: NativeGeocoderReverseResult) => {

                //result.locality is more accurate, but not always defined, so we'll store that if its available
                if(result.locality!=undefined){
                    me.fromValue=result.locality;
                }

                //otherwise, we'll store the subAdministrativeArea, which is less accurate but more reliable
                else{
                    me.fromValue=result.subAdministrativeArea;
                }
           })
           .catch((error: any) => console.log(error));

        //add a marker at the user's current location
        this.marker = L.marker(this.center).addTo(this.map);

        //recenter the map to the user's current location
        this.recenterMap(this.center[0], this.center[1]);
    }
    else{
          let alert = this.alertCtrl.create({
            title: 'Outside Ireland',
            subTitle: 'All submitted buildings must be in Ireland',
            buttons: ['Ok']
          });
          alert.present();
    }
  }

  //this function pops the current page without choosing the selected location
  goBack(){
    this.viewCtrl.dismiss();
  }
}
