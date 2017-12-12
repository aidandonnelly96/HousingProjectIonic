import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { AuthProvider } from '../../providers/auth/auth';
import { Camera, CameraOptions } from '@ionic-native/camera';

import firebase from 'firebase';

/**
 * Generated class for the GalleryPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-gallery',
  templateUrl: 'gallery.html',
})
export class GalleryPage {

  images: Array<{lat: number, lng: number, url: any}>; 
  grid: Array<Array<string>>; //array of arrays

  constructor(public navCtrl: NavController, public navParams: NavParams, public db: DatabaseProvider, public auth: AuthProvider, private camera: Camera) {
    this.images=[];
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
        imgQuery.once('value')
             .then(parentSnap => {
                    parentSnap.forEach(function(snap)
                    {
                        me.images.push(snap.val());
                    })
        });
    
  }
  
    takePhoto() {
        const options: CameraOptions = {
            quality : 95,
            destinationType : this.camera.DestinationType.DATA_URL,
            sourceType : this.camera.PictureSourceType.CAMERA,
            encodingType: this.camera.EncodingType.JPEG,
            saveToPhotoAlbum: false
        }
        var me=this;
        
        this.camera.getPicture(options).then((imageData) => {
         // imageData is either a base64 encoded string or a file URI
         // If it's base64:
        var photos=[];


         let base64Image = 'data:image/jpeg;base64,' + imageData;
        
        var newImageKey = firebase.database().ref().child('galleryPhotos').push().key;
       console.log(newImageKey);
       var imageRef = firebase.storage().ref('images/' + newImageKey);
       var uploadTask = imageRef.putString(imageData, 'base64', {contentType: 'image/jpg'});
       uploadTask.on('state_changed', function(snapshot){
        }, function(error) {

        }, function() {
                imageRef.getDownloadURL().then(function(url){
                firebase.database().ref('/userProfile/'+me.auth.getCurrentUser().uid+'/galleryPhotos/'+newImageKey).set({
                       lat: me.db.userLat,
                       lng: me.db.userLng,
                       url: url
                });
                me.images.push({
                       lat: me.db.userLat,
                       lng: me.db.userLng,
                       url: url
                })
            });
        });
    }, (err) => {
         // Handle error
        });
    
    }
}
