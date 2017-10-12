import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FacetPage } from './facet';

@NgModule({
  declarations: [
    FacetPage,
  ],
  imports: [
    IonicPageModule.forChild(FacetPage),
  ],
  exports: [
    FacetPage
  ]
})
export class FacetPageModule {}
