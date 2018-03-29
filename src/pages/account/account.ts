import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { MypostsPage } from '../../pages/myposts/myposts';
import { FavouritesPage } from '../../pages/favourites/favourites';
import { SettingsPage } from '../../pages/settings/settings';
import { DraftsPage } from '../drafts/drafts';
import { AuthProvider } from '../../providers/auth/auth'

/**
 * Generated class for the AccountPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-account',
  templateUrl: 'account.html',
})
export class AccountPage {

  /*this page simply encapsulates the user's
    MyPostsPage: Displays the homes that the current user has contributed,
    FavouritesPage: Displays the homes that the current user has bookmarked
    DraftsPage: Displays the homes that the current user has saved for later posting
    SettingsPage: Displays a list of settings*/
  tab0Root: any = MypostsPage;
  tab1Root: any = FavouritesPage;
  tab2Root: any = DraftsPage;
  tab3Root: any = SettingsPage;
  displayName: string;
  constructor(public navCtrl: NavController, public navParams: NavParams, public auth: AuthProvider) {

        //the users first name will be displayed at the top of the account page in the format "{{FirstName}}'s Account'"
        this.displayName = this.auth.getCurrentUser().displayName;
  }
}
