angular.module('mainApp')

  .controller('mainController', ['dataService','$location','$scope', '$sce','$window','$route', function (dataService, $location,$scope, $sce,$window,$route) {
    
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

    controller.isCollapsed = true;


    // var appWindow = angular.element($window);

    //   appWindow.bind('resize', function () {
    //    location.reload();
    //   });

  }]);