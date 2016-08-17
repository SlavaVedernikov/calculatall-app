'use strict';

angular.module('myApp.settings', []).constant('appSettings', {serviceRootURL: 'http://127.0.0.1:8181'});
								  
// Declare app level module which depends on views, and components
var module = angular.module('myApp', [
  'ngRoute',
  'viewhead',
  'datatables',
  //'datatables.bootstrap',
  //'datatables.colvis',
  'datatables.buttons',
  'ui.bootstrap',
  'myApp.settings',
  'myApp.moduleLoader'
]);

var modalInstance = {};
var object_type = '';
var object_id = '';
var owner = '';
var application = '';
var tenant = '';

module.run(function($rootScope, appSettings){
	$rootScope.getById = function(data, id){		
		for (var i = 0; i < data.length; i++) {
			if(data[i].id == id) return data[i];
		}
	};
	
	$rootScope.getByName = function(data, name){		
		for (var i = 0; i < data.length; i++) {
			if(data[i].name == name) return data[i];
		}
	};
	
	$rootScope.getAPIRootURL = function(){		
		return appSettings.serviceRootURL + '/' + $rootScope.owner + '/' + $rootScope.application + '/' + $rootScope.tenant;
	};
	
	$rootScope.createNewObject = function(objectTypes, objectTypeName){	
		var object_type = $rootScope.getByName(objectTypes, objectTypeName);
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
					else if(field.name == 'object_type')
					{
						result[field.name] = object_type.name;
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
					if(field.data_type.multiplicity == 'one')
					{
						if(field.data_type.association_type == 'embed')
						{
							object = $rootScope.createNewObject(objectTypes, field.data_type.object_type);
							result[field.name] = object;
						}
						else if(field.data_type.association_type == 'link')
						{
							result[field.name] = '';
						}
					}
					else if(field.data_type.multiplicity == 'many')
					{
						result[field.name] = [];
					}
				}
				
				
			}
		}
		
		return result;

	};
});

module.component('navigationView', {
		template:
		'<div class="navbar-default sidebar" role="navigation">' +
                '<div class="sidebar-nav navbar-collapse">' +
                    '<ul class="nav" id="side-menu">' +
                        '<li class="sidebar-search">' +
                            '<div class="input-group custom-search-form">' +
                                '<input type="text" class="form-control" placeholder="Search...">' +
                                '<span class="input-group-btn">' +
                                    '<button class="btn btn-default" type="button">' +
                                        '<i class="fa fa-search"></i>' +
                                    '</button>' +
                                '</span>' +
                            '</div>' +
                            '<!-- /input-group -->' +
                        '</li>' +
						'<li ng-if="pages" ng-repeat="page in pages">' +
							'<a href="{{\'#!/\' + owner + \'/\' + application + \'/\' + tenant + \'/\' + page.id}}"><i class="fa fa-gear fa-fw"></i>&nbsp;{{page.display_name}}</a>' +
						'</li>' +
                    '</ul>' +
               '</div>' +
                '<!-- /.sidebar-collapse -->' +
            '</div>' +
            '<!-- /.navbar-static-side -->',
		controller: function ($routeParams, $scope, $http, $rootScope, appSettings) {
		
			var serviceRootURL = $rootScope.getAPIRootURL();
			$scope.pages = null;
			$scope.owner = $rootScope.owner;
			$scope.application = $rootScope.application;
			$scope.tenant = $rootScope.tenant;
			
			$http({
				method: 'GET',
				url: serviceRootURL + '/page'
				}).then(function successCallback(response) {
						$scope.pages = response.data;
				}, function errorCallback(response) {
					alert(response);
				});
		}
						
	});

