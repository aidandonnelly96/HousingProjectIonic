import {Injectable} from '@angular/core';
import {LoadingController, ToastController} from 'ionic-angular';

import {Validators, FormBuilder, FormGroup } from '@angular/forms';
import firebase from 'firebase';

@Injectable()
export class AuthProvider {
  constructor(public formBuilder: FormBuilder) {}
  
  loginUser(email: string, password: string) {
    return firebase.auth().signInWithEmailAndPassword(email, password);
  }
  
  logoutUser(): Promise<void> {
    return firebase.auth().signOut();
  }
  
  resetPassword(email: string): Promise<void> {
    return firebase.auth().sendPasswordResetEmail(email);
  }
  
  signupUser(firstname: string, surname: string, email: string, password: string): Promise<any> {
    return firebase.auth().createUserWithEmailAndPassword(email, password)
                          .then( newUser => {
                                firebase.database().ref('/userProfile').child(newUser.uid).set({ email: email });
                                console.log(firstname);
                                return newUser.updateProfile({displayName: firstname});
                          }).catch(function(error) {
                                console.log(error);
                          });
  }
  
  getCurrentUser(){
    var user = firebase.auth().currentUser;
    return user;
  }
}