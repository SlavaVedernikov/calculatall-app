'use strict';

angular.module('myApp.custom_object_types', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/custom_object_types', {
	name: "Custom object types",
    templateUrl: 'custom_object_types/custom_object_types.html',
    controller: 'custom_object_types_Ctrl'
  });
}])

.controller('custom_object_types_Ctrl', [function() {

}]);