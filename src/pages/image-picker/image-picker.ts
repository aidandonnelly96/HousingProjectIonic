import { Component } from '@angular/core';
import { ViewController, IonicPage, NavController, NavParams } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { AuthProvider } from '../../providers/auth/auth';

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

  //All of the current users gallery photos
  images: Array<{lat: number, lng: number, url: any, selected: boolean}>;

  //the images that the user has selected
  chosenImages: Array<{lat: number, lng: number, url: any, selected: boolean}>;
  grid: Array<Array<string>>; //array of arrays

  constructor(public navCtrl: NavController, public navParams: NavParams, public db: DatabaseProvider, public auth: AuthProvider, public viewCtrl: ViewController) {
    this.images=[];
    this.chosenImages=[];
    this.getImagesForUser();
    this.grid = Array(Math.ceil(this.images.length/2));
  }

  getImagesForUser(){
        //firebase database query to the path storing current user's gallery photos, store each once in this.images
        var imgQuery = firebase.database().ref('/userProfile/'+this.auth.getCurrentUser().uid+'/galleryPhotos');
        var me = this;
        imgQuery.once('value')
             .then(parentSnap => {
                    parentSnap.forEach(function(snap)
                    {
                        me.images.push({
                            lat: snap.val().lat,
                            lng: snap.val().lng,
                            url: snap.val().url,
                            selected: false,
                        });
                    })
        });

  }

  //image stores the image that the user is selecting
  addPhoto(image){
    //mark the desired image as selected
    image.selected=true;
  }

  //image stores the image that the user is de-selecting
  removePhoto(image){
      //un-mark the desired image as selected
      image.selected=false;
  }

  choosePhotos(){
    //this function closes the current window AND returns the images that have been selected
    this.viewCtrl.dismiss(this.images.filter(image => image.selected==true));
  }

  closeWindow(){
    //this function closes the current window without choosing the images that have been selected
    this.viewCtrl.dismiss();
  }
}
