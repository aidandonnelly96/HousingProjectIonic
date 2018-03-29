import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
var st = require('geojson-bounds');

import firebase from 'firebase';

/**
 * Generated class for the SearchPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-search',
  templateUrl: 'search.html',
})
export class SearchPage {

 // places = ["Ireland", "Carlow", "Cavan", "Clare","Cork", "Donegal", "Dublin", "Galway", "Kerry", "Kildare", "Kilkenny", "Laois", "Leitrim", "Limerick", "Longford", "Louth", "Mayo", "Meath", "Monaghan", "Offaly", "Roscommon", "Sligo", "Tipperary", "Waterford", "Westmeath", "Wexford", "Wicklow"];
  places = ["Ireland", "County Antrim", "County Armagh", "County Carlow", "County Cavan", "County Clare", "County Cork",
  "County Derry", "County Donegal", "County Down", "County Dublin", "County Fermanagh", "County Galway", "County Kerry", "County Kildare",
  "County Kilkenny", "County Laois", "County Leitrim", "County Limerick", "County Longford", "County Louth", "County Mayo", "County Meath", "County Monaghan", "County Offaly",
  "County Roscommon", "County Sligo", "County Tipperary", "County Tyrone", "County Waterford", "County Westmeath", "County Wexford", "County Wicklow"];

  items: Array<{place:string, centre: any, distance: number}>;
  callback: any;
  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController) {
    this.callback=this.navParams.get("callback");
    this.items=[];
    this.initializeItems();
  }

  initializeItems() {

    this.items=[
    {place: "Ireland", centre: [-8.006477404748185, 53.40185649841513], distance: 361},
    {place: "County Antrim", centre: [-6.17847585, 54.895181949999994], distance: 75},
    {place: "County Armagh", centre: [-6.58445085, 54.30199795], distance: 50},
    {place: "County Carlow", centre: [-6.80644255, 52.690802649999995], distance: 45},
    {place: "County Cavan", centre: [-7.4100266, 54.0350485], distance: 85},
    {place: "County Clare", centre: [-9.11058835, 52.861686399999996], distance: 105},
    {place: "County Cork", centre: [-9.071809250000001, 51.88832675], distance: 155},
    {place: "County Derry", centre: [-6.9322363, 54.914262199999996], distance: 65},
    {place: "County Donegal", centre: [-7.87871755, 54.9471717], distance: 125},
    {place: "County Down", centre: [-5.9135942, 54.36100795], distance: 70},
    {place: "County Dublin", centre: [-6.2706979, 53.406488949999996], distance: 45},
    {place: "County Fermanagh", centre: [-7.659512749999999, 54.3619064], distance: 70},
    {place: "County Galway", centre: [-9.1410488, 53.3435224], distance: 140},
    {place: "County Kerry", centre:[-9.890311650000001, 52.1453984], distance: 105},
    {place: "County Kildare", centre:[-6.8144937500000005, 53.1543791], distance: 55},
    {place: "County Kilkenny", centre:[-7.2942787, 52.5684034], distance: 60},
    {place: "County Laois", centre: [-7.33319865, 52.99845905], distance: 55},
    {place: "County Leitrim", centre: [-8.005950200000001, 54.1401937], distance: 65},
    {place: "County Limerick", centre: [-8.760909, 52.5187222], distance: 75},
    {place: "County Longford", centre: [-7.7055483, 53.731949400000005], distance: 45},
    {place: "County Louth", centre: [-6.39932465, 53.9062749], distance: 45},
    {place: "County Mayo", centre: [-9.45269955, 53.9086671], distance: 115},
    {place: "County Meath", centre: [-6.7782639, 53.64977305], distance: 75},
    {place: "County Monaghan", centre: [-9.45269955, 53.9086671], distance: 55},
    {place: "County Offaly", centre: [-7.5307067, 53.13620305], distance: 75},
    {place: "County Roscommon", centre: [-8.3497832, 53.698287300000004], distance: 75},
    {place: "County Sligo", centre: [-8.64479375, 54.193002], distance: 65},
    {place: "County Tipperary", centre: [-7.926075450000001, 52.68480905], distance: 85},
    {place: "County Tyrone", centre: [-7.1637401999999994, 54.63537445], distance: 95},
    {place: "County Waterford", centre: [-7.5562831, 52.15086185], distance: 75},
    {place: "County Westmeath", centre: [-7.46386955, 53.55845635], distance: 65},
    {place: "County Wexford", centre: [-6.579250050000001, 52.45304505], distance: 65},
    {place: "County Wicklow", centre: [-6.394936899999999, 52.95819765], distance: 55}
  ];

    /*this.items=[];
    for(var i=0; i<this.places.length; i++){
        //var shape= { "type": "Polygon", "coordinates": [ this.gdp.data.get(this.places[i])] };

        var me = this;

        //var shape = this.gdp.gd.get(this.places[i]);

        var query = firebase.database().ref().child('/geoJSON/'+this.places[i]);
        query.once('value')
            .then(snap => {
                var xMax=st.xMax(snap.val());
                var xMin=st.xMin(snap.val());

                var yMax=st.yMax(snap.val());
                var yMin=st.yMin(snap.val());

                console.log("xmax:"+xMax);
                console.log("xmin:"+xMin);
                console.log("ymin:"+yMin);
                console.log("ymax:"+yMax);

                var xCenter=(xMax+xMin)/2;
                var yCenter=(yMax+yMin)/2;

                console.log("xCenter:"+xCenter);
                console.log("yCenter:"+yCenter);

                var distance = this.measure(xMax, yMax, xCenter, yCenter);
                me.items.push({place: snap.key, centre: [xCenter, yCenter], distance: Math.ceil(distance)});
                console.log({place: snap.key, centre: [xCenter, yCenter], distance: Math.ceil(distance)});
            });
    }*/
  }
  getItems(ev) {
    // Reset items back to all of the items
    this.initializeItems();

    // set val to the value of the ev target
    var val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.items = this.items.filter((item) => {
        return (item.place.toLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    }
  }
  selectItem(item){
    this.viewCtrl.dismiss(item);
  }
  measure(lat1, lon1, lat2, lon2){  // generally used geo measurement function
    var R = 6378.137; // Radius of earth in KM
    var dLat = lat2 * Math.PI / 180 - lat1 * Math.PI / 180;
    var dLon = lon2 * Math.PI / 180 - lon1 * Math.PI / 180;
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;
    return d; // meters
}
closemodal(){
    this.viewCtrl.dismiss();
}
}
