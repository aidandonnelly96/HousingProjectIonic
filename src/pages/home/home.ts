import { Component, ViewChild } from '@angular/core';
import { Nav, ModalController, ViewController } from 'ionic-angular';
import { ModalPage } from '../modal/modal';
import { HomeDetailPage } from '../home-detail/home-detail';
import { NavController } from 'ionic-angular';
import { FacetPage } from '../facet/facet'
import { PopoverController } from 'ionic-angular';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

 @ViewChild(Nav) nav: Nav;
 homes: Array<{title: string, src: string, status: string}>;

  constructor(public navCtrl: NavController, public modalCtrl: ModalController, public popoverCtrl: PopoverController) {
  this.homes = [
          { title: '7 Maynooth Road', src: 'https://thoughtcatalog.files.wordpress.com/2014/06/shutterstock_183100415.jpg?w=1000&h=666', status: 'Suitable for living'},
          { title: '12 Dublin Road', src: 'http://cdn.extra.ie/wp-content/uploads/2017/06/24135659/Philip-Marley-6.jpg', status: 'Potential for Renovation'},
          { title: '12 Malahide Road', src: 'http://cdn.extra.ie/wp-content/uploads/2017/06/24135659/Philip-Marley-6.jpg', status: 'Beyond Renovation'},
          { title: '7 Maynooth Road', src: 'https://thoughtcatalog.files.wordpress.com/2014/06/shutterstock_183100415.jpg?w=1000&h=666', status: 'Suitable for living'},
          { title: '12 Dublin Road', src: 'http://cdn.extra.ie/wp-content/uploads/2017/06/24135659/Philip-Marley-6.jpg', status: 'Potential for Renovation'},
          { title: '12 Malahide Road', src: 'http://cdn.extra.ie/wp-content/uploads/2017/06/24135659/Philip-Marley-6.jpg', status: 'Beyond Renovation'},
          { title: '7 Maynooth Road', src: 'https://thoughtcatalog.files.wordpress.com/2014/06/shutterstock_183100415.jpg?w=1000&h=666', status: 'Suitable for living'},
          { title: '12 Dublin Road', src: 'http://cdn.extra.ie/wp-content/uploads/2017/06/24135659/Philip-Marley-6.jpg', status: 'Potential for Renovation'},
          { title: '12 Malahide Road', src: 'http://cdn.extra.ie/wp-content/uploads/2017/06/24135659/Philip-Marley-6.jpg', status: 'Beyond Renovation'},
          { title: '7 Maynooth Road', src: 'https://thoughtcatalog.files.wordpress.com/2014/06/shutterstock_183100415.jpg?w=1000&h=666', status: 'Suitable for living'},
          { title: '12 Dublin Road', src: 'http://cdn.extra.ie/wp-content/uploads/2017/06/24135659/Philip-Marley-6.jpg', status: 'Potential for Renovation'},
          { title: '12 Malahide Road', src: 'http://cdn.extra.ie/wp-content/uploads/2017/06/24135659/Philip-Marley-6.jpg', status: 'Beyond Renovation'}
      ];
  }
goToHomeDetail(homeSrc, homeTitle, homeStatus) {
    //push another page onto the history stack
    //causing the nav controller to animate the new page in
    this.navCtrl.push(HomeDetailPage, {
        title: homeTitle,
        src: homeSrc,
        status: homeStatus
    });
  }

  presentModal(){
    let modal = this.modalCtrl.create(ModalPage);
    modal.present();
  }
  /*
  openFacet(){
    this.navCtrl.push( FacetPage );
  }*/
  openFacet(){
    let modal = this.modalCtrl.create( FacetPage );
    let me = this;
    modal.present();
  }
}
