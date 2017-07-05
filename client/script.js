// Dev case
const origin = '2050 S Bentley Ave Los Angeles 90025';
const dest = '1906 Ocean Ave, Santa Monica, CA';

function initMap() {
  const ds = new google.maps.DirectionsService;
  const dr = new google.maps.DirectionsRenderer;
  //const dr2 = new google.maps.DirectionsRenderer;
  
  // Updates map with given directions
  const onChangeHandler = function() {
    calculateAndDisplayRoute(origin, dest, ds, dr);
    //calculateAndDisplayRoute('2050 S Bentley Ave Los Angeles 90025', '5300 Beethoven Street, Los Angeles, CA 90066', ds, dr2);
  };
  
  // Render the map
  const map = new google.maps.Map(document.getElementById('map'), {
    zoom: 7,
    center: {lat: 41.85, lng: -87.65}
  });
  dr.setMap(map);
  //dr2.setMap(map);
  onChangeHandler();
}

function calculateAndDisplayRoute(origin, destination, ds, dr) {
  ds.route({
    origin,
    destination,
    travelMode: 'TRANSIT'
  }, function(response, status) {
    if (status === 'OK') {
      console.log(response);
      getWalkingSteps(response)
      dr.setDirections(response);
    } else {
      window.alert('Directions request failed due to ' + status);
    }
  });
}

function getWalkingSteps(response) {
  const walkingSteps = response.routes[0].legs[0].steps.filter(step => {
    return step.travel_mode === 'WALKING';
  });
  
  console.log(walkingSteps);
}
