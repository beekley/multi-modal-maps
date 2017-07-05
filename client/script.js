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
    async (response, status) => {
      if (status === 'OK') {
        
        // Initialize current time as current time
        let departure_time = new Date();
        
        // Intialize empty array of new routes
        const routes = [];
        
        // Iterate through steps in response
        for (step of response.routes[0].legs[0].steps) {
          // If the travel_mode is walking, set travel mode to biking
          const travelMode = step.travel_mode === 'WALKING' ? 'BICYCLING' : 'TRANSIT';
        
          // Push route to routes
          try {
            routes.push(await getRoute(step.start_location, step.end_location, departure_time, travelMode));
          } 
          catch (err) {
            console.log(err);
          }
        }
        
        console.log(routes);
        
        // Plot routes
        routes.forEach(route => {
          const dr = new google.maps.DirectionsRenderer();
          dr.setMap(map);
          dr.setDirections(route);
        });
        
        // Get durations
        console.log('Original duration (mins)', Math.round(response.routes[0].legs.reduce((dur, leg) => {
          return dur + leg.duration.value;
        }, 0) / 60));
        
        console.log('New duration (mins)', Math.round(routes.reduce((dur, route) => {
          return dur + route.routes[0].legs[0].duration.value;
        }, 0) / 60));
        
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


// Input:
  // origin (latlng)
  // destination (latlng)
  // departure_time (dateTime)
  // transit_mode (string, 'BICYCLING' or 'TRANSIT');
// Output:
  // promise that resolves to a route
const getRoute = (origin, destination, departure_time, travelMode) => {
  // Get default transit route
  const ds = new google.maps.DirectionsService;
  
  return new Promise((resolve, reject) => {
    
    const request = {
      origin,
      destination,
      travelMode,
      //transit_routing_preference: 'fewer_transfers',
    }
    
    ds.route(request, (response, status) => {
      if (status === 'OK') resolve(response);
      else reject(response);
    });
    
  });
}
