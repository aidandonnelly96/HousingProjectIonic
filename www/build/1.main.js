webpackJsonp([1],{

/***/ 323:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__location_search__ = __webpack_require__(327);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "LocationSearchPageModule", function() { return LocationSearchPageModule; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};



var LocationSearchPageModule = (function () {
    function LocationSearchPageModule() {
    }
    return LocationSearchPageModule;
}());
LocationSearchPageModule = __decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["a" /* NgModule */])({
        declarations: [
            __WEBPACK_IMPORTED_MODULE_2__location_search__["a" /* LocationSearchPage */],
        ],
        imports: [
            __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["d" /* IonicPageModule */].forChild(__WEBPACK_IMPORTED_MODULE_2__location_search__["a" /* LocationSearchPage */]),
        ],
        exports: [
            __WEBPACK_IMPORTED_MODULE_2__location_search__["a" /* LocationSearchPage */]
        ]
    })
], LocationSearchPageModule);

//# sourceMappingURL=location-search.module.js.map

/***/ }),

/***/ 327:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(11);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return LocationSearchPage; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


/**
 * Generated class for the LocationSearchPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
var LocationSearchPage = (function () {
    function LocationSearchPage(navCtrl, navParams, viewCtrl) {
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.viewCtrl = viewCtrl;
        this.searchValue = "";
    }
    LocationSearchPage.prototype.ionViewDidLoad = function () {
        console.log('ionViewDidLoad LocationSearchPage');
    };
    LocationSearchPage.prototype.ngOnInit = function () {
        // get the two fields
        var input_from = document.getElementById('journey_from').getElementsByTagName('input')[0];
        // set the options
        var options = {
            types: []
        };
        // create the two autocompletes on the from and to fields
        var autocomplete1 = new google.maps.places.Autocomplete(input_from, options);
        // we need to save a reference to this as we lose it in the callbacks
        var self = this;
        // add the first listener
        google.maps.event.addListener(autocomplete1, 'place_changed', function () {
            var place = autocomplete1.getPlace();
            var geometry = place.geometry;
            if ((geometry) !== undefined) {
                console.log(place.name);
                console.log(geometry.location.lng());
                console.log(geometry.location.lat());
                console.log(place.types);
            }
        });
    };
    return LocationSearchPage;
}());
LocationSearchPage = __decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["e" /* IonicPage */])(),
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_6" /* Component */])({
        selector: 'page-location-search',template:/*ion-inline-start:"/Users/aidandonnelly/Desktop/FINAL YEAR/HousingProject/src/pages/location-search/location-search.html"*/'<!--\n  Generated template for the LocationSearchPage page.\n\n  See http://ionicframework.com/docs/components/#navigation for more info on\n  Ionic pages and navigation.\n-->\n\n<ion-header>\n  <ion-navbar>\n         <ion-searchbar id="journey_from" name="journey_from" type="text" placeholder="Enter location" [(ngModel)]="fromValue" style="border:none; background-image: none;">\n         </ion-searchbar>\n  </ion-navbar>\n\n</ion-header>\n\n\n<ion-content padding>\n<ion-list>\n        <ion-card>\n          <ion-card-header>\n              <ion-list>\n                  <ion-item>\n                    <button ion-button full> <ion-icon name="navigate"></ion-icon>Current Location</button>\n                  </ion-item>\n              </ion-list>\n          </ion-card-header>\n        </ion-card>\n    </ion-list>\n</ion-content>\n'/*ion-inline-end:"/Users/aidandonnelly/Desktop/FINAL YEAR/HousingProject/src/pages/location-search/location-search.html"*/,
    }),
    __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["f" /* NavController */], __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["h" /* NavParams */], __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["i" /* ViewController */]])
], LocationSearchPage);

//# sourceMappingURL=location-search.js.map

/***/ })

});
//# sourceMappingURL=1.main.js.map