'use strict';

function AdminViewCtrl($scope, Election) {
	$scope.elections = Election.query();
	$scope.delete = function(eidx) {
		new Election().$delete({eId : $scope.elections[eidx].id});
		$scope.elections.splice(eidx, 1);
	};
}
AdminViewCtrl.$inject = ['$scope', 'Election'];

function UserViewCtrl($scope, Election) {
	$scope.elections = Election.query();

	$scope.hasClosed = function(endStr) {
		var end = new Date(endStr);
  		if(isNaN(end.getTime()))				// not a valid Date
  			return false;
  		else {
  			if(end.getTime() - new Date().getTime() < 0)
  				return true;
  		}
  		return false;
	};
}
UserViewCtrl.$inject = ['$scope', 'Election'];

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
		// TODO: Validation
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
	$scope.election = Election.get({eId:$scope.electionId}, function() {
		for(var i = 0; i < $scope.election.positions.length; i++) {
			var position = $scope.election.positions[i];
			position.showLosers = false;

			/* CALCULATE TOTAL VOTES */
			var total_votes = 0;
			for(var j = 0; j < position.runners.length; j++) {
				total_votes += position.runners[j].votes;
			}

			/* PERCENTAGE OF TOTAL VOTES */
			for(var j = 0; j < position.runners.length; j++) {
				position.runners[j].percentage = Math.round((position.runners[j].votes/total_votes) * 10000) / 100;
			}

			/* SORT RUNNERS, SET WINNER */
			position.runners.sort(function(a, b) { return b.votes - a.votes; });
			position.runners[0].winner = true;	
			for(var j = 1; j < position.runners.length; j++) {
				if(position.runners[j].votes == position.runners[0].votes)
					position.runners[j].winner = true;
				else
					position.runners[j].winner = false;
			}
		}
	});
}
ResultCtrl.$inject = ['$scope', '$routeParams', 'Election'];

function VotesCtrl ($scope, $routeParams, Election, Vote) {
	$scope.electionId = $routeParams.id;
	$scope.voters = Election.getVoters({eId: $scope.electionId});

	$scope.remove = function(vidx) {
		new Vote().$delete({id: $scope.voters[vidx].id});
		$scope.voters.splice(vidx, 1);
	};
}
VotesCtrl.$inject = ['$scope', '$routeParams', 'Election', 'Vote'];