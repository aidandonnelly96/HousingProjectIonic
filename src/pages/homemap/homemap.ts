import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import * as L from "leaflet";

/**
 * Generated class for the HomemapPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-homemap',
  templateUrl: 'homemap.html',
})
export class HomemapPage {

  home: any;
  map: L.Map;
  center: L.PointTuple;

  timestamp;


  //this page displays a map containing a single marker representing a single home
  //this page is only accesible from the HomeDetailPage
  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.home=this.navParams.data;
    this.center = [this.home.lat, this.home.long];

    /*Each active leaflet map must have a unique ID
    We could use the home ID, however, if a user navigates to the homemap page of home1
    and then navigates to the View History page of home1 and selects home1 from the resulting list of homes,
    there will be two active maps with the same ID
    So instead, we set the map ID to the time at which the user opened the homemap page
    */
    this.timestamp = new Date().getTime().toString();
  }

  ionViewDidLoad() {
    if(this.map == undefined){
        this.initMap();
    }
  }

  initMap() {

    /*Leaflet map constructor requires the id of the html element where the map should be displayed,
        as well as a center and a zoom level, the default is 13*/
    var me = this;

    //find the HTML element with timestamp ID, and add a map to it
    this.map = L.map(me.timestamp, {
      center: [this.home.lat, this.home.long],
      zoom: 13
    });

    //Initialize the tiles as those provided by openstreetmap, and include an attribution, crediting OSM

    L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

     var icon;

    /*The following if-else statement allows for different coloured icons to be displayed depending on the given home's current status.

         If the home is 'suitable for tenants now', a blue icon will be displayed

         If the home has 'potential for renovation', an orange icon will be displayed

         And if the home is 'beyond renovation', a red icon will be displayed.

         This was achieved using the Leaflet.awesome-markers npm package which also accepts an icon name,
         in this case 'fa-home' from the FontAwesome library*/

     if(this.home.status=="Suitable for tenants now"){
        icon=L.AwesomeMarkers.icon({
            icon: 'fa-home',
            markerColor: 'blue'
        });
     }
     else if(this.home.status=="Potential for renovation"){
        icon=L.AwesomeMarkers.icon({
            icon: 'fa-home',
            markerColor: 'orange'
        });
     }
     else{
        icon=L.AwesomeMarkers.icon({
            icon: 'fa-home',
            markerColor: 'red'
        });
     }

    //add the marker, using the custom icon to the map
    L.marker([this.home.lat, this.home.long], {icon: icon}).addTo(this.map);
  }

}
