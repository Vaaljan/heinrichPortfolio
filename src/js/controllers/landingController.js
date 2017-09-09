angular.module('mainApp')

  .controller('landingController', function (dataService) {
  		 var controller = this;

controller.model = dataService.portfolioData;

  });