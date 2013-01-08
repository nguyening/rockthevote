'use strict';

angular.module('rockTheVote.services', ['ngResource'])
	.factory('Election', ['$resource', function($resource) {
		var election = $resource('api/election/:eId/:action', {eId:'@id', action:'@action'}, {
			save: {
				method: "PUT"
			},
			getVoters: {
				method: "GET",
				params: {
					action: "voters"
				},
				isArray: true
			}
		});
		return election;
	}])
	.factory('Vote', ['$resource', function($resource) {
		var voter = $resource('api/voter/:id', {id:'@id'}, {
			save: {
				method: "PUT"
			}
		});
		return voter;
	}]);