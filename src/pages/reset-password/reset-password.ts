import { Component } from '@angular/core';
import { IonicPage, NavController, AlertController } from 'ionic-angular';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AuthProvider } from '../../providers/auth/auth';
import { EmailValidator } from '../../validators/email';

@IonicPage({
  name: 'reset-password'
})
@Component({
  selector: 'page-reset-password',
  templateUrl: 'reset-password.html',
})
export class ResetPasswordPage {
  public resetPasswordForm: FormGroup;

  constructor(
    public navCtrl: NavController,
    public authProvider: AuthProvider,
    public formBuilder: FormBuilder,
    public alertCtrl: AlertController
  ) {
      /*Using ionic formBuilders to construct a form consisting of
      one single email feild

      The following code builds the form, makes the email field a required field
      and ensures that the input is a valid email address*/
      this.resetPasswordForm = formBuilder.group({
        email: ['',
        Validators.compose([Validators.required, EmailValidator.isValid])],
      });
  }

  resetPassword(){

      /*The user won't be able to call this function if this.resetPasswordForm.valid,
      so the if statement likely won't ever be needed*/
      if (!this.resetPasswordForm.valid){
        console.log(this.resetPasswordForm.value);
      }

      //This case will always run
      else {
        /*firebase authentication provider provides a reset password function
          that accepts an email address and sends a password reset email to that address

          this.authProvider.resetPassword() simply passes the user's email to the function described above*/
        this.authProvider.resetPassword(this.resetPasswordForm.value.email)
        .then((user) => {

          /*alert the user that an email should be on its way*/
          let alert = this.alertCtrl.create({
            message: "An email containing a password reset link has been sent to the email address you provided.",
            buttons: [
              {
                text: "Ok",
                role: 'cancel',
                handler: () => { this.navCtrl.pop(); }
              }
            ]
          });
          alert.present();

        }, (error) => {

          /*Otherwise, alert the user of whatever error occurred*/
          var errorMessage: string = error.message;
          let errorAlert = this.alertCtrl.create({
            message: errorMessage,
            buttons: [{ text: "Ok", role: 'cancel' }]
          });
          errorAlert.present();
        });
      }
  }
}
