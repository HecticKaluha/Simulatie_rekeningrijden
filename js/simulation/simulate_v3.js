var directionsDisplay = new google.maps.DirectionsRenderer({ draggable: true });
var directionsService = new google.maps.DirectionsService();
var map;
var polys = [];
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
			console.log(polys);
			var line = createPolyline(response);
			console.log(polys[0].get('icons'));
			animate(line);
			cars++;
			updateGui();
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
  polys.push(line);
  return line;
};

function animate(line) {

	console.log("aangekomen");
	var count = 0;
	window.setInterval(function() {
		count = (count + 1) % 200;
		var icons = line.get('icons');
		icons[0].offset = (count / 2) + '%';
		line.set('icons', icons);
	}, 50);
};

function updateGui()
{
	document.getElementById("ammountofcars").innerHTML = cars;
	var carToAdd = document.createElement("p");
	
	//carToAdd.innerHTML = "A car is driving from " + directionsResult.request.origin.query + " to " + directionsResult.request.destination.query;
	//document.getElementById("simulation_waypointslist").appendChild(carToAdd);
}
