var directionsDisplay = new google.maps.DirectionsRenderer({ draggable: true });
var directionsService = new google.maps.DirectionsService();
var map;
var cars = 0;


window.onload = init;

function init() {
    var myOptions = {
        zoom: 7,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        center: new google.maps.LatLng(55.8837213, 10.5169774)
    };
    map = new google.maps.Map(document.getElementById("map"), myOptions);
    directionsDisplay.setMap(map);
    directionsDisplay.setPanel(document.getElementById("directions"));
    document.getElementById("simulation_submit").onclick = function() { calcRoute( document.getElementById("startpoint").value, document.getElementById("endpoint").value); };
};

function calcRoute(startpoint, endpoint) {
    var request = {
        //origin: $("#startpoint").val(),
        origin: startpoint,
        //destination: $("#endpoint").val(),
        destination: endpoint,
        travelMode: "DRIVING"
    };
    directionsService.route(request, function(response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);
            //document.getElementById('Gresponse').innerHTML = JSON.stringify(response);
			var line = createPolyline(response);
			animate(line);
			cars++;
			updateGui(response, line);
        }
    });
};

function createPolyline(directionResult) {
  var line = new google.maps.Polyline({
      path: directionResult.routes[0].overview_path,
      strokeColor: '#FF0000',
      strokeOpacity: 0.5,
      strokeWeight: 4,
      icons: [{
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 5,
            strokeColor: '#393'
          },
          offset: '100%'
        }]
  });
  line.setMap(map);
  return line;
};

function animate(line) {
	
	var count = 0;
	window.setInterval(function() {
		count ++;
		var icons = line.get('icons');
		icons[0].offset = (count / 2) + '%';
		line.set('icons', icons);
	}, 50);
};



function newAnimate()
{
	var stepCount = 0;
	/*window.setInterval(){
		
	}*/
	
}
function updateGui(response, line)
{
	document.getElementById("ammountofcars").innerHTML = cars;
	var carToAdd = document.createElement("p");
	console.log(line);

	var pathlenght = response.routes[0].overview_path.length;
	var pathDurationSec = response.routes[0].legs[0].duration.value;
	var pathStepDuration = pathDurationSec/pathlenght;


	console.log(pathlenght);
	console.log(pathDurationSec);
	console.log(pathStepDuration);
	console.log(response.routes[0].overview_path.forEach(function (value, index) { console.log(value.lat());
                                                                                    console.log(value.lng());}));
	carToAdd.innerHTML = "A car is driving from " + response.request.origin.query + " to " + response.request.destination.query;
	document.getElementById("directions").appendChild(carToAdd);
	//document.getElementById("simulation_waypointslist").appendChild(carToAdd);
}
