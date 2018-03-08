if (GBrowserIsCompatible())
{
 
      var map = new GMap2(document.getElementById("map"));
      map.addControl(new GMapTypeControl());
      map.setCenter(new GLatLng(55.8837213,10.5169774),7);
	  
	  var gdirections = [];
	  
      
      var step = 5; // metres
      var tick = 500; // milliseconds
	  
      // var eol;
	  var carindex = 0;
	  var cars = 0;
	  //add new car when dirn is loaded
      //var marker;
      var k=0; //??
      var stepnum=0;
      var speed = "";

	//d = distance in km
      function animate(d, dirn, marker) {

        var poly=dirn.getPolyline();
        var eol=poly.Distance();

        if (d>eol) { // einde bereikt
          document.getElementById("step").innerHTML = "<b>Trip completed<\/b>";
          document.getElementById("distance").innerHTML =  "Miles: "+(d/1609.344).toFixed(2);
          return;
        }
        var p = poly.GetPointAtDistance(d);
        if (k++>=180/step) {
			//center pane to center of simulated car
          /*map.panTo(p);*/
          k=0;
        }
		//output the lat and long of the simulated vihicle
		console.log(p.lat(), p.lng());
        marker.setPoint(p);
        /*document.getElementById("distance").innerHTML =  "Km: "+(d/1000).toFixed(2)+speed;*/
        if (stepnum+1 < dirn.getRoute(0).getNumSteps()) {
          if (dirn.getRoute(0).getStep(stepnum).getPolylineIndex() < poly.GetIndexAtDistance(d)) {
            stepnum++;
            /*var steptext = dirn.getRoute(0).getStep(stepnum).getDescriptionHtml();
            document.getElementById("step").innerHTML = "<b>Next:<\/b> "+steptext;*/
            var stepdist = dirn.getRoute(0).getStep(stepnum-1).getDistance().meters;
            var steptime = dirn.getRoute(0).getStep(stepnum-1).getDuration().seconds;
            var stepspeed = ((stepdist/steptime) * 2.24).toFixed(0);
            step = stepspeed/2.5;
            speed = "<br>Current speed: " + stepspeed +" mph";
          }
        } else {
          // if (dirn.getRoute(0).getStep(stepnum).getPolylineIndex() < poly.GetIndexAtDistance(d)) {
          //   document.getElementById("step").innerHTML = "<b>Next: Arrive at your destination<\/b>";
          // }
        }
        //updatePoly(d);
		setTimeout(function(){ animate(d+step, dirn, marker) }, tick);
      }
	  function addCar(dirn, car)
	  {
		  GEvent.addListener(dirn,"load", function() {
				//document.getElementById("controls").style.display="none"
                var poly=dirn.getPolyline();
				map.setCenter(poly.getVertex(0),17);
				map.addOverlay(new GMarker(poly.getVertex(0),G_START_ICON));
				map.addOverlay(new GMarker(poly.getVertex(poly.getVertexCount()-1),G_END_ICON));
				cars++;
				updateGui();
				
				//pick the next car icon from the list with car icons.
				
				
				var marker = new GMarker(poly.getVertex(0),{icon:car});
				carindex++;
				map.addOverlay(marker);
				/*var steptext = dirn.getRoute(0).getStep(stepnum).getDescriptionHtml();
				document.getElementById("step").innerHTML = steptext;*/
                var poly2 = new GPolyline([poly.getVertex(0)]);
				map.addOverlay(poly2);
				setTimeout(function(){ animate(0, dirn, marker) },2000);  // Allow time for the initial map display
			  });
			  
			  GEvent.addListener(dirn,"error", function() {
				alert("Location(s) not recognised. Code: "+dirn.getStatus().code);
			  });
	  }
		  
      function start() {
        var startpoint = document.getElementById("startpoint").value;
        var endpoint = document.getElementById("endpoint").value;
		
			var dirn = new GDirections();
			dirn.loadFromWaypoints([startpoint,endpoint],{getPolyline:true,getSteps:true});
			//gdirections.push(dirn);
			car = new GIcon();
			car.image="../../img/simulation/caricon.png";
			car.iconSize=new GSize(32,18);
			car.iconAnchor=new GPoint(16,9);
			addCar(dirn, car);
			
      }
    }
	else{
		var kop = document.createElement("h1");
		kop.innerHTML = "Get a better browser!!";
		document.body.appendChild(kop);
		var a = document.createElement("a");
		a.innerHTML = "Click here";
		a.href = "https://www.google.nl/chrome/index.html";
		a.target = "_blank";
		document.body.appendChild(a);
	}
	
function setSpeed(speed){
	console.log(speed);
	tick = (1/speed)*100;
}
function updateGui()
{
	document.getElementById("ammountofcars").innerHTML = cars;
}