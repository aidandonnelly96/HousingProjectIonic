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
import { HomePage } from '../home/home';
import { TabsPage } from '../tabs/tabs';
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
        this.loginForm = formBuilder.group({
            email: ['', 
            Validators.compose([Validators.required, EmailValidator.isValid])],
            password: ['', 
            Validators.compose([Validators.minLength(6), Validators.required])]
        });
  }
  
  loginUser(): void {
      if (!this.loginForm.valid){
        console.log(this.loginForm.value);
      } else {
        this.authProvider.loginUser(this.loginForm.value.email, this.loginForm.value.password)
            .then( authData => {
                this.events.publish("user:login");
                this.loading.dismiss().then( () => {
                //this.navCtrl.setRoot(TabsPage);
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
goToRegister(){ 
  this.navCtrl.push(SignupPage); 
}
goToResetPassword(){ 
  this.navCtrl.push(ResetPasswordPage); 
}
}