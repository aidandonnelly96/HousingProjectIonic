import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HomemapPage } from './homemap';

@NgModule({
  declarations: [
    HomemapPage,
  ],
  imports: [
    IonicPageModule.forChild(HomemapPage),
  ],
  exports: [
    HomemapPage
  ]
})
export class HomemapPageModule {}
