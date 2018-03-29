import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PostPopoverPage } from './post-popover';

@NgModule({
  declarations: [
    PostPopoverPage,
  ],
  imports: [
    IonicPageModule.forChild(PostPopoverPage),
  ],
  exports: [
    PostPopoverPage
  ]
})
export class PostPopoverPageModule {}
