var directionsDisplay = new google.maps.DirectionsRenderer({ draggable: true });
var directionsService = new google.maps.DirectionsService();
var map;
var cars = 0;
var secondsToMilliSeconds = 1000;
var amountOfCars = 5;
var d = new Date();
var cities = ["Vejle",
"Hillerod",
"Soro",
"Viborg",
"Roskilde",
"Svendborg",
"Odense",
"Esbjerg",
"Frederikshavn",
"Aalborg",
"Århus",
"KÃ¸benhavn",
]


window.onload = init;

function init() {
    var myOptions = {
        zoom: 7,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        center: new google.maps.LatLng(55.8837213, 10.5169774)
    };
    map = new google.maps.Map(document.getElementById("map"), myOptions);
    //directionsDisplay.setMap(map);
    //directionsDisplay.setPanel(document.getElementById("directions"));
    document.getElementById("simulation_submit").onclick = function() { calcRoute( document.getElementById("startpoint").value, document.getElementById("endpoint").value); };
	for(i = 0; i < amountOfCars; i++)
	{
		generateInitialCars();
	}
};

/*function setMapToCenter()
{
	map.setCenter(new google.maps.LatLng(55.8837213, 10.5169774));
}*/
function generateInitialCars()
{
	var startpoint = cities[Math.floor(Math.random() * cities.length)];
	var endpoint = cities[Math.floor(Math.random() * cities.length)];
	if(startpoint == endpoint)
	{
		generateInitialCars();
	}
	else{
		calcRoute(startpoint, endpoint);
	}
}

function calcRoute(startpoint, endpoint) {
    var request = {
        //origin: $("#startpoint").val(),
        origin: startpoint,
		avoidFerries: false,
		avoidTolls: false,
        //destination: $("#endpoint").val(),
        destination: endpoint,
        travelMode: "DRIVING"
    };
    directionsService.route(request, function(response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            //directionsDisplay.setDirections(response);
            //document.getElementById('Gresponse').innerHTML = JSON.stringify(response);
			var line = createPolyline(response);
			var route = response.routes[0];
			newAnimate(response, line);
			//animate(line);
			cars++;
			updateGui(response, line);
        }
		if(status == google.maps.DirectionsStatus.INVALID_REQUEST)
		{
			console.log("invalid_request");
		}		
		if(status == google.maps.DirectionsStatus.NOT_FOUND)
		{
			console.log("not_found");
		}
		if(status == google.maps.DirectionsStatus.OVER_QUERY_LIMIT)
		{
			console.log("Over_Query_Limit");
		}
		if(status == google.maps.DirectionsStatus.REQUEST_DENIED)
		{
			console.log("REQUEST_DENIED");
		}
		if(status == google.maps.DirectionsStatus.UNKNOWN_ERROR)
		{
			console.log("UNKNOWN_ERROR");
		}
		if(status == google.maps.DirectionsStatus.ZERO_RESULTS)
		{
			console.log("ZERO_RESULTS");
			generateInitialCars();
		}
    });
	
};

function createPolyline(directionResult) {
  var line = new google.maps.Polyline({
		path: directionResult.routes[0].overview_path,
		strokeColor: 'rgba(53, 130, 255, 1)',
		strokeOpacity: 0,
		strokeWeight: 4,
		icons: [{
		  icon: {
			path: google.maps.SymbolPath.CIRCLE,
			scale: 5,
			strokeOpacity: 1,
			strokeColor: '#393'
		  },
		  //100 / (totaal aantal punten / punt waar je bent )
		  offset: '0%'
			}],
		carId: Math.floor((Math.random() * 100000)+1),
		stepId: 0,
		date: d.getDate() 
  });
  line.setVisible(true);
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
		line.stepId = count;
	}, 50);
};



function newAnimate(route, line)
{
	//console.log(line.carId);
	//console.log("duration = " + route.routes[0].legs[0].duration.value);
	//console.log(route.routes[0].overview_path.length);
	var avgTimePerStep = (route.routes[0].legs[0].duration.value) / (route.routes[0].overview_path.length);
	//console.log("avgTimePerStep is " + avgTimePerStep);
	var stepCoordinates =
	{
	};
	var i = 0;
	var intervalForRoute = window.setInterval(function() {
		i++;
		
		if(i < route.routes[0].overview_path.length)
		{
			var value = route.routes[0].overview_path[i];
			stepCoordinates.stepLat = value.lat().toFixed(6);
			stepCoordinates.stepLon = value.lng().toFixed(6);
			stepCoordinates.id = line.carId;
			stepCoordinates.stepId = line.stepId;
			stepCoordinates.date = line.date;

            console.log('creating post request');

            $.ajax({
                type: "POST",
                //the url where you want to sent the userName and password to
                url: "http://localhost:8080/simulatiemodule/rest/simulatie",
                dataType: 'json',
                contentType: 'application/json',
                async: true,
                //json object to sent to the authentication url
                data: JSON.stringify(stepCoordinates),
                success: function (data, status) {
                    console.log(data);
                }
            });

			moveToStep(stepCoordinates, i, line, route);
			console.log(stepCoordinates);
		}
		else{
			console.log("done");
			clearInterval(intervalForRoute);
		}
			
		}, avgTimePerStep* secondsToMilliSeconds)	
}


function moveToStep(stepCoordinates, index, line, route)
{
	console.log("step " + index);
	var icons = line.get('icons');
	
	//Ajax call to java layer with line.carId and stepcoordinates
	
	icons[0].offset = (index/route.routes[0].overview_path.length) * 100 + '%';
	console.log("offset = " +((index/route.routes[0].overview_path.length) * 100 + '%'));
	line.set('icons', icons);
	line.stepId = index;
}

function updateGui(response, line)
{	
	//setMapToCenter();
	document.getElementById("ammountofcars").innerHTML = cars;
	var carToAdd = document.createElement("p");
	//console.log(line);

	var pathlenght = response.routes[0].overview_path.length;
	var pathDurationSec = response.routes[0].legs[0].duration.value;
	var pathStepDuration = pathDurationSec/pathlenght;


	//console.log(pathlenght);
	//console.log(pathDurationSec);
	//console.log(pathStepDuration);
	//console.log(response.routes[0].overview_path.forEach(function (value, index) { console.log(value.lat());
                                                                                    //console.log(value.lng());}));
	carToAdd.innerHTML = "A car is driving from " + response.request.origin.query + " to " + response.request.destination.query;
	document.getElementById("directions").appendChild(carToAdd);
	//document.getElementById("simulation_waypointslist").appendChild(carToAdd);
}
