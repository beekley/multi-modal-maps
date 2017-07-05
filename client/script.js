// Dev case
const origin = '2050 S Bentley Ave Los Angeles 90025';
const dest = '1906 Ocean Ave, Santa Monica, CA';
const alt = '5300 Beethoven Street, Los Angeles, CA 90066';

function initMap() {
  
  // Updates map with given directions
  const onChangeHandler = function() {
    calculateAndDisplayRoute(origin, dest, map);
  };
  
  // Render the map
  const map = new google.maps.Map(document.getElementById('map'), {
    zoom: 7,
    center: {lat: 41.85, lng: -87.65}
  });
  //dr2.setMap(map);
  onChangeHandler();
}

function calculateAndDisplayRoute(origin, destination, map) {
  // Get default transit route
  const ds = new google.maps.DirectionsService;
  ds.route(
    {
      origin,
      destination,
      travelMode: 'TRANSIT'
    },
    (response, status) => {
      if (status === 'OK') {
        
        // Break out walking steps
        const walking = getWalkingSteps(response);
        
        // Get biking directions for walking steps
        
        // Create array of promises
        const promises = [];
        walking.forEach(leg => {
          
          // Push a promise into an array that resolves with the response
          promises.push(new Promise((resolve, reject) => {
            ds.route(
              {
                origin: leg.start_location,
                destination: leg.end_location,
                travelMode: 'BICYCLING'
              },
              (response, status) => {
                if (status === 'OK') {

                  // Plot biking directions
                  const dr = new google.maps.DirectionsRenderer;
                  dr.setMap(map);
                  dr.setDirections(response);
                  resolve(response);

                } else {
                  reject(response);
                }
              }
            );
          }));
          
          // Plot biking direcions
        })
        
        
        // Get new transit directions starting when arriving at end of first biking leg
        
        // Plot transit directions
        
      } else {
        window.alert('Directions request failed due to ' + status);
      }
    }
  );
}

function getWalkingSteps(response) {
  return response.routes[0].legs[0].steps.filter(step => {
    return step.travel_mode === 'WALKING';
  });
}