module.component('gridView', {
		template: '<div>' +
			'<table datatable="" dt-options="$ctrl.dtOptions" dt-columns="$ctrl.dtColumns" dt-instance="$ctrl.dtIntanceCallback" class="row-border hover"></table>' +
			'</div>',
		bindings: {
			view: '='
		},
		controller: function (DTOptionsBuilder, DTColumnBuilder, $routeParams, $scope, $http, $compile, $uibModal, $rootScope, appSettings) {
						
						var self = this;
						
						var serviceRootURL = $rootScope.getAPIRootURL();

						self.edit = edit;
						self.delete = deleteRow;
						self.dtInstance = {};
						
						self.dtIntanceCallback = function (instance) {
							self.dtInstance = instance;
						}
	
						self.dtOptions = DTOptionsBuilder.fromSource(serviceRootURL + '/' + this.view.source_object_type + ((this.view.query != undefined) ? '?query=' + this.view.query : ''))
							.withPaginationType('full_numbers')
							.withDisplayLength(this.view.page_size)
							.withOption('createdRow', createdRow)
							.withOption('responsive', true)
							.withOption('colReorder', true)
							.withOption('dom', 'C<"clear">lfrtip')
							//Look at styling, it's too dark at the moment
							//.withOption('select', true)
							.withButtons([{
									text: 'Add new',
									key: '1',
									action: function (e, dt, node, config) {
												add(self.view.source_object_type);
											}
								}
							]);

							self.dtColumns = [];

						
						for (var i = 0; i < this.view.fields.length; i++) {
							var obj = DTColumnBuilder.newColumn(this.view.fields[i].source_name)
								.withTitle(this.view.fields[i].display_name)
								.withOption('defaultContent', 'n/a');

							self.dtColumns.push(obj);
						}
						
						self.dtColumns.push(DTColumnBuilder.newColumn(null).withTitle('Actions').notSortable()
							.renderWith(actionsHtml));
						
						function add(object_type) {
							$rootScope.object_type = object_type;
							openModal();
						}
						
						function edit(id, object_type) {
							$rootScope.object_type = object_type;
							$rootScope.object_id = id;
							openModal();
						}
						
						function deleteRow(id, object_type) {
						
							var serviceRootURL = $rootScope.getAPIRootURL();
							
							$http({
								method: 'DELETE',
								url: serviceRootURL + '/' + object_type + '/' + id,
							}).then(function successCallback(response) {
									self.dtInstance.reloadData();
							  }, function errorCallback(response) {
									alert(response);
							  });
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
							
							modalInstance.closed.then(function (data) {
								$rootScope.object_type = '';
								$rootScope.object_id = '';
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
							
							return 	'<button class="btn btn-warning" ng-click="$ctrl.edit(\'' + data.id + '\', \'' + data.object_type + '\')">' +
									'   <i class="fa fa-edit"></i>' +
									'</button>&nbsp;' +
									'<button class="btn btn-danger" ng-click="$ctrl.delete(\'' + data.id + '\', \'' + data.object_type + '\')">' +
									'   <i class="fa fa-trash-o"></i>' +
									'</button>';
						}
					}
	});
	
module.component('formView', {
		template: 
			'<div class="modal-header">' +
				'<h3 class="modal-title">{{object_type.display_name}}</h3>' +
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
						
						var serviceRootURL = $rootScope.getAPIRootURL();
						
						$http({
							method: 'GET',
							url: serviceRootURL + '/system_object/?query=@.name==\'' + $rootScope.object_type + '\''
							}).then(function successCallback(response) {
										$scope.object_type = response.data[0];
							}, function errorCallback(response) {
								// called asynchronously if an error occurs
								// or server returns response with an error status.
							  }); 
						
						if($rootScope.object_id != undefined && $rootScope.object_id != '')
						{
							$http({
								method: 'GET',
								url: serviceRootURL + '/' + $rootScope.object_type + '/' + $rootScope.object_id
							}).then(function successCallback(response) {
										$scope.data = response.data;
								}, function errorCallback(response) {
									// called asynchronously if an error occurs
									// or server returns response with an error status.
								});
						}
						else
						{
							$http({
								 method: 'GET',
								 url: serviceRootURL + '/system_object'
							}).then(function successCallback(response) {
										var objectTypes = response.data;
										var object = $rootScope.createNewObject(objectTypes, $rootScope.object_type);
										
										$scope.data = object;
								}, function errorCallback(response) {
										alert(response);
								});
						}

						$scope.getFieldValue = function (fieldName) {
							return eval('data.' + fieldName);
						};
						
						$scope.ok = function () {
							if($rootScope.object_id != undefined && $rootScope.object_id != '')
							{
								$http({
									method: 'PUT',
									url: serviceRootURL + '/' + $rootScope.object_type + '/' + $rootScope.object_id,
									headers: {
									   'content-type':'application/json'
									},
									data: $scope.data
								}).then(function successCallback(response) {
									modalInstance.close($scope.data.id);
								  }, function errorCallback(response) {
									// called asynchronously if an error occurs
									// or server returns response with an error status.
								  });
							}
							else
							{
								$http({
									method: 'POST',
									url: serviceRootURL + '/' + $rootScope.object_type,
									headers: {
									   'content-type':'application/json'
									},
									data: $scope.data
								}).then(function successCallback(response) {
									modalInstance.close($scope.data.id);
								  }, function errorCallback(response) {
									// called asynchronously if an error occurs
									// or server returns response with an error status.
								  });
							}
						};

						$scope.cancel = function () {
							modalInstance.dismiss('cancel');
						};
					}
	});
	
module.component('formFields', {
		template: 
		'<div ng-if="data" ng-repeat="field in object_type.fields">' +

			'<div ng-switch on="field.data_type.object_type">' +
				'<div class="animate-switch" ng-switch-when="string">' +
					'<div ng-if="field.data_type.multiplicity==\'many\'" class="form-group">' +
						'<label>{{field.display_name}}</label>' +
						'<input ng-model = "data[field.name]" class="form-control" type = "text" ng-list placeholder="{{field.description}}"/>' +
					'</div>' +
					'<div ng-if="field.data_type.multiplicity==\'one\' && field.source" class="form-group">' +
						'<label>{{field.display_name}}</label>' +
						'<select class="form-control" ng-model="data[field.name]" ng-options="o as o for o in field.source"></select>' +
					'</div>' +
					'<div ng-if="field.data_type.multiplicity==\'one\' && !field.source" class="form-group">' +
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
					'<div ng-if="field.data_type.association_type == \'embed\'">' +
						'<p>' +
							'<label>{{field.display_name}}</label> &nbsp;' +
						'</p>' +
						'<p ng-if="!data[field.name] || (field.data_type.multiplicity == \'many\' && data[field.name].length == 0)">' +
							'No {{field.display_name}} found.' +
						'</p>' +
						'<div ng-if="data[field.name]">' +
							'<uib-accordion close-others="true">' +
								'<div uib-accordion-group ng-if="field.data_type.multiplicity == \'many\'" ng-repeat="item in data[field.name]" ng-init="status = {isOpen: false}" is-open="status.isOpen" ng-class="{true:\'panel-primary\', false:\'panel-default\'}[status.isOpen]">' +
									'<uib-accordion-heading>' +
										'<button class="btn btn-danger btn-xs pull-right" ng-click="remove(field.name, $index, $event)" ng-show="!status.isOpen">' +
											'<i class="fa fa-trash-o"></i>' +
										'</button>' +
										'<button class="btn btn-primary btn-xs pull-right" ng-click="moveUp(field.name, $index, $event)" ng-show="!status.isOpen && !$first">' +
											'<i class="fa fa-long-arrow-up"></i>' +
										'</button>' +
										'<button class="btn btn-primary btn-xs pull-right" ng-click="moveDown(field.name, $index, $event)" ng-show="!status.isOpen && !$last">' +
											'<i class="fa fa-long-arrow-down"></i>' +
										'</button>' +
										'{{item.display_name ? item.display_name : field.display_name  + \' \' + ($index + 1)}}' +
									'</uib-accordion-heading>' +
									'<form-fields objecttypename="field.data_type.object_type" dataitem="item"></form-fields>' +
								'</div>' +
								'<div uib-accordion-group ng-if="field.data_type.multiplicity == \'one\' && (field.data_type.association_type == undefined || field.data_type.association_type == \'embed\')" heading="{{field.display_name}}" ng-init="status = {isOpen: false}" is-open="status.isOpen" ng-class="{true:\'panel-primary\', false:\'panel-default\'}[status.isOpen]">' +
									'<form-fields objecttypename="field.data_type.object_type" dataitem="data[field.name]"></form-fields>' +
								'</div>' +
							'</uib-accordion>' +
						'</div>' +
						'<div ng-if="field.data_type.multiplicity == \'many\' || (field.data_type.multiplicity == \'one\' && !data[field.name])">' +
							'<p>' +
								'<button class="btn" ng-click="addNew(field.name, field.data_type.object_type, field.data_type.multiplicity)">Add {{field.display_name}}</button>' +
							'</p>' +
						'</div>' +
					'</div>' +
					
					
					'<div ng-if="field.data_type.association_type == \'link\' && field.data_type.multiplicity == \'one\'" class="form-group">' +
						'<label>{{field.display_name}}</label>' +
						'<lookup-field objecttypename="field.data_type.object_type" id="(data[field.name] ? data[field.name] : \'\')" dataitem="data" fieldname="field.name"></lookup-field>' +
					'</div>' +
					
				'</div>' +
				
			'<div>',
		bindings: {
			objecttypename: '=',
			dataitem: '='
		},
		controller: function ($routeParams, $scope, $http, $rootScope, appSettings) {
						
						var self = this;
						
						var serviceRootURL = $rootScope.getAPIRootURL();
						
						var dataitemWatch = $scope.$watch('$ctrl.dataitem',
						  function(newValue) {
							if (newValue) {
								if(newValue != '')
								{
									$scope.data = newValue;
								}
								
								$scope.synchBindings();
								dataitemWatch();
							}
						  });
						
						var objecttypenameWatch = $scope.$watch('$ctrl.objecttypename',
						  function(newValue) {
							if (angular.isString(newValue)) {
								$http({
								  method: 'GET',
								  url: serviceRootURL + '/system_object/?query=@.name==\'' + newValue + '\''
								}).then(function successCallback(response) {
											$scope.object_type = response.data[0];
											
											$scope.synchBindings();
											
								  }, function errorCallback(response) {
										alert(response);
								  });
								 
								objecttypenameWatch();
							}
						  });
						 
						$scope.synchBindings = function () {
						
							if(angular.isString(self.objecttypename) && self.dataitem == '')
							{
								//objecttypename was set to a valid value and dataitem was set to null
								$http({
								  method: 'GET',
								  url: serviceRootURL + '/system_object'
								}).then(function successCallback(response) {
											var objectTypes = response.data;
											var object = $rootScope.createNewObject(objectTypes, self.objecttypename);
											$scope.data = object;
								  }, function errorCallback(response) {
										alert(response);
								  });
							}
						};
						
						$scope.getFieldValue = function (fieldName) {
							return eval('data.' + fieldName);
						};
						
						$scope.addNew = function (fieldName, objectTypeName, multiplicity) {
							$http({
								  method: 'GET',
								  url: serviceRootURL + '/system_object'
								}).then(function successCallback(response) {
											var objectTypes = response.data;
											var object = $rootScope.createNewObject(objectTypes, objectTypeName);
											
											if(multiplicity == 'many')
											{
												if($scope.data[fieldName] == undefined)
												{
													$scope.data[fieldName] = []; 
												}
												$scope.data[fieldName].push(object);
											}
											else if(multiplicity == 'one')
											{
												$scope.data[fieldName] = object;
											}
											
								  }, function errorCallback(response) {
										alert(response);
								  });
							
						};
						
						$scope.remove = function(fieldName, idx, e) {
							if (e) {
							  e.preventDefault();
							  e.stopPropagation();
							}

							$scope.data[fieldName].splice(idx, 1);
						};
						
						$scope.moveUp = function(fieldName, idx, e) {
							if (e) {
							  e.preventDefault();
							  e.stopPropagation();
							}
							
							$scope.data[fieldName][idx - 1] = $scope.data[fieldName].splice(idx, 1, $scope.data[fieldName][idx - 1])[0];
						};
						
						$scope.moveDown = function(fieldName, idx, e) {
							if (e) {
							  e.preventDefault();
							  e.stopPropagation();
							}
							$scope.data[fieldName][idx + 1] = $scope.data[fieldName].splice(idx, 1, $scope.data[fieldName][idx + 1])[0];
						};
					}
	});
	
module.component('lookupField', {
		template: 
		'<select class="form-control" ng-model="data[field]" ng-options="item.id as item.display_name for item in source"></select>',
		bindings: {
			objecttypename: '=',
			id: '=',
			dataitem: '=',
			fieldname: '='
		},
		controller: function ($routeParams, $scope, $http, $rootScope, appSettings) {
						
						var self = this;
						
						var serviceRootURL = $rootScope.getAPIRootURL();
						
						$scope.source = null;
						
						var dataitemWatch = $scope.$watch('$ctrl.dataitem',
						  function(newValue) {
							if (newValue) {
								$scope.synchBindings();
								
								dataitemWatch();
							}
						  });
						  
						var fieldnameWatch = $scope.$watch('$ctrl.fieldname',
						  function(newValue) {
							if (angular.isString(newValue)) {
								$scope.synchBindings();

								fieldnameWatch();
							}
						  });
						  
						var idWatch = $scope.$watch('$ctrl.id',
						  function(newValue) {
							if (angular.isString(newValue)) {
								$scope.synchBindings();

								idWatch();
							}
						  });
						
						var objecttypenameWatch = $scope.$watch('$ctrl.objecttypename',
						  function(newValue) {
							if (angular.isString(newValue)) {
								$scope.synchBindings();	
								
								objecttypenameWatch();
							}
						  });
						
						$scope.bindingsSynched = false;
						
						$scope.synchBindings = function () {
						
							if(angular.isString(self.objecttypename) && angular.isString(self.id) && self.dataitem && angular.isString(self.fieldname) && !$scope.bindingsSynched)
							{
								$scope.data = self.dataitem;
								$scope.field = self.fieldname;
								
								$http({
								  method: 'GET',
								  url: serviceRootURL + '/' + self.objecttypename
								}).then(function successCallback(response) {
											$scope.source = response.data;
								  }, function errorCallback(response) {
										alert(response);
								  });
								
								$scope.bindingsSynched = true;
							}
						};
					}
	});

module.config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
  $locationProvider.hashPrefix('!');
}]);

	
angular.module('myApp.moduleLoader', ['ngRoute'])
	.config(['$routeProvider', function($routeProvider) {
		$routeProvider.when('/:owner/:application/:tenant', {
			templateUrl: 'page.html',
			controller: function($scope, $routeParams, $http, $rootScope, appSettings) {
				var self = this;
				
				$scope.page = null;
				$rootScope.owner = $routeParams.owner;
				$rootScope.application = $routeParams.application;
				$rootScope.tenant = $routeParams.tenant;
				
			}
	  });
	  
		$routeProvider.when('/:owner/:application/:tenant/:page', {
		templateUrl: 'page.html',
			controller: function($scope, $routeParams, $http, $rootScope, appSettings) {
				var self = this;
				
				$scope.page = null;
				$rootScope.owner = $routeParams.owner;
				$rootScope.application = $routeParams.application;
				$rootScope.tenant = $routeParams.tenant;
				
				var serviceRootURL = $rootScope.getAPIRootURL();
				
				$http({
					method: 'GET',
					url: serviceRootURL + '/page/' + $routeParams.page
					}).then(function successCallback(response) {
							$scope.page = response.data;
					}, function errorCallback(response) {
						alert(response);
					});
			}
	  });
	}]);
 
