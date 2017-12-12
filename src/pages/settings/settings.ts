import { Component } from '@angular/core';
import { App, AlertController, IonicPage, NavController, NavParams } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';
import { TabsPage } from '../tabs/tabs';
import { ResetPasswordPage } from '../reset-password/reset-password';

/**
 * Generated class for the SettingsPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {

  constructor(public navCtrl: NavController, public navParams: NavParams, public auth: AuthProvider, public alertCtrl: AlertController, public appCtrl: App ) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SettingsPage');
  }
  
  presentConfirmLogout() {
      const alert = this.alertCtrl.create({
        title: 'Log out',
        message: 'Are you sure you want to log out?',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
              console.log('Cancel clicked');
            }
          },
          {
            text: 'Ok',
            handler: () => {
              this.auth.logoutUser();
              this.appCtrl.getRootNav().push(TabsPage); 

            }
          }
        ]
      });
      alert.present();
  }
  goToResetPassword(){ 
        this.appCtrl.getRootNav().push(ResetPasswordPage);
  }   

}
