import { Component } from '@angular/core';
import { ViewController, IonicPage, NavController, NavParams } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { AuthProvider } from '../../providers/auth/auth';
import { Camera, CameraOptions } from '@ionic-native/camera';

import firebase from 'firebase';

/**
 * Generated class for the ImagePickerPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-image-picker',
  templateUrl: 'image-picker.html',
})
export class ImagePickerPage {

  images: Array<{lat: number, lng: number, url: any, selected: boolean, index: number}>; 
  chosenImages: Array<{lat: number, lng: number, url: any, selected: boolean}>; 
  grid: Array<Array<string>>; //array of arrays

  constructor(public navCtrl: NavController, public navParams: NavParams, public db: DatabaseProvider, public auth: AuthProvider, private camera: Camera, public viewCtrl: ViewController) {
    this.images=[];
    this.chosenImages=[];
    this.getImagesForUser();
    this.grid = Array(Math.ceil(this.images.length/2));
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad GalleryPage');
  }

  getImagesForUser(){
        console.log("getting");
        var images=[];
        var imgQuery = firebase.database().ref('/userProfile/'+this.auth.getCurrentUser().uid+'/galleryPhotos');
        var me = this;
        var i=0;
        imgQuery.once('value')
             .then(parentSnap => {
                    parentSnap.forEach(function(snap)
                    {
                        console.log(snap.val());
                        me.images.push({
                            lat: snap.val().lat,
                            lng: snap.val().lng,
                            url: snap.val().url,
                            selected: false,
                            index: i
                        });
                        i=i+1;
                    })
        });
    
  }
  addPhoto(image){
    this.images[image.index].selected=true;
  }
  
  removePhoto(image){
      this.images[image.index].selected=false;
  }
  
  choosePhotos(){
    this.viewCtrl.dismiss(this.images);
  }
  closeWindow(){
    this.viewCtrl.dismiss();
  }
}
