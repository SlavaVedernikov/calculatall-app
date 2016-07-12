'use strict';

angular.module('myApp.objects', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/objects', {
	name: "Objects",
    templateUrl: 'objects/objects.html',
    controller: 'objects_Ctrl'
  });
}])

.controller('objects_Ctrl', [function() {

}]);