var sassConfig = {"colors":{"primaryColor":"#F5B430","secondaryColor":"#D12F1F","brandGrey":"#666666","brandGreen":"#3D9E93"},"defaultWidth":"123px"};

var app = angular.module('mainApp', ['ngRoute','ui.bootstrap','viewCache']);

angular.module('mainApp').config(function ($routeProvider) {

  $routeProvider
   .when('/landing', {
      templateUrl: 'views/landing.html',
      controller: 'landingController',
      controllerAs: 'landingCtrl',
      activeTab: 'landing',
    })
   .when('/portfolio', {
      templateUrl: 'views/portfolio.html',
      controller: 'portfolioController',
      controllerAs: 'portCtrl',
      activeTab: 'portfolio'
    })
    .otherwise({
      redirectTo: '/landing',
      activeTab: 'landing'
    });
});
angular.module('mainApp').service('dataService', function() {
  /* jshint ignore:start */
  // Ignore the variable not declared warining -- the processData is injected by the system
  this.portfolioData = portfolioData;
  // this.sassConfig = sassConfig || {};
  /* jshint ignore:end */
 
var self = this;

////Global Functions
self.iframeView = false;
self.iframeUrl = "";

self.backTo = function(){
	self.iframeView = false;
}



});

angular.module('mainApp')

  .controller('landingController', function (dataService) {
  		 var controller = this;

controller.model = dataService.portfolioData;

  });
angular.module('mainApp')

  .controller('mainController', ['dataService','$location','$scope', '$sce', function (dataService, $location,$scope, $sce) {
    
    var controller = this;
    
    controller.dataService = dataService;
    controller.model = dataService.portfolioData;
    
    controller.setTab = function (tabName) {
      controller.selectedTab = tabName;
    };
    controller.isTabSelected = function (path) {
      return $location.path().substr(0, path.length) === path;
    };

    controller.showiframe = function(url,desc){
      // var trustedUrl = {src:url, title:desc};
      controller.dataService.iframeUrl = $sce.trustAsResourceUrl(url);
      console.log(controller.dataService.iframeUrl)
      controller.dataService.iframeView = true;
    }

    

  }]);
angular.module('mainApp')

  .controller('portfolioController', function (dataService) {
  		   var controller = this;
controller.model = dataService.portfolioData;


  });
angular.module('mainApp').directive('iframeView', function () {
    return {
        restrict: 'EA', //Allow as Element [<address></address>] or as attribute [<div address></div>]
        templateUrl: 'views/partial/iframeView.html',
        scopre:true
    };
});