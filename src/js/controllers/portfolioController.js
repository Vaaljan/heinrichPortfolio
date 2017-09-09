angular.module('mainApp')

  .controller('portfolioController', function (dataService) {
  		   var controller = this;
controller.model = dataService.portfolioData;


  });