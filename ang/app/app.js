'use strict';
///*			
var pages = [{
		"name": "system_object_types",
		"display_name": "System Object Types",
		"layout": {
			"rows": [{
				"columns": [{
					"size": 12,
					"containers": [{
						"tabs": [{
							"name": "system_object_types",
							"display_name": "System object types"
						}],
						"views": [{
							"view": "system_object_types",
							"tab": "system_object_types"
						}]
					}]
				}]
			}]
		},
		"views": [{
			"name": "system_object_types",
			"display_name": "System object types",
			"object_type": "system_object",
			"query": "",
			"page_size": 10,
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
		"name": "validation_rules",
		"display_name": "Validation rules",
		"layout": {
			"rows": [{
				"columns": [{
					"size": 12,
					"containers": [{
						"tabs": [{
							"name": "validation_rules",
							"display_name": "Validation rules"
						}],
						"views": [{
							"view": "validation_rules",
							"tab": "validation_rules"
						}]
					}]
				}]
			}]
		},
		"views": [{
			"name": "validation_rules",
			"display_name": "Validation rules",
			"object_type": "validation_rule_definition",
			"query": "",
			"page_size": 10,
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
	
angular.module('myApp.settings', []).constant('appSettings', {serviceRootURL: 'http://127.0.0.1:8181'});

// Declare app level module which depends on views, and components
var module = angular.module('myApp', [
  'ngRoute',
  'viewhead',
  'datatables',
  'ui.bootstrap',
  'myApp.settings',
  'myApp.system_object_types'
]);

var modalInstance = {};
var object_type = '';
var object_id = '';

module.run(function($rootScope){
	$rootScope.getById = function(data, id){		
		for (var i = 0; i < data.length; i++) {
			if(data[i].name == id) return data[i];
		}
	}
});



module.component('gridView', {
		template: '<div>' +
			'<table datatable="" dt-options="$ctrl.dtOptions" dt-columns="$ctrl.dtColumns" dt-instance="$ctrl.dtIntanceCallback" class="row-border hover"></table>' +
			'</div>',
		bindings: {
			view: '='
		},
		controller: function (DTOptionsBuilder, DTColumnBuilder, $routeParams, $scope, $compile, $uibModal, $rootScope, appSettings) {
						
						var self = this;
						
						var serviceRootURL = appSettings.serviceRootURL;

						self.edit = edit;
						self.delete = deleteRow;
						self.dtInstance = {};
						
						self.dtIntanceCallback = function (instance) {
							self.dtInstance = instance;
						}
	
						self.dtOptions = DTOptionsBuilder.fromSource(serviceRootURL + '/' + this.view.object_type + ((this.view.query != undefined) ? '?query=' + this.view.query : ''))
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
							  template: '<form-view></form-view>',
							  windowClass: 'right fade'
							});
							
							modalInstance.rendered.then(function(){
								setModalMaxHeight('form-view');
							});
							//setModalMaxHeight('form-view');
							
							modalInstance.result.then(function (data) {
								// Reload the data so that DT is refreshed
								self.dtInstance.reloadData();
							});
						}
						
						function setModalMaxHeight(element) {
							var element     = $(element);
							var content     = element.find('.modal-body');
							var borderWidth   = content.outerHeight() - content.innerHeight();
							var dialogMargin  = $(window).width() > 767 ? 60 : 20;
							var contentHeight = $(window).height() - (dialogMargin + borderWidth);
							var headerHeight  = element.find('.modal-header').outerHeight() || 0;
							var footerHeight  = element.find('.modal-footer').outerHeight() || 0;
							var maxHeight     = contentHeight - (headerHeight + footerHeight);

							content.css({
							  'overflow': 'hidden'
							});

							element
							.find('.modal-body').css({
							  'max-height': maxHeight,
							  'overflow-y': 'auto'
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
		template: 
			'<div class="modal-header">' +
				'<h3 class="modal-title">{{data.display_name}}</h3>' +
			'</div>' +
			'<div class="modal-body">' +
				'<div class="panel panel-default">' +
					'<div class="panel-body">' +
						'<form name = "formView">' +
							'<form-fields objecttypename="object_type.name" dataitem="data"></form-fields>' +
						'</form>' +
					'</div>' +
				'</div>' +
			'</div>' +
			'<div class="modal-footer">' +
				'<button class="btn btn-primary" ng-click="ok()">OK</button>' +
				'<button class="btn btn-warning" ng-click="cancel()">Cancel</button>' +
			'</div>',
		controller: function ($routeParams, $scope, $http, $rootScope, appSettings) {
						
						var self = this;
						
						var serviceRootURL = appSettings.serviceRootURL;
						
						$http({
							method: 'GET',
							url: serviceRootURL + '/' + $rootScope.object_type + '/' + $rootScope.object_id
						}).then(function successCallback(response) {
									$scope.data = response.data;
									$http({
										method: 'GET',
										url: serviceRootURL + '/system_object/' + $scope.data.object_type
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
							$http({
								method: 'PUT',
								url: serviceRootURL + '/' + $rootScope.object_type + '/' + $rootScope.object_id,
								headers: {
								   'content-type':'application/json'
								},
								data: $scope.data
							}).then(function successCallback(response) {
								modalInstance.close($scope.data.name);
							  }, function errorCallback(response) {
								// called asynchronously if an error occurs
								// or server returns response with an error status.
							  });
						};

						$scope.cancel = function () {
							modalInstance.dismiss('cancel');
						};
					}
	});
	
module.component('formFields', {
		template: 
		'<div ng-repeat="field in object_type.fields">' +

			'<div ng-switch on="field.data_type.object_type">' +
				'<div class="animate-switch" ng-switch-when="string">' +
					'<div ng-if="field.source" class="form-group">' +
						'<label>{{field.display_name}}</label>' +
						'<select class="form-control" ng-model="data[field.name]" ng-options="o as o for o in field.source"></select>' +
					'</div>' +
					'<div ng-if="!field.source" class="form-group">' +
						'<label>{{field.display_name}}</label>' +
						'<input ng-model = "data[field.name]" class="form-control" type = "text" placeholder="{{field.description}}"/>' +
					'</div>' +
				'</div>' +
				'<div class="animate-switch" ng-switch-when="integer">' +
					'<div ng-if="field.source" class="form-group">' +
						'<label>{{field.display_name}}</label>' +
						'<select class="form-control" ng-model="data[field.name]" ng-options="o as o for o in field.source"></select>' +
					'</div>' +
					'<div ng-if="!field.source" class="form-group">' +
						'<label>{{field.display_name}}</label>' +
						'<input ng-model = "data[field.name]" class="form-control" type = "text" placeholder="{{field.description}}"/>' +
					'</div>' +
				'</div>' +
				'<div class="animate-switch" ng-switch-when="boolean">' +
					'<div class="form-group">' +
						'<label>{{field.display_name}}</label>&nbsp;&nbsp;' +
						'<div class="btn-group">' +
							'<label class="btn btn-primary" ng-model="data[field.name]" uib-btn-radio="true">Yes</label>' +
							'<label class="btn btn-primary" ng-model="data[field.name]" uib-btn-radio="false">No</label>' +
						'</div>' +
					'</div>' +
				'</div>' +
				'<div class="animate-switch" ng-switch-default>' +
					'<div ng-if="field.data_type.multiplicity == \'many\'">' +
						'<p>' +
							'<label>{{field.display_name}}</label> &nbsp;' +
						'</p>' +
					'</div>' +
					'<div ng-if="data[field.name]">' +
						'<uib-accordion close-others="true">' +
							/*
							'<uib-accordion-group ng-if="field.data_type.multiplicity == \'many\'" heading="{{item.display_name}}" ng-repeat="item in data[field.name]">' +
								'<form-fields objecttypename="field.data_type.object_type" dataitem="item"></form-fields>' +
							'</uib-accordion-group>' +
							'<uib-accordion-group ng-if="field.data_type.multiplicity == \'one\'" heading="{{field.display_name}}">' +
								'<form-fields objecttypename="field.data_type.object_type" dataitem="data[field.name]"></form-fields>' +
							'</uib-accordion-group>' +
							*/
							'<div uib-accordion-group ng-init="status = {isOpen: false}" is-open="status.isOpen" ng-class="{true:\'panel-primary\', false:\'panel-default\'}[status.isOpen]" ng-if="field.data_type.multiplicity == \'many\'" heading="{{item.display_name}}" ng-repeat="item in data[field.name]">' +
								'<form-fields objecttypename="field.data_type.object_type" dataitem="item"></form-fields>' +
							'</div>' +
							'<div uib-accordion-group ng-init="status = {isOpen: false}" is-open="status.isOpen" ng-class="{true:\'panel-primary\', false:\'panel-default\'}[status.isOpen]" ng-if="field.data_type.multiplicity == \'one\'" heading="{{field.display_name}}">' +
								'<form-fields objecttypename="field.data_type.object_type" dataitem="data[field.name]"></form-fields>' +
							'</div>' +
							
							
						'</uib-accordion>' +
					'</div>' +
					
					'<div ng-if="field.data_type.multiplicity == \'many\'">' +
						'<p>' +
							'<button class="btn" ng-click="addNew(field.name, field.data_type.object_type)">Add {{field.display_name}}</button>' +
						'</p>' +
					'</div>' +
				'</div>' +
				
			'<div>',
		bindings: {
			objecttypename: '=',
			dataitem: '='
		},
		controller: function ($routeParams, $scope, $http, $rootScope, appSettings) {
						
						var self = this;
						
						var serviceRootURL = appSettings.serviceRootURL;
						
						var objecttypenameWatch = $scope.$watch('$ctrl.objecttypename',
						  function(newValue) {
							if (angular.isString(newValue)) {
								$http({
								  method: 'GET',
								  url: serviceRootURL + '/system_object/' + newValue
								}).then(function successCallback(response) {
											$scope.object_type = response.data;
								  }, function errorCallback(response) {
										alert(response);
								  });
								
								objecttypenameWatch();
							}
						  });
						
						var dataitemWatch = $scope.$watch('$ctrl.dataitem',
						  function(newValue) {
							if (newValue) {
								$scope.data = newValue;
								
								dataitemWatch();
							}
						  });
						 
						$scope.getFieldValue = function (fieldName) {
							return eval('data.' + fieldName);
						};
						
						$scope.addNew = function (fieldName, objectTypeName) {
							$http({
								  method: 'GET',
								  url: serviceRootURL + '/system_object'
								}).then(function successCallback(response) {
											var objectTypes = response.data;
											var object = $scope.createNew(objectTypes, objectTypeName);
											
											if(self.dataitem[fieldName] == undefined)
											{
												self.dataitem[fieldName] = []; 
											}
											self.dataitem[fieldName].push(object);
											
								  }, function errorCallback(response) {
										alert(response);
								  });
							
						};
						
						$scope.createNew = function(objectTypes, objectTypeName)
						{	
							var object_type = $rootScope.getById(objectTypes, objectTypeName);
							var result = {};
							
							for(var i = 0; i < object_type.fields.length; i ++)
							{
								var field = object_type.fields[i];
								if(field.data_type.object_type == 'string')
								{
									if(field.data_type.multiplicity == 'one')
									{
										if(field.name == 'display_name')
										{
											result[field.name] = 'New ' + object_type.display_name;
										}
										else
										{
											result[field.name] = field.default ? field.default : '';
										}
									}
									else if(field.data_type.multiplicity == 'many')
									{
										result[field.name] = [''];
									}
								}
								else if(field.data_type.object_type == 'integer')
								{
									if(field.data_type.multiplicity == 'one')
									{
										result[field.name] = 0;	
									}
									else if(field.data_type.multiplicity == 'many')
									{
										result[field.name] = [0];
									}
								}
								else if(field.data_type.object_type == 'boolean')
								{
									if(field.data_type.multiplicity == 'one')
									{
										result[field.name] = field.default ? field.default : false;
									}
									else if(field.data_type.multiplicity == 'many')
									{
										result[field.name] = [false];
									}
								}
								else
								{
									var object = null;
									if(field.required)
									{
										object = $scope.createNew(objectTypes, field.data_type.object_type);
									}
									
									if(field.data_type.multiplicity == 'one')
									{
										result[field.name] = object;
									}
								}
							}
							
							return result;

						}
					}
	});

module.config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
  $locationProvider.hashPrefix('!');

  //$routeProvider.otherwise({redirectTo: '/system_object_types'});
}]);
