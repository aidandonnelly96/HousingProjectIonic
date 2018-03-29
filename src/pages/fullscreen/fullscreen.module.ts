import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FullscreenPage } from './fullscreen';

@NgModule({
  declarations: [
    FullscreenPage,
  ],
  imports: [
    IonicPageModule.forChild(FullscreenPage),
  ],
  exports: [
    FullscreenPage
  ]
})
export class FullscreenPageModule {}
