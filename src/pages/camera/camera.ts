import { Component } from '@angular/core';
import { ModalController, ViewController } from 'ionic-angular';
import { NavController } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { Geolocation } from '@ionic-native/geolocation';

@Component({
  selector: 'page-camera',
  templateUrl: 'camera.html'
})

export class CameraPage{
    images: Array<{src: String}>;
    coords: Array<{lng: number, lat: number}>;
    
    constructor(public navCtrl: NavController, private camera: Camera, private geolocation: Geolocation) {
        this.getLocation();
        this.images = [];
        this.coords = [];
        this.takePhoto();
    }

    takePhoto() {
        const options: CameraOptions = {
          quality: 80,
          destinationType: this.camera.DestinationType.DATA_URL,
          sourceType: this.camera.PictureSourceType.CAMERA,
          allowEdit: false,
          encodingType: this.camera.EncodingType.JPEG,
          saveToPhotoAlbum: false
        }
        this.camera.getPicture(options).then((imageData) => {
         // imageData is either a base64 encoded string or a file URI
         // If it's base64:
         let base64Image = 'data:image/jpeg;base64,' + imageData;
         this.images.unshift({
           src: base64Image
         })
        }, (err) => {
         // Handle error
        });
    }
    getLocation(){
        this.geolocation.getCurrentPosition().then((resp) => {
             this.coords = [
                {lng: resp.coords.longitude, lat: resp.coords.latitude}
             ];
        }).catch((error) => {
          console.log('Error getting location', error);
        });
    }
}