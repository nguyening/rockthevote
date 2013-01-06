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
			$scope.election.positions.push({"title":"", runners: []});
		else
			$scope.election.positions = [{"title":"", runners: []}];
	};

	$scope.removePosition = function(positionIdx) {
		$scope.election.positions.splice(positionIdx, 1);
	};

	$scope.addRunner = function(position) {
		position.runners.push({
			"name":"",
			"year":0,
			"concentration":""
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

function ElectCtrl($scope, $routeParams, $location, Election, Vote) {
	$scope.electionId = $routeParams.id;
	$scope.election = Election.get({eId:$scope.electionId});
	$scope.email = "";
	$scope.pickmap = {};

	$scope.save = function() {
		if(!$scope.email || Object.keys($scope.pickmap).length != $scope.election.positions.length) {
			//validate;
			return;
		}

		var vote;		
		for(var positionLabel in $scope.pickmap) {
			vote = new Vote();
			vote.email = $scope.email;
			vote.election_id = $scope.electionId;
			vote.runner_id = parseInt($scope.pickmap[positionLabel]);
			vote.$save();
		}
		window.alert('You have successfully voted!');
		$location.path('/');
	};


}
ElectCtrl.$inject = ['$scope', '$routeParams', '$location', 'Election', 'Vote'];

function ResultCtrl ($scope, $routeParams, Election) {
	$scope.electionId = $routeParams.id;
	$scope.election = Election.get({eId:$scope.electionId});
}
ResultCtrl.$inject = ['$scope', '$routeParams', 'Election'];