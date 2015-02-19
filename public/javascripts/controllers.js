var appCtrl = angular.module('appCtrl', [
'ngCookies'
]);

appCtrl.controller('mapCtrl',[
'$scope',
'$state',
'you',
'users',
'$interval',
function($scope, $state, you, users, $interval){
	//Initialization of the map (for template load)
	//Load the map
	var mapOptions={
		zoom:15,
		mapTypeId:google.maps.MapTypeId.ROADMAP,
		center:new google.maps.LatLng(48.858093,2.294694)
	};
	$scope.map=new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
	//User position, marker & accuracy
	var userPos=null;
	var userMarker=new google.maps.Marker({
		map:$scope.map
	});
	var userArea=new google.maps.Circle({
		map:$scope.map,
		clickable:false,
		fillColor:'rgb(142, 255, 163)',
		fillOpacity:0.3,
		strokeColor:'rgb(0, 255, 46)',
		strokeOpacity:0.8,
		strokeWeight:1
	});
	
	/**
	Navigator's compatibility with geolocation
	*/
	if(navigator.geolocation){ //Test the navigator's compatibility
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
			userMarker.setPosition(userPos);
			userArea.setCenter(userPos);
			userArea.setRadius(position.coords.accuracy);
			if($scope.trackMe) $scope.map.panTo(userPos);
		});
	};
	//Error at retrieving position
	function errorPosition(error){
		console.log(error);
	};
	
	//Tracking variable for map follow
	$scope.trackMe = true;
	
	//All users
	$scope.users = users.users;
	//Periodic Loading of the users and updating the markers (30 sec)
	$interval(function(){
		users.getAll($scope.map);
	}, 3000);
	
	//Faking someone (debug purpose)
	$scope.fakeOne = you.fakeOne;
}]);

//All users informations
appCtrl.factory('users', [
'$http',
function($http){
	var o={
		users:[],
		markers:[]
	};
	
	o.getAll=function(map){
		return $http.get('/users').success(function(data){
			o.users = data;
			o.makeMarkers();
			o.markerMap(map);
		});
	};
	
	o.makeMarkers=function(){
		o.markerMap(null);
		o.markers = [];
		for(index=0; index<o.users.length; index++){
			console.log('marker make : '+index+'    '+o.users[index]._id);
			var pos = new google.maps.LatLng(o.users[index].lat, o.users[index].lng);
			o.markers.push(new google.maps.Marker({
				position:pos
			}));
		}
	};
	
	o.markerMap=function(map){
		for(index=0; index<o.markers.length; index++){
			console.log('marker map : '+index+'    '+map);
			o.markers[index].setMap(map);
		}
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
	
	//Fake posting user for testing purpose
	o.fakeOne = function(){
		var u = angular.copy(o.data);
		delete u._id;
		u.name = 'testing'+Math.random();
		u.lat += 2*Math.random()-1;
		u.lng += 2*Math.random()-1;
		return $http.post('/users', u).success(function(data){
			console.log(data);
		});
	};
	
	//Log the user with his name and change state to draw the map
	o.login = function(){
		return $http.post('/users', o.data).success(function(data){
			o.data = data;
			$cookieStore.put('user_id', o.data._id);
			$state.go('map');
		});
	};
	
	//Try to get the user data with ID, and store it. If not, server throws a 500 internal server error (id not found) and app returns to login state
	o.loginCheck = function(){
		return $http.get('/users/' + $cookieStore.get('user_id')).success(function(data){
			o.data = data;
			$cookieStore.put('user_id', o.data._id);
			//To insure position is updated at least at first, put it to 0,0
			setPosition(0,0);
		});
	};
	
	o.updatePosition = function(lat, lng, callback){
		//update to the server if position changed
		if((lat-o.data.lat)*(lat-o.data.lat)+(lng-o.data.lng)*(lng-o.data.lng) > 0.00005){
			$http.put('/users/' + o.data._id + '/position', {lat:lat, lng:lng}).success(function(){
				setPosition(lat,lng);
			});
		}
		// Update the view, without implying the server
		$rootScope.$applyAsync(function(){
			callback.call();
		});
	};
	
	o.reset = function(){
		o.data = {
			name: "Guest",
			lat:0,
			lng:0
		}
	};
	
	function setPosition(lat,lng){
		o.data.lat = lat;
		o.data.lng = lng;
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