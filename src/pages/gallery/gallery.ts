import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ToastController } from 'ionic-angular';
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

  images: Array<{lat: number, lng: number, url: any, id: any}>;
  grid: Array<Array<string>>; //array of arrays

  constructor(public navCtrl: NavController, public navParams: NavParams, public db: DatabaseProvider, public auth: AuthProvider, private camera: Camera, public alertCtrl: AlertController, public toastCtrl: ToastController) {
    this.images=[];
    this.getImagesForUser();
    this.grid = Array(Math.ceil(this.images.length/2));
  }

    getImagesForUser(){
        /*firebase database query to the path storing the current users gallery photos*/
        var imgQuery = firebase.database().ref('/userProfile/'+this.auth.getCurrentUser().uid+'/galleryPhotos/');
        var me = this;

        /*realtime database allows us to listen out for new additions at the path of the current users gallery photos,
        and we can update the list accordingly*/
        imgQuery.on("child_added", function(addSnap){
            me.images.push(addSnap.val());
        });

        /*realtime database allows us to listen out for removals at the path of the current users gallery photos,
        and we can update the list accordingly*/
        imgQuery.on("child_removed", function(removeSnap){
            me.images=me.images.filter(im => im.id!=removeSnap.val().id);
            console.log(me.images);
        });
    }

    /*this function is called when the user clicks the floating action button at the bottom right of the GalleryPage
    It allows users to take photos and store them in our database with the geocoordinates of where they were when the photo was taken

    This allows the user to save photos for later posting, without needing to remember where the photo was taken.*/
    takePhoto() {

        /*the ionic camera package allows for us to provide options for the format of the returned images, amongst other things.
        For example, the destinationType option can be FILE_URI, DATA_URL, or NATIVE_URI. I have chosen DATA_URL, which returns the image as a base-64 encoded string*/

        const options: CameraOptions = {
            quality : 95,
            destinationType : this.camera.DestinationType.DATA_URL,
            sourceType : this.camera.PictureSourceType.CAMERA,
            encodingType: this.camera.EncodingType.JPEG,
            saveToPhotoAlbum: false
        }
        var me=this;

        this.camera.getPicture(options).then((imageData) => {

            //retrieve an id for a new database element
            var newImageKey = firebase.database().ref().child('galleryPhotos').push().key;

            //reference to the path in the firebase storage provider
            var imageRef = firebase.storage().ref('images/' + newImageKey);
            var uploadTask = imageRef.putString(imageData, 'base64', {contentType: 'image/jpg'});
            uploadTask.on('state_changed', function(snapshot){
            }, function(error) {

            }, function() {
                    /*once the image has successfully been stored, push a new element to the current users 'galleryPhotos' field
                      The photo is stored with the users current location*/
                    imageRef.getDownloadURL().then(function(url){
                    firebase.database().ref('/userProfile/'+me.auth.getCurrentUser().uid+'/galleryPhotos/'+newImageKey).set({
                           lat: me.db.userLat,
                           lng: me.db.userLng,
                           url: url,
                           id: newImageKey
                    });
                });
            });
        }, (err) => {
            console.log("error: "+err);
        });

    }

    //this function is called when the users presses the floating action button displayed on each image,
    //the id of the desired image is passed as a parameter
    promptDelete(id){

        /*alertCtrl.create() allows us to define an alert popup before using it.
        In this case, we'd like the user to confirm that they wish to remove an image*/

        let alert = this.alertCtrl.create({
            title: 'Are you sure?',
            message: 'Are you sure you want to delete this photo?',
            buttons: [
              {
                text: 'Cancel',
                role: 'cancel',
                handler: () => {}
              },
              {
                text: 'Remove',
                handler: () => {
                    this.deletePhoto(id);
                }
              }
            ]
        });

        //display the alert popup with the options defined above
        alert.present();
    }

    //this function is called when the users confirms that they'd like to remove an image,
    //the id of the image to be deleted is passed as a parameter
    deletePhoto(id){
        var me=this;

        //firebase's .remove() returns a promise, once the promise is resolved we display a toast detailing the result

        firebase.database().ref('/userProfile/'+this.auth.getCurrentUser().uid+'/galleryPhotos/'+id).remove().then(function() {
            let toast = me.toastCtrl.create({
                message: 'Deleted successfully.',
                duration: 3000,
                position: 'bottom',
                showCloseButton: true,
                closeButtonText: "Ok"
              });

              toast.onDidDismiss(() => {
                console.log('Dismissed toast');
              });
              toast.present();
        }).catch(function(error) {
            let toast = me.toastCtrl.create({
                message: 'Failed to delete. Please try again.',
                duration: 3000,
                position: 'bottom',
                showCloseButton: true,
                closeButtonText: "Ok"
              });

              toast.onDidDismiss(() => {
                console.log('Dismissed toast');
              });

              toast.present();
        });
    }
}
