'use strict';

for (var i = 0; i < pages.length; i++) {
    var moduleName  = pages[i].name;
	var moduleDisplayName = pages[i].display_name;

	
	var module = angular.module('myApp.' + moduleName, ['ngRoute']);
		
	module.config(['$routeProvider', function($routeProvider) {
	  $routeProvider.when('/:module', {
		
		template: 
			'<view-title>{{app.module.display_name}}</view-title>' +
				'<div ng-repeat="row in $resolve.rows" class="row">' +
					'<div ng-repeat="column in row.columns" class="col-lg-{{column.size}}">' +
						'<div ng-repeat="container in column.containers">' +
							'<ul ng-hide="container.tabs == undefined || container.tabs.length == 0" id="tabs" class="nav nav-tabs" data-tabs="tabs">' +
								'<li ng-repeat="tab in container.tabs" ng-class="{\'active\': $index==0}">' +
									'<a href="/#{{tab.name}}" data-toggle="tab">{{tab.display_name}}</a>' +
								'</li>' +
							'</ul>' +
							'<div class="tab-content">' +
								'<div ng-repeat="view in container.views" ng:class="{true:\'tab-pane active\', false:\'tab-pane\'}[$index==0]" id="{{view.tab}}">' +
									'<p>' +
										'<p>This is a description of {{getById($resolve.views, view.view).display_name}}</p>' +
									'</p>' +
									'<div class="panel panel-default">' +
										'<div class="panel-heading">{{getById($resolve.views, view.view).display_name}}</div>' +
										'<div class="panel-body">' +
											'<grid-view view="getById($resolve.views, view.view)"></grid-view>' +
										'</div>' +
									'</div>' +
								'</div>' +
							'</div>' +
						'</div>' +
					'</div>' +
				'</div>',
		resolve: {
			rows: function($route) { 
					var result = jsonPath(pages, "$.[?(@.name=='" + $route.current.params.module + "')]");
					return result[0].layout.rows;
				},
			views: function($route) { 
					var result = jsonPath(pages, "$.[?(@.name=='" + $route.current.params.module + "')]");
					return result[0].views;
				}
		},
		controller: 'shared_ctrl',
		controllerAs: "app"
	  });
	}]);
	
	
	module.controller('shared_ctrl', function($scope, $routeParams) {
		var self = this;
		var result = jsonPath(pages, "$.[?(@.name=='" + $routeParams.module + "')]");
		
		self.module = result[0];
	});	
}
