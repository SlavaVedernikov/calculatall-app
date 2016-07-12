'use strict';

angular.module('myApp.system_object_types', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/system_object_types', {
	name: "System object types",
    templateUrl: 'system_object_types/system_object_types.html',
    controller: 'system_object_types_Ctrl'
  });
}])

.controller('system_object_types_Ctrl', [function() {

}]);