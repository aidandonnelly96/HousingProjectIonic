import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, ViewController, AlertController, ActionSheetController, Nav} from 'ionic-angular';
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
  
  id: string;
  
  images: Array<{src: any, data: string, state: string}>;
  coords: Array<{lng: number, lat: number}>;
  draft: boolean;

  @ViewChild(Nav) nav: Nav;

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController, public actionSheetCtrl: ActionSheetController, private camera: Camera, private geolocation: Geolocation, public db: DatabaseProvider, private formBuilder: FormBuilder, public alertCtrl: AlertController) {
        this.images = [];
        if(navParams.get("draft")==undefined){
            this.draft=false;
            this.coords = [];
            this.homes = this.formBuilder.group({
                title: ['', Validators.compose([Validators.required])],
                address: [''],
                info: [''],
                status: ['', Validators.compose([Validators.required])],
                buildingType: ['', Validators.compose([Validators.required])],
                windows: [''],
            });
        }
        else{
            this.draft=true;
            this.id=navParams.get("draft").id;
            this.getImageSourcesForThisHome();
            this.coords=[navParams.get("draft").lat, navParams.get("draft").long];
            this.homes = this.formBuilder.group({
                title: [navParams.get("draft").title, Validators.compose([Validators.required])],
                address: [navParams.get("draft").address],
                info: [navParams.get("draft").info],
                status: [navParams.get("draft").status, Validators.compose([Validators.required])],
                buildingType: [navParams.get("draft").buildingType, Validators.compose([Validators.required])],
                windows: [''],
            });
        }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ModalPage');
  }

  closemodal() {
      if(this.homes.value.title!="" || this.homes.value.address!="" || this.homes.value.info!="" || this.homes.value.status!="" || this.homes.value.buildingType!="" || this.homes.value.windows!="" ){
          let alert = this.alertCtrl.create({
            title: 'Save for later?',
            message: 'Would you like to save this home for later?',
            buttons: [
              {
                text: 'Discard',
                role: 'cancel',
                handler: () => {
                    this.viewCtrl.dismiss();
                }
              },
              {
                text: 'Save for later',
                handler: () => {
                    this.db.postHome(this.homes.value.title, this.homes.value.address, this.homes.value.info, this.homes.value.status, this.homes.value.buildingType, this.images, "draft", "");
                    this.viewCtrl.dismiss();
                }
              }
            ]
          });
          alert.present();
    }
    else{
        this.viewCtrl.dismiss();
    }
  }
  
  postNewHome(form){
    var key="";
    if(this.draft==true){
        key = this.id;
    }
    else{
        key="";
    }
    this.db.postHome(this.homes.value.title, this.homes.value.address, this.homes.value.info, this.homes.value.status, this.homes.value.buildingType, this.images, "published", key);
    this.viewCtrl.dismiss();
  }
  
  getImageSourcesForThisHome(){
        var imageSources = [];
        var query = firebase.database().ref('/images');
        var me = this;
        query.once('value')
             .then(parentSnap => {
                    parentSnap.forEach(function(snap)
                    {
                        console.log(snap.val().url);
                        console.log(snap.val().forHome)
                        console.log(me.id)
                        if(snap.val().forHome==me.id){
                            me.images.push({src: snap.val().url, data: "", state: "existing" });
                        }
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
        
        this.camera.getPicture(options).then((imageData) => {
         // imageData is either a base64 encoded string or a file URI
         // If it's base64:

         let base64Image = 'data:image/jpeg;base64,' + imageData;
         this.images.push({
           src: base64Image, 
           data: imageData,
           state: "new"
         })
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