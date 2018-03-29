import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MypostsfilterPage } from './mypostsfilter';

@NgModule({
  declarations: [
    MypostsfilterPage,
  ],
  imports: [
    IonicPageModule.forChild(MypostsfilterPage),
  ],
  exports: [
    MypostsfilterPage
  ]
})
export class MypostsfilterPageModule {}
