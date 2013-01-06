'use strict';

angular.module('rockTheVote', ['rockTheVote.services']).
  config(['$routeProvider', function($routeProvider) {
  	$routeProvider.when('/', {templateUrl: 'partials/view.html', controller: ElectionViewCtrl});
  	$routeProvider.when('/election/:id', {templateUrl: 'partials/election.html', controller: ElectCtrl});
  	$routeProvider.when('/election/:id/result', {templateUrl: 'partials/result.html', controller: ResultCtrl});

    $routeProvider.when('/admin', {templateUrl: 'partials/admin.html', controller: ElectionViewCtrl});
    $routeProvider.when('/admin/edit/:id', {templateUrl: 'partials/admin_edit.html', controller: AdminCtrl});
    $routeProvider.when('/admin/add', {templateUrl: 'partials/admin_edit.html', controller: AdminCtrl});
    
    $routeProvider.otherwise({redirectTo: '/'});
  }]);
