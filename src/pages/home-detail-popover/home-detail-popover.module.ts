import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HomeDetailPopoverPage } from './home-detail-popover';

@NgModule({
  declarations: [
    HomeDetailPopoverPage,
  ],
  imports: [
    IonicPageModule.forChild(HomeDetailPopoverPage),
  ],
  exports: [
    HomeDetailPopoverPage
  ]
})
export class HomeDetailPopoverPageModule {}
