'use strict';
///*
var pages = [{
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
			"data_source": "custom_object_types",
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
  'myApp.system_object_types',
  'myApp.custom_object_types',
  'myApp.objects'
]);

module.run(function($rootScope){
  $rootScope.getById = function(data, id){		
		for (var i = 0; i < data.length; i++) {
			if(data[i].id == id) return data[i];
		}
	}
});


module.component('gridView', {
		template: '<div>' +
			'<p class="text-danger"><strong>{{ $ctrl.message }}</strong></p>' +
			'<table datatable="" dt-options="$ctrl.dtOptions" dt-columns="$ctrl.dtColumns" dt-instance="$ctrl.dtInstance" class="row-border hover"></table>' +
			'</div>',
		bindings: {
			view: '='
		},
		controller: function (DTOptionsBuilder, DTColumnBuilder, $routeParams, $scope, $compile) {
						
						var self = this;
						
						var serviceRootURL = 'http://127.0.0.1:8181';
						self.message = '';
						self.edit = edit;
						self.delete = deleteRow;
						self.dtInstance = {};
						
						self.dtOptions = DTOptionsBuilder.fromSource(serviceRootURL + '/' +this.view.data_source)
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
						
						function edit(name) {
							self.message = 'You are trying to edit the row: ' + name;
							// Edit some data and call server to make changes...
							// Then reload the data so that DT is refreshed
							self.dtInstance.reloadData();
						}
						function deleteRow(name) {
							self.message = 'You are trying to remove the row: ' + name;
							// Delete some data and call server to make changes...
							// Then reload the data so that DT is refreshed
							self.dtInstance.reloadData();
						}
						function createdRow(row, data, dataIndex) {
							// Recompiling so we can bind Angular directive to the DT
							$compile(angular.element(row).contents())($scope);
						}
						
						function actionsHtml(data, type, full, meta) {
							
							return 	'<button class="btn btn-warning" ng-click="$ctrl.edit(\'' + data.name + '\')">' +
									'   <i class="fa fa-edit"></i>' +
									'</button>&nbsp;' +
									'<button class="btn btn-danger" ng-click="$ctrl.delete(\'' + data.name + '\')">' +
									'   <i class="fa fa-trash-o"></i>' +
									'</button>';
						}
					}
	});

module.config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
  $locationProvider.hashPrefix('!');

  //$routeProvider.otherwise({redirectTo: '/system_object_types'});
}]);
