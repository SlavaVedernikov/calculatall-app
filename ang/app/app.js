'use strict';
///*
var modules = [{
		"name": "system_object_types",
		"display_name": "System Object Types",
		"layout": {
			"rows": [{
				"columns": [{
					"size": 4,
					"containers": [{
						"tabs": [{
							"id": "system_object_types",
							"display_name": "System object types"
						},
						{
							"id": "custom_object_types",
							"display_name": "Custom Object Types"
						}],
						"views": [{
							"id": "system_object_types",
							"tab_id": "system_object_types"
						},
						{
							"id": "custom_object_types",
							"tab_id": "custom_object_types"
						}]
					}]
				},
				{
					"size": 8,
					"containers": [{
						"tabs": [{
							"id": "objects",
							"display_name": "Objects"
						}],
						"views": [{
							"id": "objects",
							"tab_id": "objects"
						}]
					}]
				}]
			}]
		},
		"views": [{
			"id": "system_object_types",
			"display_name": "System object types",
			"data_source": "system_object_types",
			"query": "object_type == 'system_object'",
			"page_size": 5,
			"fields": [{
				"displayName": "Name",
				"sourceName": "name"
			},
			{
				"displayName": "Display name",
				"sourceName": "display_name"
			}]
		},
		{
			"id": "custom_object_types",
			"display_name": "Custom Object Types",
			"data_source": "system_object_types",
			"query": "object_type == 'custom_object_type'",
			"page_size": 5,
			"fields": [{
				"displayName": "Name",
				"sourceName": "name"
			},
			{
				"displayName": "Display name",
				"sourceName": "display_name"
			}]
		},
		{
			"id": "objects",
			"display_name": "Objects",
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
		}]
	},
	{
		"name": "custom_object_types",
		"display_name": "Custom Object Types",
		"layout": {
			"rows": [{
				"columns": [{
					"size": 12,
					"containers": [{
						"tabs": [
						{
							"id": "custom_object_types",
							"display_name": "Custom Object Types"
						}],
						"views": [{
							"id": "custom_object_types",
							"tab_id": "custom_object_types"
						}]
					}]
				}]
			}]
		},
		"views": [{
			"id": "custom_object_types",
			"display_name": "Custom Object Types",
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
		}]
	},
	{
		"name": "objects",
		"display_name": "Objects",
		"layout": {
			"rows": [{
				"columns": [{
					"size": 12,
					"containers": [{
						"views": [{
							"id": "objects",
							"tab_id": "Objects"
						}]
					}]
				}]
			}]
		},
		"views": [{
			"id": "objects",
			"display_name": "Objects",
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
		}]
	}];
// Declare app level module which depends on views, and components
var module = angular.module('myApp', [
  'ngRoute',
  'viewhead',
  'datatables',
  'ui.bootstrap',
  'myApp.system_object_types',
  'myApp.custom_object_types',
  'myApp.objects'
]);

var modalInstance = {};
var object_type = '';
var object_id = '';
var object_data_source = '';

module.run(function($rootScope){
	$rootScope.getById = function(data, id){		
		for (var i = 0; i < data.length; i++) {
			if(data[i].id == id) return data[i];
		}
	}
});


/*
module.run(function($rootScope){
	$rootScope.openModal = function (object_type, object_id) {
		var self = this;
		
		self.object_type = object_type;
		self.object_id = object_id;
		
		modalInstance = $modal.open({
		  template: '<form-view object_type="$resolve.object_type" object_id="$resolve.object_id"></grid-view>',
		  resolve: {
			object_type: function () {
			  return self.object_type;
			},
			object_id: function () {
			  return self.object_id;
			}
		  }
		});
		
		modalInstance.result.then(function (data) {
			alert(data);
		});
	}
});
*/



