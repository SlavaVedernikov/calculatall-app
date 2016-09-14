'use strict';

var env = {};

// Import variables if present (from env*.js)
if(window){  
  Object.assign(env, window.__env);
}

angular.module('myApp.settings', []).constant('appSettings', env);
						  
// Declare app level module which depends on views, and components
var module = angular.module('myApp', [
  'ngRoute',
  'viewhead',
  'datatables',
  //'datatables.bootstrap',
  //'datatables.colvis',
  'datatables.buttons',
  'ui.bootstrap',
  'ui-notification',
  'myApp.settings',
  'myApp.moduleLoader'
]);
 

var modalInstance = {};
var object_type = '';
var object_id = '';
var owner = '';
var application = '';
var tenant = '';

module.run(function($rootScope, appSettings, Notification){
	
	$rootScope.getAPIRootURL = function(){	
		var result = '';
		
		if($rootScope.app)
		{
			result = appSettings.serviceRootURL + '/' + $rootScope.tenant + '/' + $rootScope.app.name + '/' + $rootScope.tenant;
		}
		else
		{
			result = appSettings.serviceRootURL + '/' + $rootScope.owner + '/' + $rootScope.application + '/' + $rootScope.tenant;
		}
		

		return result;
	};
	
	$rootScope.showAlert = function(message, type){	
		var title;
		var icon = '';
		switch (type){
			case 'error':
				title = 'Unable to complete request.';
				icon = 'glyphicon glyphicon-exclamation-sign';
				break;
			case 'warning':
				title = 'All done, read the note below.';
				icon = 'glyphicon glyphicon-warning-sign';
				break;
			case 'success':
				title = 'Success.';
				icon = 'glyphicon glyphicon-ok';
				break;
			default:
				title = 'Important!'
				icon = 'glyphicon glyphicon-info-sign';
		}
		
		var titleHtml = '<span class="' + icon + '" aria-hidden="true"></span>&nbsp;&nbsp;' + title;
		//var titleHtml = title;
		 
		message = ((message == '') ? 'Unexpected error. We are looking into it.' : message);
		Notification({title: titleHtml, message: message}, type);
	};
	
	$rootScope.getLength = function(data){		
		var result = 0;
		
		if(angular.isString(data))
		{
			result = data.length;
		}
		
		return result
	};
	
	$rootScope.getById = function(data, id){		
		for (var i = 0; i < data.length; i++) {
			if(data[i]._id == id) return data[i];
		}
	};
	
	$rootScope.getByName = function(data, name){		
		for (var i = 0; i < data.length; i++) {
			if(data[i].name == name) return data[i];
		}
	};
	
	$rootScope.getByValue = function(data, value){		
		for (var i = 0; i < data.length; i++) {
			if(data[i].value == value) return data[i];
		}
	};
	
	$rootScope.getByKey = function(data, key){		
		for (var i = 0; i < data.length; i++) {
			if(data[i].key == key) return data[i];
		}
	};
	
	$rootScope.getUntokenisedString = function(s, token, source){
		var regex = new RegExp('\\{' + token + '.' + '\\w+\\}', "g");
		var match = s.match(regex);
		
		for (var i = 0; i < match.length; i++)
		{
			s = s.replace(match[i], source[match[i].replace('{context.', '').replace('}', '')]);
		}
		
		return s;
	};
	
	$rootScope.getFormattedString = function(str, args) {
        if (!args)
            return str;

        for (var arg in args)
            str = str.replace(RegExp("\\{" + arg + "\\}", "gi"), args[arg]);
        return str;
    };
	
	$rootScope.getFormErrorFlag = function(validation_rule_definition_name) {
        var result;
		
		switch (validation_rule_definition_name){
			case 'maximum_length':
				result = 'maxlength';
				break;
			case 'minimum_length':
				result = 'minlength';
				break;
			case 'required':
				result = 'required';
				break;
			default:
				result = '';
		}
		
		return result;
    };
	
	$rootScope.createNewObjectOfTypeId = function(object_type_id) {
		var object_type = $rootScope.getById($rootScope.object_types, object_type_id);
		return $rootScope.createNewObjectOfType(object_type);
	};
	
	$rootScope.createNewObjectOfType = function(object_type){	
		
		var result = (object_type.fields && object_type.fields.length > 0) ? {} : null;
		
		for(var i = 0; object_type.fields && i < object_type.fields.length; i ++)
		{
			var field = object_type.fields[i];
			var field_object_type = $rootScope.getById($rootScope.object_types, field.data_type.object_type);
			
			if(field_object_type.name == 'string' || field_object_type.name == 'large_string')
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
			else if(field_object_type.name == 'integer')
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
			else if(field_object_type.name == 'boolean')
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
							object = $rootScope.createNewObjectOfTypeId(field.data_type.object_type);
							result[field.name] = object;
						}
						else if(field.data_type.association_type == 'link' || field.data_type.association_type == 'delegate')
						{
							result[field.name] = field.default ? field.default : '';
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
						'<li ng-if="navigation" ng-repeat="item in navigation.menu_items">' +
							'<a href="{{\'#!/\' + owner + \'/\' + application + \'/\' + tenant + \'/\' + item.page + (app ? \'?app=\' + app : \'\')}}"><i class="fa fa-gear fa-fw"></i>&nbsp;{{item.display_name}}</a>' +
						'</li>' +
                    '</ul>' +
               '</div>' +
                '<!-- /.sidebar-collapse -->' +
            '</div>' +
            '<!-- /.navbar-static-side -->',
		controller: function ($routeParams, $scope, $http, $location, $rootScope, appSettings) {
		
			var serviceRootURL = $rootScope.getAPIRootURL();
			$scope.menu_items = null;
			$scope.owner = $rootScope.owner;
			$scope.application = $rootScope.application;
			$scope.tenant = $rootScope.tenant;
			$scope.navigation = null;
			
			var query = $location.search();
			$scope.app = query.app;
			
			$http({
				method: 'GET',
				url: serviceRootURL + '/application?query=@.name==\'' + $rootScope.application + '\''
				}).then(function successCallback(response) {
						$scope.navigation = response.data[0].navigation;
				}, function errorCallback(response) {
					$rootScope.showAlert(response.statusText, 'error');
				});			
			
		}
						
	});

module.component('tableView', {
		template: '<div>' +
			'<table datatable="" dt-options="$ctrl.dtOptions" dt-columns="$ctrl.dtColumns" dt-instance="$ctrl.dtIntanceCallback" class="row-border hover"></table>' +
			'</div>',
		bindings: {
			view: '='
		},
		controller: function (DTOptionsBuilder, DTColumnBuilder, $routeParams, $scope, $http, $q, $compile, $uibModal, $rootScope, appSettings) {
						
						var self = this;
						
						var serviceRootURL = $rootScope.getAPIRootURL();

						self.edit = edit;
						self.delete = deleteRow;
						self.dataPromise = dataPromise;
						self.dtInstance = {};
						self.renderActions = renderActions;
						self.renderValue = renderValue;
						self.DTColumnBuilder = DTColumnBuilder;
						self.DTOptionsBuilder = DTOptionsBuilder;
						
						self.view_object_type = null;
						
						self.view_param = '';
						
						for(var i = 0; i < self.view.fields.length; i++)
						{
							if(self.view_param != '')
							{
								self.view_param += ',';
							}
							self.view_param += self.view.fields[i].source_path;
							self.view_param += '|';
							//TODO: Refactor the replacement e.g. add a calculated alias attribute to a view_field type that would do the replacement
							self.view_param += self.view.fields[i].source_path.replace(/\./g,"_");
						}
						
						self.dtColumns = columnsPromise();
						
						self.dtOptions = self.DTOptionsBuilder.fromFnPromise(self.dataPromise)
							.withPaginationType('full_numbers')
							//Set default page size to 10
							.withDisplayLength((self.view.page_size) ? Number(self.view.page_size) : 10)
							//.withDisplayLength(10)
							.withOption('createdRow', createdRow)
							//.withOption('responsive', true)
							//.withOption('colReorder', true)
							//.withOption('dom', 'C<"clear">lfrtip')
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
							
						self.dtIntanceCallback = function (instance) {
							self.dtInstance = instance;
						}		  
								
						
						function columnsPromise(){
							var dfd = $q.defer();
							
							var serviceRootURL = $rootScope.getAPIRootURL();
							
							$http({
								method: 'GET',
								url: serviceRootURL + '/object_types/' + self.view.source_object_type + '/?view=' + self.view_param
								}).then(function successCallback(response) {
										self.view_object_type = response.data;
										
										var columns = [];
								
										for(var i = 0; i < self.view.fields.length; i++) {
											//TODO: Change to use '@' as path field separator
											var field_name = self.view.fields[i].source_path.replace(/\./g,"_");
											var field = $rootScope.getByName(self.view_object_type.fields, field_name);
											var field_object_type = $rootScope.getById($rootScope.object_types, field.data_type.object_type);
											
											var column_type = 'string'
											
											if(field_object_type)
											{
												switch(field_object_type.name) {
													case 'string':
														column_type = 'string';
														break;
													case 'integer':
														column_type = 'num';
														break;
													default:
														column_type = 'string';
												}
											}
											
											
											//TODO: Refactor the replacement e.g. add a calculated alias attribute to a view_field type that would do the replacement
											var column = self.DTColumnBuilder.newColumn(field_name)
												.withTitle(self.view.fields[i].display_name)
												.withOption('defaultContent', 'n/a')
												.withOption('type', column_type)
												.renderWith(self.renderValue);

											columns.push(column);
										}
										
										columns.push(self.DTColumnBuilder.newColumn(null).withTitle('Actions').notSortable()
											.renderWith(self.renderActions));
										
										dfd.resolve(columns);
										
									}, function errorCallback(response) {
											$rootScope.showAlert(response.statusText, 'error');
									  });
									
							
							return dfd.promise;	  
						}
						
						function dataPromise() {
							var dfd = $q.defer();
							
							var serviceRootURL = $rootScope.getAPIRootURL();
							
							$http({
								method: 'GET',
								url: serviceRootURL + '/object_types/' + self.view.source_object_type
								}).then(function successCallback(response) {
										var object_type = response.data;
										var query = ((self.view.query && self.view.query != '') ? $rootScope.getUntokenisedString(self.view.query, 'context', $rootScope) : undefined);
										
										$http({
											method: 'GET',
											url: serviceRootURL + '/' + object_type.name + '/?view=' + self.view_param + (query ? '&query=' + query : ''),
										}).then(function successCallback(response) {
												self.data = response.data;
												dfd.resolve(self.data);
										  }, function errorCallback(response) {
												$rootScope.showAlert(response.statusText, 'error');
										  });
									}, function errorCallback(response) {
											$rootScope.showAlert(response.statusText, 'error');
									  });
							
							return dfd.promise;
						}
		
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
							method: 'GET',
							url: serviceRootURL + '/object_types/' + object_type
							}).then(function successCallback(response) {
										var object_type = response.data;
										
										$http({
											method: 'DELETE',
											url: serviceRootURL + '/' + object_type.name + '/' + id,
										}).then(function successCallback(response) {
												self.dtInstance.reloadData();
												$rootScope.showAlert('Object is deleted', 'success');
										  }, function errorCallback(response) {
												$rootScope.showAlert(response.statusText, 'error');
										  });
							}, function errorCallback(response) {
								$rootScope.showAlert(response.statusText, 'error');
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
								$rootScope.showAlert((($rootScope.object_id != '') ? 'Object is successfully updated' : 'Object is successfully created'), 'success');
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
						
						function renderActions(data, type, full, meta) {
							return 	'<button class="btn btn-warning" ng-click="$ctrl.edit(\'' + data._id + '\', \'' + self.view.source_object_type + '\')">' +
									'   <i class="fa fa-edit"></i>' +
									'</button>&nbsp;' +
									'<button class="btn btn-danger" ng-click="$ctrl.delete(\'' + data._id + '\', \'' + self.view.source_object_type + '\')">' +
									'   <i class="fa fa-trash-o"></i>' +
									'</button>';
						}
						
						function renderValue(data, type, full, meta) {
							var result = data;
							
							var field = self.view_object_type.fields[meta.col];
							var field_valueLookup;
													
							if(field.source)
							{
								field_valueLookup = $rootScope.getByKey(field.source, data);
							}
							
							if(field_valueLookup)
							{
								result = (type == 'sort') ? field_valueLookup.value : field_valueLookup.display_name;
							}
							
							
							return result;
						}
					}
	});
	
module.component('formView', {
		template: 
		'<form name="userForm" novalidate>' +
			'<div class="modal-header">' +
				'<h3 class="modal-title">{{data.display_name}}</h3>' +
				'<h5 ng-if="data.display_name">{{object_type.display_name}}</h5>' +
			'</div>' +
			'<div class="modal-body">' +
				'<div class="panel panel-default">' +
					'<div class="panel-body">' +
						'<form name = "formView">' +
							'<form-fields objecttype="object_type._id" dataitem="data" path="path" form="userForm" submitted="submitted"></form-fields>' +
						'</form>' +
					'</div>' +
				'</div>' +
			'</div>' +
			'<div class="modal-footer">' +
				'<button class="btn btn-primary" ng-click="ok()">OK</button>' +
				'<button class="btn btn-warning" ng-click="cancel()">Cancel</button>' +
			'</div>' +
		'</form>',
		controller: function ($routeParams, $scope, $http, $rootScope, appSettings) {
						
						var self = this;
						$scope.submitted = false;
						var serviceRootURL = $rootScope.getAPIRootURL();
						
						$scope.path = '@';
						
						$http({
							method: 'GET',
							url: serviceRootURL + '/object_types/' + $rootScope.object_type
							}).then(function successCallback(response) {
										$scope.object_type = response.data;
										
										if($rootScope.object_id != undefined && $rootScope.object_id != '')
										{
											$http({
												method: 'GET',
												url: serviceRootURL + '/' + $scope.object_type.name + '/' + $rootScope.object_id
											}).then(function successCallback(response) {
														$scope.data = response.data;
												}, function errorCallback(response) {
													$rootScope.showAlert(response.statusText, 'error');
												});
										}
										else
										{
											$scope.data = $rootScope.createNewObjectOfTypeId($rootScope.object_type);
										}
							}, function errorCallback(response) {
								$rootScope.showAlert(response.statusText, 'error');
							  }); 

						$scope.getFieldValue = function (fieldName) {
							return eval('data.' + fieldName);
						};
						
						$scope.validate = function(userForm, data, object_type, path)
						{
							var validator = $rootScope;
							
							for(var i = 0; object_type.fields && i < object_type.fields.length; i++)
							{
								var field = object_type.fields[i];
								var field_path = path + '@' + field.name;
								
								for(var j = 0; field.validation_rules && j < field.validation_rules.length; j++)
								{
									var validation_rule = field.validation_rules[j];
									var validation_rule_definition = $rootScope.getById($rootScope.validation_rule_definitions, validation_rule.rule.id);
									var args = {};
									var expression = validation_rule_definition.rule_function.expression;
									
									for(var k = 0; validation_rule_definition.rule_function.parameters && 
									k < validation_rule_definition.rule_function.parameters.length; k++)
									{
										var parameter = validation_rule_definition.rule_function.parameters[k];
										var parameter_object_type = $rootScope.getById($rootScope.object_types, parameter.data_type.object_type);
										var value;
										
										if(parameter_object_type)
										{
											if(!parameter.hidden && validation_rule.rule.parameters)
											{
												var parameter_value = validation_rule.rule.parameters[parameter.name];
												
												if(parameter_value)
												{			
													if(parameter_object_type.name == 'field_value')
													{
														value = data[parameter_value];
													}
													else
													{
														value = parameter_value;
													}
												}
											}
											else
											{														
												if(parameter.default)
												{
													if(parameter_object_type.name == 'expression')
													{
														value = eval(parameter.default.replace('$', 'data[field.name]'));
													}
													else if(parameter_object_type.name == 'field_value')
													{
														value = data[parameter.default];
													}
													else
													{
														value = parameter.default;
													}
												}												
											}
										}
										
										args[parameter.name] = value;
									}
									
									expression = $rootScope.getFormattedString(expression, args).replace('$', 'data[field.name]');
									var result = eval(expression);
									
									userForm[field_path].$error[$rootScope.getFormErrorFlag(validation_rule_definition.name)] = (typeof result == "boolean" && !result) ? true : false;
									
									userForm[field_path].$invalid = (!userForm[field_path].$invalid && typeof result == "boolean" && !result) ? true : userForm[field_path].$invalid;
									
									userForm.$valid = ($scope.userForm.$valid && typeof result == "boolean" && !result) ? false : $scope.userForm.$valid;
									
								}
								
								if(data[field.name] && field.data_type.association_type == 'embed')
								{
									var field_object_type = $rootScope.getById($rootScope.object_types, field.data_type.object_type);
									
									if(field.data_type.multiplicity == "many")
									{
										for(var l = 0; l < data[field.name].length; l++)
										{
											$scope.validate(userForm, data[field.name][l], field_object_type, field_path + '@' + l);
										}
									}
									else if(field.data_type.multiplicity == "one")
									{
										$scope.validate(userForm, data[field.name], field_object_type, field_path);
									}
								}
							}
						}
						
						$scope.ok = function () {
							$scope.submitted = true;
							
							$scope.validate($scope.userForm, $scope.data, $scope.object_type, '@');
							
							$scope.$broadcast('show-errors-check-validity');
							
							if ($scope.userForm.$valid) {
								$http({
								method: 'GET',
								url: serviceRootURL + '/object_types/' + $rootScope.object_type
								}).then(function successCallback(response) {
											$scope.object_type = response.data;
											
											if($rootScope.object_id != undefined && $rootScope.object_id != '')
											{
												$http({
													method: 'PUT',
													url: serviceRootURL + '/' + $scope.object_type.name + '/' + $rootScope.object_id,
													headers: {
													   'content-type':'application/json'
													},
													data: $scope.data
												}).then(function successCallback(response) {
													modalInstance.close($scope.data._id);
												  }, function errorCallback(response) {
													$rootScope.showAlert(response.statusText, 'error');
												  });
											}
											else
											{
												$http({
													method: 'POST',
													url: serviceRootURL + '/' + $scope.object_type.name,
													headers: {
													   'content-type':'application/json'
													},
													data: $scope.data
												}).then(function successCallback(response) {
													modalInstance.close($scope.data._id);
												  }, function errorCallback(response) {
													$rootScope.showAlert(response.statusText, 'error');
												  });
											}
								}, function errorCallback(response) {
									$rootScope.showAlert(response.statusText, 'error');
								  }); 
								
								$scope.reset();
							}
							
						};

						$scope.reset = function() {
							
							$scope.$broadcast('show-errors-reset');
						}
  
						$scope.cancel = function () {
							modalInstance.dismiss('cancel');
						};
					}
	});
	
module.component('formFields', {
		templateUrl: 'templates/form-fields.html',
		bindings: {
			objecttype: '=',
			dataitem: '=',
			path: '=',
			form: '=',
			submitted: '='
		},
		controller: function ($routeParams, $scope, $http, $rootScope, appSettings) {
						
						var self = this;
						
						var serviceRootURL = $rootScope.getAPIRootURL();
						
						var submittedWatch = $scope.$watch('$ctrl.submitted',
						  function(newValue) {
							if (newValue) {								
								$scope.synchBindings();
								//submittedWatch();
							}
						  });
						  
						var formWatch = $scope.$watch('$ctrl.form',
						  function(newValue) {
							if (newValue) {								
								$scope.synchBindings();
								//formWatch();
							}
						  });
						  
						var pathWatch = $scope.$watch('$ctrl.path',
						  function(newValue) {
							if (angular.isString(newValue)) {								
								$scope.synchBindings();
								//pathWatch();
							}
						  });
						  
						var dataitemWatch = $scope.$watch('$ctrl.dataitem',
						  function(newValue) {
							if (newValue) {
								if(newValue != '')
								{
									$scope.data = newValue;
								}
								
								$scope.synchBindings();
								//dataitemWatch();
							}
						  });
						
						var objecttypeWatch = $scope.$watch('$ctrl.objecttype',
						  function(newValue) {
							if(newValue)
							{
								if (angular.isString(newValue)) {
									//Expected object type id
									$http({
										method: 'GET',
										url: serviceRootURL + '/object_types/' + newValue
										}).then(function successCallback(response) {
												$scope.object_type = response.data;											
										}, function errorCallback(response) {
											$rootScope.showAlert(response.statusText, 'error');
										});
								}
								else {
									//expected object type
									$scope.object_type = newValue;
								}
									
								$scope.validation_rule_definitions = $rootScope.validation_rule_definitions;
														
								$scope.synchBindings();
								//objecttypeWatch();
							}
						  });
						 
						$scope.bindingsSynched = false;
						
						//TODO: Consider using this.$onInit = function() {}
						$scope.synchBindings = function () {
						
							if(typeof self.submitted == "boolean" && self.form && angular.isString(self.path) && self.objecttype && !$scope.bindingsSynched)
							{
								$scope.submitted = self.submitted;
								$scope.form = self.form;
								$scope.path = self.path;
								
								if(self.dataitem == '')
								{
									//objecttype was set to a valid value and dataitem was set to null
									var object_type_id = (angular.isString(self.objecttype)) ? self.objecttype : self.objecttype._id;
									
									$scope.data = $rootScope.createNewObjectOfTypeId(object_type_id);
								}
								
								$scope.bindingsSynched = true;								
							}
						};
						
						$scope.getErrorFlag = function(validation_rule)
						{
							var result;
							var validation_rule_definition = $rootScope.getById($scope.validation_rule_definitions, validation_rule.rule.id)
							
							result = $rootScope.getFormErrorFlag(validation_rule_definition.name);
							
							return result;
						}
						
						$scope.getErrorMessage = function(validation_rule, data, field_name)
						{
							var result;
							var validator = $rootScope;
							
							var validation_rule_definition = $rootScope.getById($scope.validation_rule_definitions, validation_rule.rule.id);
							var args = {};
							
							for(var i = 0; validation_rule.rule.parameters && i < validation_rule.rule.parameters.length; i++)
							{
								var item = validation_rule.rule.parameters[i];
								var value;
								
								if(item.value_type == 'value')
								{
									value = item.value;
								}
								else if(item.value_type == 'field_value')
								{
									value = data[field_name];
								}
								
								args[item.name] = value;
							}
							for(var i = 0; validation_rule_definition.rule_function.parameters && i < validation_rule_definition.rule_function.parameters.length; i++)
							{
								var item = validation_rule_definition.rule_function.parameters[i];
								
								if(item.is_internal)
								{
									var value;
								
									if(item.value_type == 'value')
									{
										value = item.value;
									}
									else if(item.value_type == 'field_value')
									{
										value = data[field_name];
									}
									else if(item.value_type == 'expression')
									{
										value = eval(item.value.replace('$', 'data[field_name]'));
									}
									
									args[item.name] = value;
								}
							}
							
							result = $rootScope.getFormattedString(validation_rule_definition.rule_function.message, args);
							
							return result;
						}
						
						$scope.getFieldValue = function(fieldName) {
							return eval('data.' + fieldName);
						};
						
						$scope.addNewObjectLink = function(fieldName, multiplicity)
						{
							if(multiplicity == 'many')
							{
								if($scope.data[fieldName] == undefined)
								{
									$scope.data[fieldName] = []; 
								}
								$scope.data[fieldName].push('');
							}
							else if(multiplicity == 'one')
							{
								$scope.data[fieldName] = '';
							}
						};
						
						$scope.addNewObjectDelegate = function(fieldName, multiplicity)
						{
							if(multiplicity == 'many')
							{
								if($scope.data[fieldName] == undefined)
								{
									$scope.data[fieldName] = []; 
								}
								$scope.data[fieldName].push({id : '', parameters : null});
							}
							else if(multiplicity == 'one')
							{
								$scope.data[fieldName] = {id : '', parameters : null};
							}
						}
						
						$scope.addNew = function (fieldName, objectTypeId, multiplicity) {

							var object = $rootScope.createNewObjectOfTypeId(objectTypeId);
							
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
							
						};
						
						$scope.clear = function(fieldName, e) {
							if (e) {
							  e.preventDefault();
							  e.stopPropagation();
							}

							$scope.data[fieldName] = null;
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
	
module.component('linkField', {
		template: 
		'<select ng-if="index == -1" class="form-control" ng-model="data[field]" ng-options="item._id as item.display_name for item in source"></select>' +
		'<select ng-if="index >= 0" class="form-control" ng-model="data[field][index]" ng-options="item._id as item.display_name for item in source"></select>',
		bindings: {
			objecttype: '=',
			dataitem: '=',
			fieldname: '=',
			index: '='
		},
		controller: function ($routeParams, $scope, $http, $rootScope, appSettings) {
						
						var self = this;
						
						var serviceRootURL = $rootScope.getAPIRootURL();
						
						$scope.source = null;
						
						var dataitemWatch = $scope.$watch('$ctrl.dataitem',
						  function(newValue) {
							if (newValue) {
								$scope.synchBindings();
								
								//dataitemWatch();
							}
						  });
						  
						var fieldnameWatch = $scope.$watch('$ctrl.fieldname',
						  function(newValue) {
							if (angular.isString(newValue)) {
								$scope.synchBindings();

								//fieldnameWatch();
							}
						  });
						
						var objecttypeWatch = $scope.$watch('$ctrl.objecttype',
						  function(newValue) {
							if (angular.isString(newValue)) {
								$scope.synchBindings();	
								
								//objecttypeWatch();
							}
						  });
						  
						var indexWatch = $scope.$watch('$ctrl.index',
						  function(newValue) {
							if (angular.isNumber(newValue)) {
								$scope.synchBindings();	
								
								//indexWatch();
							}
						  });
						
						$scope.bindingsSynched = false;
						
						$scope.synchBindings = function () {
						
							if(angular.isNumber(self.index) && self.objecttype && self.dataitem && angular.isString(self.fieldname) && !$scope.bindingsSynched)
							{
								$scope.data = self.dataitem;
								$scope.field = self.fieldname;
								$scope.index = self.index;
								
								if(angular.isString(self.objecttype))
								{
									$http({
										method: 'GET',
										url: serviceRootURL + '/object_types/' + self.objecttype
										}).then(function successCallback(response) {
										var object_type = response.data;

										$http({
											method: 'GET',
											url: serviceRootURL + '/' + object_type.name
											}).then(function successCallback(response) {
													$scope.source = response.data;
											}, function errorCallback(response) {
												$rootScope.showAlert(response.statusText, 'error');
											});
										}, function errorCallback(response) {
										$rootScope.showAlert(response.statusText, 'error');
										}); 
								}
								else {
									$http({
										method: 'GET',
										url: serviceRootURL + '/' + self.objecttype.name
										}).then(function successCallback(response) {
												$scope.source = response.data;
										}, function errorCallback(response) {
											$rootScope.showAlert(response.statusText, 'error');
										});	
								}
								
								$scope.bindingsSynched = true;
							}
						};
					}
	});
	
module.component('delegateField', {
		templateUrl: 'templates/delegate-field.html',
		bindings: {
			objecttype: '=',
			dataitem: '=',
			fieldname: '=',
			index: '=',
			path: '=',
			form: '=',
			submitted: '='
		},
		controller: function ($routeParams, $scope, $http, $rootScope, appSettings) {
						
						var self = this;
						
						var serviceRootURL = $rootScope.getAPIRootURL();
						
						$scope.source = null;
						
						$scope.delegateChanged = function(e) {
							if (e) {
							  //e.preventDefault();
							  //e.stopPropagation();
							}
							
							//$scope.data[$scope.field].parameters = null;
							
							var id;
							if($scope.index == -1)
							{
								id = $scope.data[$scope.field].id;
							}
							else if($scope.index >= 0)
							{
								id = $scope.data[$scope.field][$scope.index].id;
							}
							
							$http({
								method: 'GET',
								url: serviceRootURL + '/' + $scope.object_type.name + '/' + id + '/delegate'
								}).then(function successCallback(response) {
										$scope.delegate_object_type = response.data;
										var parameters = $rootScope.createNewObjectOfType($scope.delegate_object_type);
										if($scope.index == -1)
										{
											$scope.data[$scope.field].parameters = parameters;
										}
										else if($scope.index >= 0)
										{
											$scope.data[$scope.field][$scope.index].parameters = parameters;
										}
										
								}, function errorCallback(response) {
									$rootScope.showAlert(response.statusText, 'error');
								});
								
						};
						
						var submittedWatch = $scope.$watch('$ctrl.submitted',
						  function(newValue) {
							if (newValue) {								
								$scope.synchBindings();
								//submittedWatch();
							}
						  });
						  
						var formWatch = $scope.$watch('$ctrl.form',
						  function(newValue) {
							if (newValue) {								
								$scope.synchBindings();
								//formWatch();
							}
						  });
						  
						var pathWatch = $scope.$watch('$ctrl.path',
						  function(newValue) {
							if (angular.isString(newValue)) {								
								$scope.synchBindings();
								//pathWatch();
							}
						  });
						  
						var dataitemWatch = $scope.$watch('$ctrl.dataitem',
						  function(newValue) {
							if (newValue) {
								$scope.synchBindings();
								//dataitemWatch();
							}
						  });
						  
						var fieldnameWatch = $scope.$watch('$ctrl.fieldname',
						  function(newValue) {
							if (angular.isString(newValue)) {
								$scope.synchBindings();
								//fieldnameWatch();
							}
						  });
						
						var objecttypeWatch = $scope.$watch('$ctrl.objecttype',
						  function(newValue) {
							if (angular.isString(newValue)) {
								$scope.synchBindings();	
								//objecttypeWatch();
							}
						  });
						  
						var indexWatch = $scope.$watch('$ctrl.index',
						  function(newValue) {
							if (angular.isNumber(newValue)) {
								$scope.synchBindings();	
								
								//indexWatch();
							}
						  });
						
						$scope.bindingsSynched = false;
						
						$scope.synchBindings = function () {
						
							if(typeof self.submitted == "boolean" && self.form && angular.isString(self.path) && angular.isNumber(self.index) && self.objecttype && self.dataitem && angular.isString(self.fieldname) && !$scope.bindingsSynched)
							{
								$scope.submitted = self.submitted;
								$scope.form = self.form;
								$scope.path = self.path;
								$scope.index = self.index;
								$scope.data = self.dataitem;
								$scope.field = self.fieldname;
								
								if(angular.isString(self.objecttype))
								{
									$http({
										method: 'GET',
										url: serviceRootURL + '/object_types/' + self.objecttype
										}).then(function successCallback(response) {
										$scope.object_type = response.data;

										$http({
											method: 'GET',
											url: serviceRootURL + '/' + $scope.object_type.name
											}).then(function successCallback(response) {
											$scope.source = response.data;
											
											var id;
											if($scope.index == -1)
											{
												id = $scope.data[$scope.field].id;
											}
											else if($scope.index >= 0)
											{
												id = $scope.data[$scope.field][$scope.index].id;
											}
											
											
											$http({
												method: 'GET',
												url: serviceRootURL + '/' + $scope.object_type.name + '/' + id + '/delegate'
												}).then(function successCallback(response) {
														$scope.delegate_object_type = response.data;
												}, function errorCallback(response) {
													$rootScope.showAlert(response.statusText, 'error');
												});
											
											
											}, function errorCallback(response) {
											$rootScope.showAlert(response.statusText, 'error');
											});
										}, function errorCallback(response) {
										$rootScope.showAlert(response.statusText, 'error');
										}); 
								}
								else {
									
									$scope.object_type = response.data;

									$http({
										method: 'GET',
										url: serviceRootURL + '/' + $scope.object_type.name
										}).then(function successCallback(response) {
										$scope.source = response.data;

										$http({
											method: 'GET',
											url: serviceRootURL + '/' + $scope.object_type.name + '/' + $scope.data[$scope.field].id + '/delegate'
											}).then(function successCallback(response) {
													$scope.delegate_object_type = response.data;
											}, function errorCallback(response) {
												$rootScope.showAlert(response.statusText, 'error');
											});

										}, function errorCallback(response) {
										$rootScope.showAlert(response.statusText, 'error');
										});
										 
									
								}
								
								
								
								$scope.bindingsSynched = true;
							}
						};
					}
	});

module.directive('showErrors', function ($timeout, showErrorsConfig) {
    var getShowSuccess, linkFn;
    
	getShowSuccess = function (options) {
		var showSuccess;
		showSuccess = showErrorsConfig.showSuccess;
		if (options && options.showSuccess != null) {
			showSuccess = options.showSuccess;
		}
		return showSuccess;
	};
	  
    linkFn = function (scope, el, attrs, formCtrl, $injector) {
		var blurred, inputEl, inputName, inputNgEl, options, showSuccess, toggleClasses;
        blurred = false;
        options = scope.$eval(attrs.showErrors);
        showSuccess = getShowSuccess(options);
        inputEl = el[0].querySelector('[name]');
        inputNgEl = angular.element(inputEl);
        inputName = eval(inputNgEl.attr('name1'));
        
		if (!inputName) {
			throw 'show-errors element has no child input elements with a \'name\' attribute';
        }
        
		inputNgEl.bind('blur', function () {
			blurred = true;
			return toggleClasses(formCtrl[inputName].$invalid);
        });
		
        scope.$watch(function () {
			return formCtrl[inputName] && formCtrl[inputName].$invalid;
        }, function (invalid) {
			if (!blurred) {
				return;
			}
			return toggleClasses(invalid);
        });
		
        scope.$on('show-errors-check-validity', function () {
			return toggleClasses(formCtrl[inputName].$invalid);
        });
		
        scope.$on('show-errors-reset', function () {
			return $timeout(function () {
				el.removeClass('has-error');
				el.removeClass('has-success');
				return blurred = false;
          }, 0, false);
        });
		
        return toggleClasses = function (invalid) {
			el.toggleClass('has-error', invalid);
			if (showSuccess) {
				return el.toggleClass('has-success', !invalid);
			}
        };
	};
	  
    return {
		restrict: 'A',
		require: '^form',
		compile: function (elem, attrs) {
			if (!elem.hasClass('form-group')) {
				throw 'show-errors element does not have the \'form-group\' class';
			}
			return linkFn;
		}
    };
});
  
module.provider('showErrorsConfig', function () {
	var _showSuccess;
	_showSuccess = false;
	
	this.showSuccess = function (showSuccess) {
		return _showSuccess = showSuccess;
	};
	
	this.$get = function () {
		return { showSuccess: _showSuccess };
	};
});
  
module.config([
'$locationProvider', 
'$routeProvider', 
'NotificationProvider', 
'$sceDelegateProvider', 
function($locationProvider, $routeProvider, NotificationProvider, $sceDelegateProvider) {
	$locationProvider.hashPrefix('!');
  
	NotificationProvider.setOptions({
		templateUrl: 'ui_notification.html',
		delay: 5000,
		startTop: 20,
		startRight: 10,
		verticalSpacing: 20,
		horizontalSpacing: 20,
		positionX: 'center',
		positionY: 'bottom'
		});

	$sceDelegateProvider.resourceUrlWhitelist([
		// Allow same origin resource loads.
		'self',
		// Allow loading templates from api.
		'http://127.0.0.1:8181/**'
	  ]);
}]);

	
angular.module('myApp.moduleLoader', ['ngRoute'])
	
	.config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider ) {
		$routeProvider.when('/:owner/:application/:tenant', {
			templateUrl: 'page.html',
			controller: function($scope, $routeParams, $location, $http, $rootScope, appSettings) {
				var self = this;
				
				$scope.page = null;
				$rootScope.owner = $routeParams.owner;
				$rootScope.application = $routeParams.application;
				$rootScope.tenant = $routeParams.tenant;
				$rootScope.app = null;
				$rootScope.appId = '';
				
				var query = $location.search();
				
				var serviceRootURL = $rootScope.getAPIRootURL();
				
				if(query.app)
				{					
					$http({
						method: 'GET',
						url: serviceRootURL + '/application/' + query.app
						}).then(function successCallback(response) {
								$rootScope.app = response.data;
								$rootScope.appId = $rootScope.app._id;
								$rootScope.appName = $rootScope.app.display_name + ' (Build)';
						}, function errorCallback(response) {
							$rootScope.showAlert(response.statusText, 'error');
						});
				}
				else
				{
					$rootScope.app = null
				}
				
			}
	  });
	  
		$routeProvider.when('/:owner/:application/:tenant/:page', {
		templateUrl: 'page.html',
			controller: function($scope, $routeParams, $location, $http, $rootScope, appSettings) {
				var self = this;
				
				$scope.page = null;
				$rootScope.owner = $routeParams.owner;
				$rootScope.application = $routeParams.application;
				$rootScope.tenant = $routeParams.tenant;
				$rootScope.app = null;
				
				var query = $location.search();
				
				var serviceRootURL = $rootScope.getAPIRootURL();
				
				if(query.app)
				{					
					$http({
						method: 'GET',
						url: serviceRootURL + '/application/' + query.app
						}).then(function successCallback(response) {
								$rootScope.app = response.data;
								$rootScope.appId = $rootScope.app._id;
								$rootScope.appName = $rootScope.app.display_name + ' (Build)';
						}, function errorCallback(response) {
							$rootScope.showAlert(response.statusText, 'error');
						});
				}
				else
				{
					$rootScope.app = null
				}
				
				$http({
					method: 'GET',
					url: serviceRootURL + '/page/' + $routeParams.page + '/?expand=views'
					}).then(function successCallback(response) {
							$scope.page = response.data;
					}, function errorCallback(response) {
						$rootScope.showAlert(response.statusText, 'error');
					});
					
				$http({
					method: 'GET',
					url: serviceRootURL + '/object_types'
					}).then(function successCallback(response) {
							$rootScope.object_types = response.data;
							$scope.object_types = $rootScope.object_types
					}, function errorCallback(response) {
						$rootScope.showAlert(response.statusText, 'error');
					});
								  
				$http({
					method: 'GET',
					url: serviceRootURL + '/validation_rule_definition'
					}).then(function successCallback(response) {
							$rootScope.validation_rule_definitions = response.data;
					}, function errorCallback(response) {
						$rootScope.showAlert(response.statusText, 'error');
					});
			}
	  });
	}]);
 
