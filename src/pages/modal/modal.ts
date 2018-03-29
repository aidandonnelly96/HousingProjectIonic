import { Component, ViewChild } from '@angular/core';
import { PopoverController, ModalController, NavController, NavParams, ViewController, AlertController, ActionSheetController, Nav, Slides, Platform} from 'ionic-angular';
import { PostPopoverPage } from '../post-popover/post-popover';
import { ImagePickerPage } from '../image-picker/image-picker'
import { LocationPickerPage } from '../location-picker/location-picker'
import { Camera, CameraOptions } from '@ionic-native/camera';
import { Geolocation } from '@ionic-native/geolocation';
import { DatabaseProvider } from '../../providers/database/database';
import {Validators, FormBuilder, FormGroup } from '@angular/forms';
import { NativeGeocoder, NativeGeocoderReverseResult } from '@ionic-native/native-geocoder';

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

  @ViewChild(Slides) slides: Slides;
  @ViewChild(Nav) nav: Nav;

  private homes : FormGroup;

  id: string;
  thumbUrl: string;

  lat: any;
  lng: any;

  images: Array<{src: any, data: any, state: string}>;
  coords: Array<{lng: number, lat: number}>;
  currentPostStatus="";

  draft:any;

  existingPhotos;

  title: string;
  address: string;
  info: string;
  status: string;
  buildingType: string;
  windows: string;
  rooms: any;
  furniture: string;
  size: any;
  time: string;
  electricity: string;
  plumbing: string;
  roof: string;
  garden: string;
  user: string;
  location: string;

  submitted=false;


  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController, public actionSheetCtrl: ActionSheetController, private camera: Camera, private geolocation: Geolocation, public db: DatabaseProvider, private formBuilder: FormBuilder, public alertCtrl: AlertController, public modalCtrl: ModalController, public plt: Platform, public popoverCtrl: PopoverController, private nativeGeocoder: NativeGeocoder) {
        this.images = [];
        this.existingPhotos = [];

        //If the user is editing an existing home or posting from an existing draft, the metadata will be passed into the "draft" parameter
        //if this parameter is undefined, populate the form with the default(empty) values
        if(navParams.get("draft")==undefined){
            this.lat=this.db.userLat;
            this.lng=this.db.userLng;
            this.thumbUrl="";
            this.coords = [];
            this.homes = this.formBuilder.group({
                title: ['', Validators.compose([Validators.required])],
                address: [''],
                location: ['', Validators.compose([Validators.required])],
                info: [''],
                status: ['', Validators.compose([Validators.required])],
                buildingType: ['', Validators.compose([Validators.required])],
                slidersize: ['15'],
                time: [' '],
                room: [' '],
                windows: [' '],
                rooms: [' '],
                furniture: [' '],
                electricity: [' '],
                plumbing: [' '],
                roof: [' '],
                garden: [' '],
                user: ['', Validators.compose([Validators.required])]

            });
        }

        //otherwise, populate the forms with the metadata stored in the "draft" parameter
        else{
           var me=this;
           this.draft=navParams.get("draft");
           this.currentPostStatus=this.draft.postStatus;
           this.nativeGeocoder.reverseGeocode(this.draft.lat, this.draft.long)
            .then((result: NativeGeocoderReverseResult) => {
                if(result.locality!=undefined){
                    me.location=result.locality;
                }
                else{
                    me.location=result.subAdministrativeArea;
                }
           })
           .catch((error: any) => console.log(error));
            this.lat=this.draft.lat;
            this.lng=this.draft.long;
            this.id=this.draft.id;
            this.thumbUrl=this.draft.thumbnail.url;
            this.getImageSourcesForThisHome();
            this.coords=[this.draft.lat, this.draft.long];
            this.homes = this.formBuilder.group({
                title: [this.draft.title, Validators.compose([Validators.required])],
                address: [this.draft.address],
                location: [this.draft.location, Validators.compose([Validators.required])],
                info: [this.draft.info],
                status: [this.draft.status, Validators.compose([Validators.required])],
                buildingType: [this.draft.buildingType, Validators.compose([Validators.required])],
                windows: [this.draft.windows],
                rooms: [this.draft.rooms],
                furniture: [this.draft.furniture],
                slidersize: [this.draft.EstPropertySize],
                time: [this.draft.timeLeftVacant],
                electricity: [this.draft.electricity],
                plumbing: [this.draft.plumbing],
                roof: [this.draft.roof],
                garden: [this.draft.garden],
                user: [this.draft.usersRelation]
            });
        }

        /*store the initial values of option in the form so we can check if the user has changed anything when deciding whether we should query whether they'd like to save their changes for later posting*/
        this.location=this.homes.value.location;
        this.title=this.homes.value.title;
        this.address=this.homes.value.address;
        this.info=this.homes.value.info;
        this.status=this.homes.value.status;
        this.buildingType=this.homes.value.buildingType;
        this.windows=this.homes.value.windows;
        this.rooms=this.homes.value.rooms;
        this.furniture=this.homes.value.furniture;
        this.size=this.homes.value.slidersize;
        this.time=this.homes.value.time;
        this.electricity=this.homes.value.electricity;
        this.plumbing=this.homes.value.plumbing;
        this.roof=this.homes.value.roof;
        this.garden=this.homes.value.garden;
        this.user=this.homes.value.user
    }

    postNewHome(form){
        //this.submitted is true so that when we dismiss the page, we don't alert the user as to whether or not they'd like to save the home as a draft
        this.submitted=true;
        var key=this.id;

        //dismiss the view
        this.viewCtrl.dismiss();

        //post the home using the metadata provided
        this.db.postHome(this.homes.value.title, this.homes.value.address, this.homes.value.info, this.homes.value.status, this.homes.value.buildingType, this.images, "published",  key, this.thumbUrl, this.lat, this.lng, this.homes.value.slidersize, this.homes.value.time, this.homes.value.electricity, this.homes.value.plumbing, this.homes.value.furniture, this.homes.value.rooms, this.homes.value.roof, this.homes.value.windows, this.homes.value.garden, this.homes.value.user, this.currentPostStatus);
    }

    getImageSourcesForThisHome(){
        //firebase database query following the path to the images corresponding to this home
        var query=firebase.database().ref('/homes/'+this.id+'/images/');
        var me=this;
        query.once('value')
            .then(homeSnap => {
                homeSnap.forEach(function(snap)
                    {
                        //me.existingImages.push(snap.val());
                        me.existingPhotos.push({src: snap.val().url, data: "", state: "existing" });
                        me.images.push({src: snap.val().url, data: "", state: "existing" });
                    })
            });
    }


    /*this function is called when the user clicks the "ADD PHOTOS" button at the top of the page, and then select the "Camera" option from the resulting popup*/
    takePhoto() {

        /*the ionic camera package allows for us to provide options for the format of the returned images, amongst other things.
        For example, the destinationType option can be FILE_URI, DATA_URL, or NATIVE_URI. I have chosen DATA_URL, which returns the image as a base-64 encoded string*/
        const options: CameraOptions = {
            quality : 100,
            destinationType : this.camera.DestinationType.DATA_URL,
            sourceType : this.camera.PictureSourceType.CAMERA,
            encodingType: this.camera.EncodingType.JPEG,
            saveToPhotoAlbum: false
        }

        this.camera.getPicture(options).then((imageData) => {

            /*the 'data:image/jpeg;base64,' prefix is required in order to use a base64 string as an image source

            store the state of the image so we know to store this image in the database, as we shouldn't reupload images from the Deed Gallery and we need a way to differentiate between them*/
             let base64Image = 'data:image/jpeg;base64,' + imageData;
             this.images.push({
               src: base64Image,
               data: imageData,
               state: "new"
             })
        }, (err) => {
            console.log("error: "+err);
        });
    }

    presentActionSheet() {

        /*when the user chooses to add photos, they have 3 options
            (i) from their camera
            (ii) from their device's internal storage
            (iii) from their Deed Gallery*/

        const actionSheet = this.actionSheetCtrl.create({
         title: "Choose photos from",
         buttons: [
           {
             icon: 'camera',
             text: 'Camera',
             handler: () => {
               this.takePhoto();
             }
           },
           {
             icon: 'image',
             text: 'Gallery',
             handler: () => {

                /*the ionic camera package allows for us to provide options for the format of the returned images, amongst other things.
                For example, the destinationType option can be FILE_URI, DATA_URL, or NATIVE_URI. I have chosen DATA_URL, which returns the image as a base-64 encoded string*/

                  var options = {
                    quality: 100,
                    destinationType: this.camera.DestinationType.DATA_URL,
                    sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
                    allowEdit: true,
                    encodingType: this.camera.EncodingType.JPEG,
                    targetWidth: 500,
                    targetHeight: 500,
                    saveToPhotoAlbum: false
                  };

                /*the 'data:image/jpeg;base64,' prefix is required by the firebase storage provider to recognize the file type

                store the state of the image so we know to store this image in the database, as we shouldn't reupload images from the Deed Gallery and we need a way to differentiate between them*/

                    this.camera.getPicture(options).then((imgUrl) => {
                      this.images.push({
                          src: 'data:image/png;base64,'+imgUrl,
                          data: imgUrl,
                          state: "new"
                      });
                    }, (err) => {
                      console.log(JSON.stringify(err))
                    });
                }

            },
           {
             icon: 'images',
             text: 'Deed Gallery',
             handler: () => {
                let modal = this.modalCtrl.create( ImagePickerPage );
                var me=this;
                modal.onDidDismiss(data => {
                  console.log(data);
                  if(data!=null){

                      /*if the user chooses images from the Deed Gallery, we reset the lat, lng and location of the post to the location of the chosen images
                      The user can override this and set it manually*/
                      if((data[0].lat<55.38278555788504 && data[0].lng<-5.43278358141104) && (data[0].lat>51.420927438945206 && data[0].lng > -10.58017122808533)){
                        this.lat=data[0].lat;
                        this.lng=data[0].lng;
                        this.nativeGeocoder.reverseGeocode(data[0].lat, data[0].lng)
                         .then((result: NativeGeocoderReverseResult) => {
                              if(me.location==""){
                                  if(result.locality!=undefined){
                                      me.location=result.locality;
                                  }
                                  else{
                                      me.location=result.subAdministrativeArea;
                                  }
                              }
                         })
                         .catch((error: any) => console.log(error));
                       }

                       //push the images from the Deed Gallery with the state "existing" so we know not to reupload them
                      for(let image of data){
                        if(image.selected==true){
                            this.images.push({
                                src: image.url,
                                data: "",
                                state: "existing"
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

    removePhoto(image){

        //slide to another image
        if(this.slides.getActiveIndex()==0 && this.slides.length() > 1){
            this.slides.slideTo(this.slides.getActiveIndex(), 500);
        }
        else if(this.slides.getActiveIndex()==this.slides.length()-1 && this.slides.length() > 1){
            this.slides.slideTo(this.slides.getActiveIndex()-1, 500);
        }

        //remove the image from this.images and this.existingPhotos
        this.images=this.images.filter(im => im != image);
        this.existingPhotos=this.existingPhotos.filter(im => im.url != image.src);
    }

    goToImagePicker(){
        //create a modal page displaying the current user's Deed Gallery images
        let modal = this.modalCtrl.create( ImagePickerPage );

        /*when the modal page is dismissed, it will return the images that the user selected, we'll store these in this.images marked as existing so that we don't reupload them*/

        modal.onDidDismiss(data => {
          console.log(data);
          if(data!=null){
              this.lat=data[0].lat;
              this.lng=data[0].lng;
              for(let image of data){
                if(image.selected==true){
                    this.images.push({
                        src: image.url,
                        data: "",
                        state: "existing"
                    });
                }
              }
          }
        });
        modal.present();
    }

    /*this popover displays a "Choose from drafts" option,
    when the user chooses to present the popoever, the click event is passed to this function*/
    presentPopover(myEvent) {

        //create the popover, passing the current home as a parameter
        let popover = this.popoverCtrl.create(PostPopoverPage, {modalThis: this});

        //display the popover, passing the click event as a parameter, which the PopoverController will use to determine its location on the screen
        popover.present({
            ev : myEvent
        });
    }

    showLocationPicker(){

        /*open page to allow the user to manually choose the location of the home they are contributing, passing the location, lat and lng
        Location, lat and lng will only be defined at this point if the user is using images from their Deed Gallery, or if they have opened the locationPickerPage before*/

        let modal = this.modalCtrl.create(LocationPickerPage, {location: this.location, lat: this.lat, lng: this.lng});

        //once they dismiss the LocationPickerPage, we update the location, lat and lng if the user has chosen to do so
        modal.onDidDismiss(data=>{
            if(data!=undefined){
                this.homes.value.location=data.location;
                this.location=data.location;
                this.lat=data.lat;
                this.lng=data.lng;
                console.log(data);
            }
        });
        modal.present();
    }

    goBack(){
          //pop current view
          this.viewCtrl.dismiss();

          //this checks if the user has added/remove/changed any images since opening this page
          var imageChanged=false;
          for(var i=0; i<this.images.length; i++){
            if(this.existingPhotos[i]==undefined || this.existingPhotos[i].src!=this.images[i].src){
                imageChanged=true;
                break;
            }
          }

          //if the user has changed any metadata since opening this page AND they haven't submitted the home, query whether they'd like to save their changes for later posting

          if(this.submitted==false && (imageChanged || this.homes.value.title!=this.title || this.homes.value.address!=this.address || this.homes.value.info != this.info || this.homes.value.status != this.status || this.homes.value.buildingType != this.buildingType || this.homes.value.windows != this.windows || this.homes.value.rooms != this.rooms || this.homes.value.furniture != this.furniture || this.homes.value.slidersize != this.size || this.homes.value.time != this.time || this.homes.value.electricity != this.electricity || this.homes.value.plumbing != this.plumbing || this.homes.value.roof != this.roof || this.homes.value.garden != this.garden || this.homes.value.user!=this.user || this.homes.value.location!=this.location)){

              //defining an alert popup for presenting
              let alert = this.alertCtrl.create({
                title: 'Save for later?',
                message: 'Would you like to save this home for later?',
                buttons: [
                  {
                    text: 'Discard',
                    role: 'cancel',
                    handler: () => {
                        //if they wouldn't like to save their changes, dismiss the current view
                        this.viewCtrl.dismiss();
                    }
                  },
                  {
                    text: 'Save for later',
                    handler: () => {
                        //if the user chooses to save their changes for later, dismiss the current view and save the metadata as a draft
                        this.viewCtrl.dismiss();
                        if(this.images.length>0){
                            this.thumbUrl=this.images[0].src;
                        }
                        this.db.postHome(this.homes.value.title, this.homes.value.address, this.homes.value.info, this.homes.value.status, this.homes.value.buildingType, this.images, "draft",  this.id, this.thumbUrl, this.lat, this.lng, this.homes.value.slidersize, this.homes.value.time, this.homes.value.electricity, this.homes.value.plumbing, this.homes.value.furniture, this.homes.value.rooms, this.homes.value.roof, this.homes.value.windows, this.homes.value.garden, this.homes.value.user, this.currentPostStatus);
                    }
                  }
                ]
              });
              //present the alert popup
              alert.present();
        }
    }
}
