'use strict';

function AdminViewCtrl($scope, Election) {
	$scope.elections = Election.query();
	$scope.remove = function(eidx) {
		new Election().$delete({eId : $scope.elections[eidx].id});
		$scope.elections.splice(eidx, 1);
	};
}
AdminViewCtrl.$inject = ['$scope', 'Election'];

function UserViewCtrl($scope, Election) {
	$scope.hasPassed = function(endStr) {
		var end = new Date(endStr);
  		if(isNaN(end.getTime()))				// not a valid Date
  			return false;
  		else {
  			if(end.getTime() - new Date().getTime() < 0)
  				return true;
  		}
  		return false;
	};

	$scope.elections = Election.query(function() {
		for(var i = 0; i < $scope.elections.length; i++) {
			if(!$scope.hasPassed($scope.elections[i].start)) {
				$scope.elections.splice(i, 1);
			}
		}
	});
}
UserViewCtrl.$inject = ['$scope', 'Election'];

function AdminCtrl ($scope, $routeParams, Election, $location) {
	$scope.addPosition = function() {
		var runner_arr = [{
			"name":"",
			"year":null,
			"concentration":""
		}];

		if($scope.election.positions)
			$scope.election.positions.push({"title":"", runners: runner_arr});
		else
			$scope.election.positions = [{"title":"", runners: runner_arr}];
	};

	$scope.removePosition = function(positionIdx) {
		$scope.election.positions.splice(positionIdx, 1);
		if($scope.election.positions.length == 0)
			$scope.addPosition();
	};

	$scope.addRunner = function(position) {
		position.runners.push({
			"name":"",
			"year":null,
			"concentration":""
		});
	};

	$scope.removeRunner = function(position, runnerIdx) {
		position.runners.splice(runnerIdx, 1);
		if(position.runners.length == 0) {
			$scope.addRunner(position);
		}
	};

	$scope.cancel = function() {
		$location.path('/admin');
	};

	$scope.save = function() {
		if($scope.election_editor.$valid) {
			if(!$scope.election.notes)
				$scope.election.notes = "";
			$scope.election.$save({eId: $scope.electionId});
			$location.path('/admin');
		}
	};

	$scope.electionId = $routeParams.id;
	if($scope.electionId)
		$scope.election = Election.get({eId:$scope.electionId}, function() {
			var startStr = $scope.election.start;
			var endStr = $scope.election.end;
			$scope.election.start = new Date(startStr);
			$scope.election.end = new Date(endStr);
		});
	else {
		$scope.election = new Election();
		$scope.addPosition();
	}
}
AdminCtrl.$inject = ['$scope', '$routeParams', 'Election', '$location'];

function ElectCtrl($scope, $routeParams, $location, Election, Vote) {
	$scope.electionId = $routeParams.id;
	$scope.election = Election.get({eId:$scope.electionId});
	$scope.email = "";
	$scope.pickmap = {};

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

	$scope.save = function() {
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