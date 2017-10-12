import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, ViewController, ActionSheetController, Nav} from 'ionic-angular';
import { CameraPage } from '../camera/camera'
import { Camera, CameraOptions } from '@ionic-native/camera';
import { Geolocation } from '@ionic-native/geolocation';

/*
  Generated class for the Modal page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
  
*/
@Component({
  selector: 'page-modal',
  templateUrl: 'modal.html'
})
export class ModalPage {

  images: Array<{src: String}>;
  coords: Array<{lng: number, lat: number}>;

  @ViewChild(Nav) nav: Nav;

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController, public actionSheetCtrl: ActionSheetController, private camera: Camera, private geolocation: Geolocation) {
        this.getLocation();
        this.images = [];
        this.coords = [];
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ModalPage');
  }

  closemodal() {
    this.viewCtrl.dismiss();
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
  
  presentActionSheet() {
   const actionSheet = this.actionSheetCtrl.create({
     title: "Choose photos from",
     buttons: [
       {
         icon: 'camera',
         text: 'Camera',
         role: 'destructive',
         handler: () => {
           //this.nav.push(CameraPage);
           this.takePhoto();
         }
       },
       {
         icon: 'image',
         text: 'Gallery',
         handler: () => {
           console.log('Archive clicked');
         }
       }
     ]
   });

   actionSheet.present();
 }
}