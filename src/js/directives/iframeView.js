angular.module('mainApp').directive('iframeView', function () {
    return {
        restrict: 'EA', //Allow as Element [<address></address>] or as attribute [<div address></div>]
        templateUrl: 'views/partial/iframeView.html',
        scopre:true
    };
});