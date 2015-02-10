//Initialization of the map (on body load)
function initializeMap(){
	if(navigator.geolocation){ //Test the navigator's compatibility
		//Load the map
		var mapOptions={
			zoom:15,
			mapTypeId:google.maps.MapTypeId.ROADMAP,
			center:new google.maps.LatLng(0,0)
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
		var watch=navigator.geolocation.watchPosition(updatePos, errorPos, geoOptions);
	}
	else{
		alert("Your browser does not support geolocation, please upgrade it to a newer version to use this service");
	}
	
	//Supportive functions
	//Success at retrieving position
	function updatePos(position){
		userPos=new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
		map.panTo(userPos);
		userMarker.setPosition(userPos);
		userArea.setCenter(userPos);
		userArea.setRadius(position.coords.accuracy);
		console.log(userPos.toString()+'    acc:'+position.coords.accuracy);
	};
	//Error at retrieving position
	function errorPos(error){
		console.log(error);
	};
};