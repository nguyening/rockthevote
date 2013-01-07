'use strict';

angular.module('rockTheVote', ['rockTheVote.services', 'ui.directives']).
  config(['$routeProvider', function($routeProvider) {
  	$routeProvider.when('/', {templateUrl: 'partials/view.html', controller: UserViewCtrl});
  	$routeProvider.when('/election/:id', {templateUrl: 'partials/election.html', controller: ElectCtrl});
  	$routeProvider.when('/election/:id/result', {templateUrl: 'partials/result.html', controller: ResultCtrl});

    $routeProvider.when('/admin', {templateUrl: 'partials/admin.html', controller: AdminViewCtrl});
    $routeProvider.when('/admin/edit/:id', {templateUrl: 'partials/admin_edit.html', controller: AdminCtrl});
    $routeProvider.when('/admin/manage/:id', {templateUrl: 'partials/admin_manage.html', controller: VotesCtrl});
    $routeProvider.when('/admin/add', {templateUrl: 'partials/admin_edit.html', controller: AdminCtrl});
    
    $routeProvider.otherwise({redirectTo: '/'});
  }]);
