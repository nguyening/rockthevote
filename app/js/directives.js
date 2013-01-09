angular.module('rockTheVote.directives', [])
	.directive('numberIncrement', function($timeout) {
	  return {
	    restrict: 'E',
	    scope: {model: '=number'},
	    transclude: false,
	    compile: function(tElement, tAttributes, transclude) {
	      return function($scope, $element, $attrs) {
	        var deferId;
	        var start = parseInt($attrs.start) || 0;
	        var step = parseFloat($attrs.step) || 1;
	        var delayTime = parseInt($attrs.delay) || 10;
	        $scope.max = $scope.model;
	        $scope.model = start;

	        $scope.increment = function() {
	          defertId = $timeout(function() { 
	            if($scope.model < $scope.max) {
	              $scope.model += step;
	              $scope.increment();
	            }
	            else
	            	$scope.model = $scope.max;
	          }, delayTime);
	        };
	        
	        $element.bind('$destroy', function() {
	          $timeout.cancel(deferId);
	        });
	        
	        $scope.increment();
	      };
	    }
	  };
	})
	.directive('numberRoulette', function($timeout) {
	  return {
	    restrict: 'A',
	    scope: {showNumber: '=ngModel'},
	    replace: false,
	    transclude: true,
	    template: '<span ng-transclude></span>',
	    compile: function(tElement, tAttributes, transclude) {
	      return function($scope, $element, $attrs) {
	        var fields = parseInt(tAttributes.fields) || $scope.showNumber.toString().length;
	        var temp = $scope.showNumber;
	        
	        $scope.goalNumber = new Array(fields);
	        for(var i = 0; i < fields; i++) {
	          $scope.goalNumber[fields - i - 1] = temp % 10;
	          temp = Math.floor(temp / 10);
	        }
	        $scope.randNumber = new Array(fields);
	        $scope.numberDefers = new Array(fields);
	        var startTime = new Date().getTime();
	        
	        function updateDisplay() {
	          $scope.showNumber = parseInt($scope.randNumber.join(''));
	        }
	        
	        $scope.randomizeField = function(fieldId) {
	          $scope.numberDefers[fieldId] = $timeout(function() { 
	            if(new Date().getTime() - startTime > (fieldId+1)*1000) {
	              $scope.randNumber[fieldId] = $scope.goalNumber[fieldId];
	              updateDisplay();
	            }
	            else {
	              $scope.randNumber[fieldId] = Math.floor(Math.random()*10);
	              updateDisplay();
	              $scope.randomizeField(fieldId);
	            }
	          }, 10);
	        };
	        
	        $element.bind('$destroy', function() {
	          for(var i = 0; i < $scope.numberDefers.length; i++)
	            $timeout.cancel($scope.numberDefers[i]);
	        });
	        
	        for(var i = 0; i < fields; i++) {
	          $scope.randomizeField(i);
	        }
	        
	      };
	    }
	  };
	});