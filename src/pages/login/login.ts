import { Component } from '@angular/core';
import {
  IonicPage,
  Loading,
  LoadingController,
  NavController,
  AlertController } from 'ionic-angular';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { EmailValidator } from '../../validators/email';
import { AuthProvider } from '../../providers/auth/auth';
import { SignupPage } from '../signup/signup';
import { ResetPasswordPage } from '../reset-password/reset-password';
import { Events } from 'ionic-angular';

@IonicPage({
  name: 'login'
})
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  public loginForm: FormGroup;
  public loading: Loading;
  constructor(public navCtrl: NavController, public loadingCtrl: LoadingController, public alertCtrl: AlertController,   public authProvider: AuthProvider,       public formBuilder: FormBuilder, public events: Events) {

        //define a form using Ionics form builder, marking both email and password as required and validating both
        this.loginForm = formBuilder.group({
            email: ['',
            Validators.compose([Validators.required, EmailValidator.isValid])],
            password: ['',
            Validators.compose([Validators.minLength(6), Validators.required])]
        });
    }

    loginUser(): void {

      /*the user can not submit the login form until the fields are valid,
      so this.loginForm.valid will likely always be true*/
      if (!this.loginForm.valid){
          let alert = this.alertCtrl.create({
            title: 'Invalid login',
            subTitle: 'Invalid email or password. Please check your login details',
            buttons: ['Ok']
          });
          alert.present();
      }

      else {
        //attempt login, publish "user:login" event if successful, else alert the user
        this.authProvider.loginUser(this.loginForm.value.email, this.loginForm.value.password)
            .then( authData => {
                this.events.publish("user:login");
                this.loading.dismiss().then( () => {
                this.navCtrl.pop();
              });
            }, error => {
              this.loading.dismiss().then( () => {
                let alert = this.alertCtrl.create({
                  message: error.message,
                  buttons: [
                    {
                      text: "Ok",
                      role: 'cancel'
                    }
                  ]
                });
                alert.present();
              });
            });
        this.loading = this.loadingCtrl.create();
        this.loading.present();
      }
    }

    //this function is called when the user clicks the "Or create an account" text below the login form
    goToRegister(){
        //push a new page to the navigation stack, allowing the user to sign up for Deed
        this.navCtrl.push(SignupPage);
    }

    //this function is called when the user clicks the "Forgot password?" text below the login form
    goToResetPassword(){
        //push a new page to the navigation stack, allowing the user to reset their Deed password
        this.navCtrl.push(ResetPasswordPage);
    }
}
