import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ImagePickerPage } from './image-picker';

@NgModule({
  declarations: [
    ImagePickerPage,
  ],
  imports: [
    IonicPageModule.forChild(ImagePickerPage),
  ],
  exports: [
    ImagePickerPage
  ]
})
export class ImagePickerPageModule {}
