'use strict';
/*
var modules = [{
		"name": "system_object_types",
		"display_name": "System Object Types",
		"view": {
			"data_source": "system_object_types",
			"page_size": 5,
			"fields": [{
				"displayName": "Name",
				"sourceName": "name"
			},
			{
				"displayName": "Display name",
				"sourceName": "display_name"
			},
			{
				"displayName": "Description",
				"sourceName": "description"
			}]
		}
	},
	{
		"name": "custom_object_types",
		"display_name": "Custom Object Types",
		"view": {
			"data_source": "custom_object_types",
			"page_size": 5,
			"fields": [{
				"displayName": "Name",
				"sourceName": "name"
			},
			{
				"displayName": "Display name",
				"sourceName": "display_name"
			},
			{
				"displayName": "Description",
				"sourceName": "description"
			}]
		}
	},
	{
		"name": "objects",
		"display_name": "Objects",
		"view": {
			"data_source": "objects",
			"page_size": 5,
			"fields": [{
				"displayName": "Name",
				"sourceName": "name"
			},
			{
				"displayName": "Display name",
				"sourceName": "display_name"
			},
			{
				"displayName": "Description",
				"sourceName": "description"
			}]
		}
	}];
*/
for (var i = 0; i < modules.length; i++) {
    var moduleName  = modules[i].name;
	var moduleDisplayName = modules[i].display_name;

	
	var module = angular.module('myApp.' + moduleName, ['ngRoute']);
		
	module.config(['$routeProvider', function($routeProvider) {
	  $routeProvider.when('/:module', {
		
		template: '<view-title>{{app.module.display_name}}</view-title>' +
			'<div ng-repeat="row in $resolve.rows" class="row">' +
			'<div ng-repeat="column in row.columns" class="col-lg-{{column.size}}">' +
			'<div ng-repeat="container in column.containers">' +
			'<ul ng-hide="container.tabs == undefined || container.tabs.length == 0" id="tabs" class="nav nav-tabs" data-tabs="tabs">' +
			'<li ng-repeat="tab in container.tabs" ng-class="{\'active\': $index==0}">' +
			'<a href="/#{{tab.id}}" data-toggle="tab">{{tab.display_name}}</a>' +
			'</li>' +
			'</ul>' +
			'<div class="tab-content">' +
			'<div ng-repeat="view in container.views" ng:class="{true:\'tab-pane active\', false:\'tab-pane\'}[$index==0]" id="{{view.tab_id}}">' +
			'<p>' +
			'<p>This is a description of {{getById($resolve.views, view.id).display_name}}</p>' +
			'</p>' +
			'<div class="panel panel-default">' +
			'<div class="panel-heading">{{getById($resolve.views, view.id).display_name}}</div>' +
			'<div class="panel-body">' +
			'<grid-view view="getById($resolve.views, view.id)"></grid-view>' +
			'</div>' +
			'</div>' +
			'</div>' +
			'</div>' +
			'</div>' +
			'</div>' +
			'</div>',
		resolve: {
			rows: function($route) { 
					var result = jsonPath(modules, "$.[?(@.name=='" + $route.current.params.module + "')]");
					return result[0].layout.rows;
				},
			views: function($route) { 
					var result = jsonPath(modules, "$.[?(@.name=='" + $route.current.params.module + "')]");
					return result[0].views;
				}
		},
		controller: 'shared_ctrl',
		controllerAs: "app"
	  });
	}]);
	
	
	module.controller('shared_ctrl', function($scope, $routeParams) {
		var self = this;
		
		
		var result = jsonPath(modules, "$.[?(@.name=='" + $routeParams.module + "')]");
		
		//alert(result[0].display_name);
		
		self.module = result[0];
		
		//alert(self.module.name);
		
		//alert(self.dtColumns.length);
		
	});
	
	
	//module.controller('grid_ctrl', grid_ctrl);

	
	
}
