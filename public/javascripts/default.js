$(document).ready(function(){
	jQuery(window).load(function() {
		jQuery("#status").fadeOut();
		jQuery("#preloader").delay(1000).fadeOut(500);
	});
	var biggestHeight = "0";
	$(".slider *").each(function(){
		if($(this).height()>biggestHeight){
			biggestHeight = $(this).height();
		}
	});
	$(".slider").height(biggestHeight);
  $.getScript("http://maps.googleapis.com/maps/api/js?sensor=false&libraries=places", function(){

    console.log("location script loaded");

  });
});

	var source, destination;
	var directionsDisplay;
	var directionsService = new google.maps.DirectionsService();
	google.maps.event.addDomListener(window, 'load', function () {
	    new google.maps.places.SearchBox(document.getElementById('txtSource'));
	    new google.maps.places.SearchBox(document.getElementById('txtDestination'));
	    directionsDisplay = new google.maps.DirectionsRenderer({ 'draggable': true });
	});
	 
	function GetRoute() {
	    var mumbai = new google.maps.LatLng(18.9750, 72.8258);
	    var mapOptions = {
	        zoom: 7,
	        center: mumbai
	    };
	    map = new google.maps.Map(document.getElementById('dvMap'), mapOptions);
	    directionsDisplay.setMap(map);
	    directionsDisplay.setPanel(document.getElementById('dvPanel'));
	 
	    //*********DIRECTIONS AND ROUTE**********************//
	    source = document.getElementById("txtSource").value;
	    destination = document.getElementById("txtDestination").value;
	 
	    var request = {
	        origin: source,
	        destination: destination,
	        travelMode: google.maps.TravelMode.DRIVING
	    };
	    directionsService.route(request, function (response, status) {
	        if (status == google.maps.DirectionsStatus.OK) {
	            directionsDisplay.setDirections(response);
	        }
	    });
	 
	    //*********DISTANCE AND DURATION**********************//
	    var service = new google.maps.DistanceMatrixService();
	    service.getDistanceMatrix({
	        origins: [source],
	        destinations: [destination],
	        travelMode: google.maps.TravelMode.DRIVING,
	        unitSystem: google.maps.UnitSystem.METRIC,
	        avoidHighways: false,
	        avoidTolls: false
	    }, function (response, status) {
	        if (status == google.maps.DistanceMatrixStatus.OK && response.rows[0].elements[0].status != "ZERO_RESULTS") {
	            var distance = response.rows[0].elements[0].distance.text;
	            var duration = response.rows[0].elements[0].duration.text;
	            var dvDistance = document.getElementById("dvDistance");
	            var dvDuration = document.getElementById("dvDuration");
	           	dvDistance.innerHTML = distance;
	            dvDuration.innerHTML = duration;
	            var car = document.getElementById('txtCar').value;
	            var icar= parseInt(car);
	            var idistance = parseInt(distance);
	            dvCar = document.getElementById("dvCost");
	            var temp=idistance*icar;
	            dvCar.innerHTML = temp;
	            var totalCost = document.getElementById("totalCost");
	 			totalCost.innerHTML = "₹ "+ (temp+400);
	 			document.getElementById("dvCarcost").innerHTML="₹ "+icar;
	 			document.getElementById("dvExtra").innerHTML = "₹ 400";

	        } else {
	            alert("Unable to find the distance via road.");
	        }
	    });
	}

