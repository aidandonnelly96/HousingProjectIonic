import { Component } from '@angular/core';
import { App, AlertController, NavController, NavParams } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';
import { DatabaseProvider } from '../../providers/database/database';
import { ResetPasswordPage } from '../reset-password/reset-password';

/**
 * Generated class for the SettingsPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

declare var LocalFileSystem: any;

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {


  constructor(public navCtrl: NavController, public navParams: NavParams, public auth: AuthProvider, public alertCtrl: AlertController, public appCtrl: App, public db: DatabaseProvider) {
  }

  //this function will be called when the user clicks the "Log out" button
  presentConfirmLogout() {

      //prompt the user to confirm their actions
      const alert = this.alertCtrl.create({
        title: 'Log out',
        message: 'Are you sure you want to log out?',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
                //If the user clicks cancel, do nothing. The alert will close on its own
            }
          },
          {
            text: 'Ok',
            handler: () => {
              //call the authentication provider's logout function
              this.auth.logoutUser();

              //pop the root page from the navigation stack, in this case its the MyAccount page
              this.appCtrl.getRootNav().pop();
            }
          }
        ]
      });
      alert.present();
  }

  //this function is called when the user clicks the "Reset password" button
  goToResetPassword(){
        //push a page on top of the root page of the navigation stack, in this case the root page is the MyAccount page
        this.appCtrl.getRootNav().push(ResetPasswordPage);
  }

  exportData(){
    this.db.exportData();
  }
}
