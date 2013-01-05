'use strict';

/* Controllers */


function AdminViewCtrl($scope) {
	$http.get('api/election').success(function (resource) {
		$scope.elections = resource.data;
	});
}
AdminViewCtrl.$inject = ['$scope'];

function AdminEditorCtrl ($scope, $routeParams) {
	// var id = $routeParams[];
	var id = '';
	if(id) {
		$http.get('api/election/'+id).success(function (resource) {
			$scope.election = resource.data;
			$scope.save = function() {
				$http.put('api/election/'+id).success(function (response) {
					// body...
				});
			};
		});
	}
	else {
		$scope.save = function() {
			$http.post('api/election').success();
		};
	}
}
AdminEditorCtrl.$inject = ['$scope'];

function MyCtrl2() {
}
MyCtrl2.$inject = [];
