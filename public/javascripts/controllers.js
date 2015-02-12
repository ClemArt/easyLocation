var appCtrl = angular.module('appCtrl', []);

appCtrl.controller('mapCtrl',[
'$scope',
'$state',
'you',
function($scope, $state, you){
	//Initialization of the map (for template load)
	function initialiseMap(){
		if(navigator.geolocation){ //Test the navigator's compatibility
			//Load the map
			var mapOptions={
				zoom:15,
				mapTypeId:google.maps.MapTypeId.ROADMAP,
				center:new google.maps.LatLng(48.858093,2.294694)
			};
			var map=new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
			//User position, marker & accuracy
			var userPos=null;
			var userMarker=new google.maps.Marker({
				map:map
			});
			var userArea=new google.maps.Circle({
				map:map,
				clickable:false,
				fillColor:'rgb(142, 255, 163)',
				fillOpacity:0.3,
				strokeColor:'rgb(0, 255, 46)',
				strokeOpacity:0.8,
				strokeWeight:1
			});
			//Start watching the position
			var geoOptions={
				enableHighAccuracy:false,
				timeout:15000,
				maximumAge:10000
			};
			//watching effectively starts
			var watch=navigator.geolocation.watchPosition(updatePosition, errorPosition, geoOptions);
		}
		else{
			alert("Your browser does not support geolocation, please upgrade it to a newer version to use this service");
			$state.go('login');
		}
		
		//Supportive functions
		//Success at retrieving user position
		function updatePosition(position){
			var lat = position.coords.latitude;
			var lng = position.coords.longitude;
			you.updatePosition(lat, lng, function(){
				userPos=new google.maps.LatLng(lat, lng);
				map.panTo(userPos);
				userMarker.setPosition(userPos);
				userArea.setCenter(userPos);
				userArea.setRadius(position.coords.accuracy);
			});
		};
		//Error at retrieving position
		function errorPosition(error){
			console.log(error);
		};
	};
	
	initialiseMap();
}]);

//All users informations
appCtrl.factory('users', [
'$http',
function($http){
	var o={
		users:[]
	};
	
	o.getAll=function(){
		return $http.get('/users').success(function(data){
			o.users.push(data);
		});
	};
	
	return o;
}]);

//User information
appCtrl.factory('you', [
'$http',
'$state',
'$rootScope',
'$cookieStore',
function($http, $state, $rootScope, $cookieStore){
	var o={
		data:{
			name: "Guest",
			lat:0,
			lng:0
		}
	};
	
	//Log the user with his name and change state to draw the map
	o.login = function(){
		return $http.post('/users', o.data).success(function(data){
			o.data = data;
			$cookieStore.put('user', o.data._id);
			$state.go('map');
		});
	};
	
	o.loginCheck = function(){
		console.log('bite   ' + $cookieStore.get('user'));
		if($cookieStore.get('user')){
			return $http.get('/users/' + $cookieStore.get('user')).success(function(data){
				o.data = data;
				$cookieStore.put('user', o.data._id);
			})
			.error(function(){
				$state.go('login');
			});
		}
		$state.go('login');
	};
	
	o.updatePosition = function(lat, lng, callback){
		//update to the server if position changed
		if((lat-o.data.lat)*(lat-o.data.lat)+(lng-o.data.lng)*(lng-o.data.lng) > 0.00005){
			return $http.put('/users/' + o.data._id + '/position', {lat:lat, lng:lng}).success(function(data){
				o.data = data;
				$rootScope.$applyAsync(function(){
					callback.apply();
				});
			});
		}
		else{ //Just update the view, without implying the server
			$rootScope.$applyAsync(function(){
				callback.apply();
			});
		}
	};
	
	return o;
}]);

//Login controller
appCtrl.controller('loginCtrl', [
'$scope',
'you',
function($scope, you){
	$scope.you=you.data;
	$scope.submitLogin=you.login;
}]);

/**
Socket factory !
*/
appCtrl.factory('socket', [
'$rootScope',
function($rootScope){
	var socket = io();
	return {
		on: function(eventName, callback){
			socket.on(eventName,function(){
				//Stores the potential data sent with message
				var args = arguments;
				//Schedules an $apply for the next digest cycle
				$rootScope.$applyAsync(function(){
					//Executes the callback in the socket context with the passed args
					callback.apply(socket, args);
				});
			});
		},
		
		emit: function(eventName, data, callback){
			socket.emit(eventName, data, function(){
				//stores callback arguments
				var args = arguments;
				//Schedule an $apply for the next digest cycle
				$rootScope.$applyAsync(function(){
					if(callback) callback.apply(socket, args);
				});
			});
		}
	};
}]);