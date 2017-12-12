import { Component, ViewChild } from '@angular/core';
import { ModalController, NavController, NavParams, ViewController, AlertController, ActionSheetController, Nav} from 'ionic-angular';
import { CameraPage } from '../camera/camera'
import { ImagePickerPage } from '../image-picker/image-picker'
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
  thumbUrl: string;
  
  lat: any;
  lng: any;
  
  images: Array<{src: any, data: any, state: string}>;
  coords: Array<{lng: number, lat: number}>;
  currentPostStatus: any;
  
  draft:any;
  
  existingPhotos;

  private size;
  @ViewChild(Nav) nav: Nav;

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController, public actionSheetCtrl: ActionSheetController, private camera: Camera, private geolocation: Geolocation, public db: DatabaseProvider, private formBuilder: FormBuilder, public alertCtrl: AlertController, public modalCtrl: ModalController) {
        this.size=500;
        this.images = [];
        if(navParams.get("draft")==undefined){
            this.lat=91;
            this.lng=181;
            this.thumbUrl="";
            this.coords = [];
            this.homes = this.formBuilder.group({
                title: ['', Validators.compose([Validators.required])],
                address: [''],
                info: [''],
                status: ['', Validators.compose([Validators.required])],
                buildingType: ['', Validators.compose([Validators.required])],
                size: [''],
                time: [''],
                room: [''],
                windows: [''],
                rooms: [''],
                furniture: [''],
                electricity: [''],
                plumbing: [''],
                roof: [''],
                garden: [''],
                user: ['']
                
            });
        }
        else{
            this.draft=navParams.get("draft");
            this.currentPostStatus=this.draft.postStatus;
            this.lat=this.draft.lat;
            this.lng=this.draft.long;
            this.id=this.draft.id;
            this.thumbUrl=this.draft.thumbnail.url;
            this.getImageSourcesForThisHome();
            this.coords=[this.draft.lat, this.draft.long];
            this.homes = this.formBuilder.group({
                title: [this.draft.title, Validators.compose([Validators.required])],
                address: [this.draft.address],
                info: [this.draft.info],
                status: [this.draft.status, Validators.compose([Validators.required])],
                buildingType: [this.draft.buildingType, Validators.compose([Validators.required])],
                windows: [this.draft.buildingType.windows],
                rooms: [this.draft.roof],
                furniture: [this.draft.furniture],
                size: [this.draft.size],
                time: [this.draft.time],
                electricity: [this.draft.electricity],
                plumbing: [this.draft.plumbing],
                roof: [this.draft.roof],
                garden: [this.draft.garden],
                user: [this.draft.user]
            });
        }
  }
 
  ionViewDidLoad() {
    console.log('ionViewDidLoad ModalPage');
  }

  closeModal() {
      if(this.homes.value.title!="" || this.homes.value.address!="" || this.homes.value.info!="" || this.homes.value.status!="" || this.homes.value.buildingType!="" || this.homes.value.windows!="" || this.images.length>0){
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
                    this.db.postHome(this.homes.value.title, this.homes.value.address, this.homes.value.info, this.homes.value.status, this.homes.value.buildingType, this.images, "draft",  this.id, this.thumbUrl, this.lat, this.lng, this.homes.value.size, this.homes.value.time, this.homes.value.electricity, this.homes.value.plumbing, this.homes.value.furniture, this.homes.value.rooms, this.homes.value.roof, this.homes.value.windows, this.homes.value.garden, this.homes.value.user, this.existingPhotos, this.currentPostStatus);
                    
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
    key=this.id;
    this.db.postHome(this.homes.value.title, this.homes.value.address, this.homes.value.info, this.homes.value.status, this.homes.value.buildingType, this.images, "published",  key, this.thumbUrl, this.lat, this.lng, this.homes.value.size, this.homes.value.time, this.homes.value.electricity, this.homes.value.plumbing, this.homes.value.furniture, this.homes.value.rooms, this.homes.value.roof, this.homes.value.windows, this.homes.value.garden, this.homes.value.user, this.existingPhotos, this.currentPostStatus);
    this.viewCtrl.dismiss();
  }
  
    getImageSourcesForThisHome(){
        var imageSources = [];
        var query=firebase.database().ref('/homes/'+this.id+'/images/');
        var me=this;
        query.once('value')
            .then(homeSnap => {
                me.existingPhotos=homeSnap.val();
                console.log(me.existingPhotos);
                homeSnap.forEach(function(snap)
                    {
                        console.log(snap.val().url);
                        me.images.push({src: snap.val().url, data: "", state: "existing" });
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
         handler: () => {
           //this.nav.push(CameraPage);
           this.takePhoto();
         }
       },
       {
         icon: 'image',
         text: 'Gallery',
         handler: () => {
            let modal = this.modalCtrl.create( ImagePickerPage );
            modal.onDidDismiss(data => {
              console.log(data);
              if(data!=null){
                  this.coords=[data[0].lat, data[0].lng];
                  for(let image of data){
                    if(image.selected==true){
                        console.log(image.src);
                        this.images.push({
                            src: image.url,
                            data: "",
                            state: "gallery"
                        });
                    }
                  }
              }
            });
            modal.present();
        }
       }
     ]
   });

   actionSheet.present();
 }
}