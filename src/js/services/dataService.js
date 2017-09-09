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
