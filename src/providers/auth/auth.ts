import {Injectable} from '@angular/core';
import {LoadingController, ToastController} from 'ionic-angular';

import {Validators, FormBuilder, FormGroup } from '@angular/forms';
import firebase from 'firebase';

@Injectable()
export class AuthProvider {
  constructor(public formBuilder: FormBuilder) {}
  
    
  loginUser(email: string, password: string){
    return firebase.auth().signInWithEmailAndPassword(email, password);
  }
  
  logoutUser(): firebase.Promise<void> {
    return firebase.auth().signOut();
  }
  
  resetPassword(email: string): firebase.Promise<void> {
    return firebase.auth().sendPasswordResetEmail(email);
  }
  
  signupUser(email: string, password: string): firebase.Promise<any> {
    return firebase.auth().createUserWithEmailAndPassword(email, password)
                          .then( newUser => {
                                firebase.database().ref('/userProfile').child(newUser.uid).set({ email: email });
                          });
  }
  
  getCurrentUser(){
    var user = firebase.auth().currentUser;
    console.log("x"+user);
    return user;
  }
}