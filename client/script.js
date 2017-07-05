// Globals
const verbose = false;
const renderers = [];
let map;

function initMap() {
  
  // Render the map
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 7,
    center: {lat: 41.85, lng: -87.65}
  });
  
  //onChangeHandler();
}

// Updates map with given directions
const onChangeHandler = function() {
  
  // Clear the map first
  clearMap();
  
  calculateAndDisplayRoute(document.getElementById('origin').value, document.getElementById('destination').value, map);
};

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
        
        // Get routes
        const basicRoutes = await getRoutes(response);
        
        // Get routes, preferring rail. Run again to replace walking on new route
        const altRoutes = await getRoutes(response, {
          modes: ['RAIL','SUBWAY','TRAIN','TRAM'],
          routingPreference: 'FEWER_TRANSFERS'
        });
        
        // Determine which route is faster
        const basicDuration = getDuration(basicRoutes);
        const altDuration = getDuration(altRoutes);
        const routes = basicDuration <= altDuration ? basicRoutes : altRoutes;
        
        if (verbose) console.log('Alt duration (mins)', altDuration);
        if (verbose) console.log('Basic duration (mins)', basicDuration);
        
        // Plot routes
        routes.forEach(route => {
          const dr = new google.maps.DirectionsRenderer();
          dr.setMap(map);
          dr.setDirections(route);
          renderers.push(dr);
        });
        
        // Update map
        // Something is asynchronous above this that's causing problems...
        setTimeout(() => {showRoutes(response, map)}, 0);
        
        // Get durations
        const originalDuration = Math.round(response.routes[0].legs.reduce((dur, leg) => {
          return dur + leg.duration.value;
        }, 0) / 60);
        const newDuration = getDuration(routes);
        
        console.log('Original duration (mins)', originalDuration);
        console.log('New duration (mins)', newDuration);
        
      } else {
        window.alert('Directions request failed due to ' + status);
      }
    }
  );
}

// Clears the map of directions
const clearMap = () => {
  while (renderers.length > 0) {
    renderers.pop().setMap(null);
  }
}

// Returns a duration (in mins) for the given set of routes
const getDuration = (routes) => {
  return Math.round(routes.reduce((dur, route) => {
    return dur + route.routes[0].legs[0].duration.value;
  }, 0) / 60);
}

// Returns an array of routes
const getRoutes = async (response, transitOptions) => {
  // Intialize empty array of new routes
  const routes = [];

  // Iterate through steps in response
  for (step of response.routes[0].legs[0].steps) {
    // If the travel_mode is walking, set travel mode to biking
    const travelMode = step.travel_mode === 'WALKING' ? 'BICYCLING' : 'TRANSIT';

    // Push route to routes
    try {
      
      // Get route
      const route = await getRoute(step.start_location, step.end_location, travelMode, transitOptions);
      
      // If route contains any walking steps, getRoutes on that route and push into routes
      if (route.routes[0].legs[0].steps.filter(step => {return step.travel_mode === 'WALKING'}).length) {
        try {
          if (verbose) console.log('Route contains walking:', route);
          const recurseRoutes = await getRoutes(route);
          recurseRoutes.forEach(r => routes.push(r));
        }
        catch (err) {
          console.log(err);
          throw(err);
        }
      }
      
      // Else push into routes
      else routes.push(route);
    } 
    catch (err) {
      throw(err);
    }
  }
  
  return routes;
}


// Input:
  // origin (latlng)
  // destination (latlng)
  // departure_time (dateTime)
  // transit_mode (string, 'BICYCLING' or 'TRANSIT');
// Output:
  // promise that resolves to a route
const getRoute = (origin, destination, travelMode, transitOptions) => {
  // Get default transit route
  const ds = new google.maps.DirectionsService;
  
  return new Promise((resolve, reject) => {
    
    const request = {
      origin,
      destination,
      travelMode,
      transitOptions
    }
    
    ds.route(request, (response, status) => {
    
      if (verbose) console.log(`Getting ${travelMode} leg:`, request);
      if (verbose) console.log('Response:', response);
      
      if (status === 'OK') resolve(response);
      else reject(response);
    });
    
  });
}

// Input: 
  // Array of routes
  // Current map
// Output:
  // Map is zoomed to show entire route
const showRoutes = (response, map) => {
  const bounds = new google.maps.LatLngBounds();
  bounds.extend(response.routes[0].legs[0].start_location);
  bounds.extend(response.routes[0].legs[0].end_location);
  map.fitBounds(bounds);
}