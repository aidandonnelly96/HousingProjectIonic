import {Injectable} from '@angular/core';
import firebase from 'firebase';

@Injectable()
export class AuthProvider {
  constructor() {}

  /*Just call the firebase auth signInWithEmailAndPassword function

    No updates to the UI are required from here as other pages contain event
    listeners and react to the user signing in

    Parameters: Email is the email address the user has input,
                Password is the password the user has input

    The html form performs all validations,
    meaning the user cannot attempt login with invalid credentials
    so there's no need to perform any validation here*/
  loginUser(email: string, password: string) {
    return firebase.auth().signInWithEmailAndPassword(email, password);
  }

  /*Just call the firebase auth signOut function

    No updates to the UI are required from here as other pages contain event
    listeners and react to the user signing out

    Returns a promise, meaning we need to wait for it to resolve/reject*/
  logoutUser(): firebase.Promise<any> {
    return firebase.auth().signOut();
  }

  /*reset password feature is also provided by firebase's auth provider

  Parameters: Email is the email address the user has input,

  The html form performs all validations,
  meaning the user cannot attempt login with invalid credentials
  so there's no need to perform any validation here

  Returns a promise, meaning we need to wait for it to resolve/reject*/
  resetPassword(email: string): firebase.Promise<any> {
    return firebase.auth().sendPasswordResetEmail(email);
  }

  /*Calls the firebase auth createUserWithEmailAndPassword function,
    which will immediately sign in as the new user

    Parameters: firstName: The value stored in the "first name" field on the sign up form upon submission
                surname: The value stored in the "surname" field on the sign up form upon submission
                email: The value stored in the "email" field on the sign up form upon submission
                password: The value stored in the "password" field on the sign up form upon submission

    The form performs validations meaning there's no need for us to validate here

    Returns a promise, meaning we need to wait for it to resolve/reject*/
  signupUser(firstname: string, surname: string, email: string, password: string): firebase.Promise<any> {
    return firebase.auth().createUserWithEmailAndPassword(email, password)
                          .then( newUser => {
                                /*once a new user has been created, create an element in the
                                database corresponding to them
                                This element will store the users email, gallery photos, and bookmarked homes*/
                                firebase.database().ref('/userProfile').child(newUser.uid).set({ email: email });

                                /*update the new user's profile to include the first name included in
                                  the registration form*/
                                return newUser.updateProfile({displayName: firstname});
                          }).catch(function(error) {
                                console.log(error);
                          });
  }

  /*This function is used by every page that requires access to the current users UID, which is most

  Just returns the currentUser object stored in firebase's auth provider*/
  getCurrentUser(){
    var user = firebase.auth().currentUser;
    return user;
  }
}
