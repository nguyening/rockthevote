'use strict';

function ElectionViewCtrl($scope, Election) {
	$scope.elections = Election.query();
}
ElectionViewCtrl.$inject = ['$scope', 'Election'];

function AdminCtrl ($scope, $routeParams, Election, $location) {
	$scope.electionId = $routeParams.id;
	if($scope.electionId)
		$scope.election = Election.get({eId:$scope.electionId});
	else
		$scope.election = new Election();

	$scope.addPosition = function() {
		if($scope.election.positions)
			$scope.election.positions.push({"title":"Enter a title here", runners: []});
		else
			$scope.election.positions = [{"title":"Enter a title here", runners: []}];
	};

	$scope.removePosition = function(positionIdx) {
		$scope.election.positions.splice(positionIdx, 1);
	};

	$scope.addRunner = function(position) {
		position.runners.push({
			"name":"Enter a name here",
			"year":0,
			"concentration":"Enter a concentration"
		});
	};

	$scope.removeRunner = function(position, runnerIdx) {
		position.runners.splice(runnerIdx, 1);
	};

	$scope.cancel = function() {
		$location.path('/admin');
	};

	$scope.save = function() {
		if(!$scope.election.notes)
			$scope.election.notes = "";
		$scope.election.$save({eId: $scope.electionId});
		$location.path('/admin');
	};

}
AdminCtrl.$inject = ['$scope', '$routeParams', 'Election', '$location'];

function ElectCtrl($scope, $routeParams, Election, Vote) {

}
ElectCtrl.$inject = ['$scope', '$routeParams', 'Election', 'Vote'];
