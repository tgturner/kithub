"use strict";
angular.module('Lesson').factory('ContributionsService', ['$http', '$q', function($http, $q){

	var obj = {};

	var _contributions = {};

	var addToList = function(collection, id){
		collection.forEach(function(el){
			var date = new Date(el);
			var hours = date.setHours(0,0,0,0);
			if(_contributions[id][hours]){
				_contributions[id][hours] += 1;	
			}
			else{
				_contributions[id][hours] = 1;
			}
		});
	};

	obj.populate = function(id){
		//if contributions for this user have not been populated yet
		if(!_contributions[id]){
			return $http({
				method: 'GET',
				url: '/api/v1/teachers/'+id+'/contributions',
				headers:{
					'Content-Type': 'application/json'
				}
			}).then(function(response){
				_contributions[id] = {};
				addToList(response.data.lessons, id);
				addToList(response.data.pull_requests, id);
			});
		}
		else{
			return $q.when([]);
		}
	};

	obj.getStartingDate = function(){
		var today = new Date();
		var thisYear = 2016;
		// var thisYear = today.getFullYear();
		//1.4.17: I decided to freeze this at 2016 so that the contributions would show up. Otherwise, the graph would be blank.
		var startDate = new Date(thisYear, 0, 1);
		while(startDate.getDay() != 1){
			startDate.setDate(startDate.getDate() + 1);
		}
		return startDate;
	};

	obj.getTotal = function(id){
		var total = 0;
		var teacher = _contributions[id];
		for(var date in teacher){
			total += teacher[date];
		}
		return total;
	};

	var getMax = function(id){
		var max = 0;
		var teacher = _contributions[id];
		for(var date in teacher){
			if(teacher[date] > max){
				max = teacher[date];
			}
		}
		return max;
	};

	var COLORS = ["rgb(224,224,224)", "rgb(214, 230, 133)", "rgb(140, 198, 101)", "rgb(68, 163, 64)","rgb(30, 104, 35)"];

	obj.getColor = function(id, data){
		var color;
		var max = getMax(id);
		if(max <= 3){
			color = COLORS[1];
		}
		else{
			var quartile = Math.ceil(data/(max/4));
			color = COLORS[quartile];
		}
		return color;
	};

	obj.getAll = function(){
		return _contributions;
	};

	return obj;
}]);