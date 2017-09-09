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