import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, ViewController, ActionSheetController, Nav} from 'ionic-angular';
import { CameraPage } from '../camera/camera'
import { Camera, CameraOptions } from '@ionic-native/camera';
import { Geolocation } from '@ionic-native/geolocation';
import { DatabaseProvider } from '../../providers/database/database';
import {Validators, FormBuilder, FormGroup } from '@angular/forms';

import firebase from 'firebase';

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
  
  private homes : FormGroup;
  
  imageData : Array<{data: string}>;
  
  images: Array<{src: string, rawsrc: string}>;
  coords: Array<{lng: number, lat: number}>;

  @ViewChild(Nav) nav: Nav;

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController, public actionSheetCtrl: ActionSheetController, private camera: Camera, private geolocation: Geolocation, public db: DatabaseProvider, private formBuilder: FormBuilder) {
        this.imageData = [];
        this.images = [];
        this.coords = [];
        this.homes = this.formBuilder.group({
          title: [''],
          info: [''],
          status: [''],
          buildingType: [''],
          windows: [''],
        });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ModalPage');
  }

  closemodal() {
    this.viewCtrl.dismiss();
  }
  
  postNewHome(form){
    this.db.postNewHome(this.homes.value.title, this.homes.value.info, this.homes.value.status, this.homes.value.buildingType, this.imageData).then(function (){
        console.log("c'est finit");
    });
    this.viewCtrl.dismiss();
  }
  
  takePhoto() {
        const options: CameraOptions = {
            quality : 95,
            destinationType : this.camera.DestinationType.DATA_URL,
            sourceType : this.camera.PictureSourceType.CAMERA,
            encodingType: this.camera.EncodingType.PNG,
            saveToPhotoAlbum: false
        }
        
        this.camera.getPicture(options).then((imageData) => {
         // imageData is either a base64 encoded string or a file URI
         // If it's base64:
         
         
         /*const imageRef = firebase.storage().ref('images/image1.png');
              imageRef
                .putString(imageData, 'base64', {contentType: 'image/png'})
                .then(savedImage => {
                  firebase
                    .database()
                    .ref(`users/user1/image`)
                    .set(savedImage.downloadURL);
                });*/

         let base64Image = 'data:image/jpeg;base64,' + imageData;
         this.images.push({
           src: base64Image,
           rawsrc: imageData
         })
         this.imageData.push({data: imageData})
        }, (err) => {
         // Handle error
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