module.component('gridView', {
		template: '<div>' +
			'<table datatable="" dt-options="$ctrl.dtOptions" dt-columns="$ctrl.dtColumns" dt-instance="$ctrl.dtIntanceCallback" class="row-border hover"></table>' +
			'</div>',
		bindings: {
			view: '='
		},
		controller: function (DTOptionsBuilder, DTColumnBuilder, $routeParams, $scope, $compile, $uibModal, $rootScope) {
						
						var self = this;
						
						//var serviceRootURL = 'https://calculatall-api.herokuapp.com';
						var serviceRootURL = 'http://127.0.0.1:8181';
						self.edit = edit;
						self.delete = deleteRow;
						self.dtInstance = {};
						
						self.dtIntanceCallback = function (instance) {
							self.dtInstance = instance;
						}
	
						self.dtOptions = DTOptionsBuilder.fromSource(serviceRootURL + '/' + this.view.data_source + ((this.view.query != undefined) ? '?query=' + this.view.query : ''))
							.withPaginationType('full_numbers')
							.withDisplayLength(this.view.page_size)
							.withOption('createdRow', createdRow);
						self.dtColumns = [];

						
						for (var i = 0; i < this.view.fields.length; i++) {
							var obj = DTColumnBuilder.newColumn(this.view.fields[i].sourceName)
								.withTitle(this.view.fields[i].displayName)
								.withOption('defaultContent', 'n/a');

							self.dtColumns.push(obj);
						}
						
						self.dtColumns.push(DTColumnBuilder.newColumn(null).withTitle('Actions').notSortable()
							.renderWith(actionsHtml));
						
						function edit(name, object_type) {
							self.message = 'You are trying to edit the row: ' + name;
							// Edit some data and call server to make changes...
							$rootScope.object_type = object_type;
							$rootScope.object_id = name;
							$rootScope.object_data_source = this.view.data_source;
							openModal();
						}
						function deleteRow(name) {
							// Delete some data and call server to make changes...
							// Then reload the data so that DT is refreshed
							self.dtInstance.reloadData();
						}
						function createdRow(row, data, dataIndex) {
							// Recompiling so we can bind Angular directive to the DT
							$compile(angular.element(row).contents())($scope);
						}
						
						function openModal() {
							
							modalInstance = $uibModal.open({
							  template: '<form-view></grid-view>',
							});
							
							modalInstance.result.then(function (data) {
								// Reload the data so that DT is refreshed
								self.dtInstance.reloadData();
							});
						}
						
						function actionsHtml(data, type, full, meta) {
							
							return 	'<button class="btn btn-warning" ng-click="$ctrl.edit(\'' + data.name + '\', \'' + data.object_type + '\')">' +
									'   <i class="fa fa-edit"></i>' +
									'</button>&nbsp;' +
									'<button class="btn btn-danger" ng-click="$ctrl.delete(\'' + data.name + '\')">' +
									'   <i class="fa fa-trash-o"></i>' +
									'</button>';
						}
					}
	});
	
module.component('formView', {
		template: '<div class="modal-header">' +
            '<h3 class="modal-title">Title goes here</h3>' +
			'<div class="panel panel-default">' +
			'<div class="panel-heading">{{data.display_name}}</div>' +
			'<div class="panel-body">' +
			
			'<form name = "formView">' +
			'<div ng-repeat="field in object_type.fields">' +
			
			'<div class="form-group">' +
			'<label>{{field.display_name}}:</label>' +
			'<input ng-model = "data[field.name]" class="form-control" type = "text" placeholder="{{field.description}}"/>' +
			'</div>' +
			
			'</div>' +
			'</form>' +
			'<div class="modal-footer">' +
            '<button class="btn btn-primary" ng-click="ok()">OK</button>' +
            '<button class="btn btn-warning" ng-click="cancel()">Cancel</button>' +
			'</div>' +
			'</div>' +
			'</div>',
		controller: function ($routeParams, $scope, $http, $rootScope) {
						
						var self = this;
						
						//var serviceRootURL = 'https://calculatall-api.herokuapp.com';
						var serviceRootURL = 'http://127.0.0.1:8181';
						
						$http({
						  method: 'GET',
						  url: serviceRootURL + '/' + $rootScope.object_data_source + '/' + $rootScope.object_id
						}).then(function successCallback(response) {
							$scope.data = response.data;
							
							$http({
							  method: 'GET',
							  url: serviceRootURL + '/system_object_types/' + $scope.data.object_type
							}).then(function successCallback(response) {
								$scope.object_type = response.data;
								
							  }, function errorCallback(response) {
								// called asynchronously if an error occurs
								// or server returns response with an error status.
							  });
						  }, function errorCallback(response) {
							// called asynchronously if an error occurs
							// or server returns response with an error status.
						  });
						  
						  
						$scope.getFieldValue = function (fieldName) {
							return eval('data.' + fieldName);
						};
						
						$scope.ok = function () {
							modalInstance.close($scope.data.name);
						};

						$scope.cancel = function () {
							modalInstance.dismiss('cancel');
						};
					}
	});

module.config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
  $locationProvider.hashPrefix('!');

  //$routeProvider.otherwise({redirectTo: '/system_object_types'});
}]);
