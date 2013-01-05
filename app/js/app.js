'use strict';


// Declare app level module which depends on filters, and services
angular.module('rockTheVote', []).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/admin', {templateUrl: 'partials/admin.html', controller: AdminViewCtrl});
    $routeProvider.when('/admin/edit/:id', {templateUrl: 'partials/admin_edit.html', controller: AdminEditorCtrl});
    $routeProvider.when('/admin/add', {templateUrl: 'partials/admin_edit.html', controller: AdminEditorCtrl});
    $routeProvider.when('/voter', {templateUrl: 'partials/partial2.html', controller: MyCtrl2});
    $routeProvider.otherwise({redirectTo: '/voter'});
  }]);
