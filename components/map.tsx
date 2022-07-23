import { useState, useMemo, useCallback, useRef } from "react";
import {
  GoogleMap, // GoogleMap is google's own map component
  Marker,
  DirectionsRenderer,
  Circle,
  MarkerClusterer,
} from "@react-google-maps/api";
import Places from "./places";  // we'll use this to help us search for places
import Distance from "./distance";
import { ToastContainer, toast } from 'react-toastify';  // toast notifications
import 'react-toastify/dist/ReactToastify.css';

// we work in typscript, so here are some shortcuts instead of having to type the full name
type LatLngLiteral = google.maps.LatLngLiteral;
type DirectionsResult = google.maps.DirectionsResult;
type MapOptions = google.maps.MapOptions;

// this is our Map component
export default function Map() {

  // office is used in places, they will be latitude and longitude
  const [office, setOffice] = useState<LatLngLiteral>({ lat: 43.45, lng: -80.49 });
  const [directions, setDirections] = useState<DirectionsResult>();

  // we will use this map ref to reference the GoogleMap later for stuff like controlling zoom
  const mapRef = useRef<GoogleMap>(); // btw typescript lets you define a type, a GoogleMap class in this case

  // this is where the map will default center, even on rerender
  const center = useMemo<LatLngLiteral>(
    // tells react to use this as default location value, unless dependency changes but since 
    // you let and empty [], it doesn't and will default
    () => ({ lat: 43.45, lng: -80.49 }),
    []
  );

  // we simplified the map (no satelite or map options)
  const options = useMemo<MapOptions>(
    // these options disable default ui and clickable icons like locations
    () => ({
      // map id determines the styling of your map, you can hardcode this since its not secretive
      // you can adjust the styling of your map on google cloud
      mapId: "42beba768a46a79b",
      disableDefaultUI: true,
      clickableIcons: false,
    }),
    []
  );

  // our custom onLoad function will use useCallback (similiar to useMemo)
  // its a function we dont run immediately on define, but we also dont wanna generate a new version
  // of it on rerender each time, this is to optimize rerendering
  const onLoad = useCallback(
    // recieves instance of the map, and set mapRef to the map, plus a dependency array
    // this is how we set our map reference
    (map) => (mapRef.current = map), []);

  // houses is an array of randomly generate houses around the center
  // center is a dependency so it regens each time center changes
  const houses = useMemo(() => generateHouses(office), [office]);
  const nearestHouse = useMemo(() => findNearHouse(office, houses), [office])

  const fetchDirections = (house: LatLngLiteral) => {
    if (!office) return;

    // service used to find directions of two groups
    const service = new google.maps.DirectionsService();

    // route is from house marker to your center marker
    service.route(
      {
        origin: house,
        destination: office,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK" && result) {
          setDirections(result);  // sets a DirectionsResult object which the maps API can render
        }
      }
    );
  };

  // toast message
  // really scuffed implementation of reverse geocoding because it only displays the actual current area locations on the 2nd search onward
  const notify = async () => {
    const geocoder = new google.maps.Geocoder()
    let location = await geocoder.geocode({ location: nearestHouse }).then((r) => {
      return r.results[0].formatted_address
    })
    toast('Nearest store at ' + location);
  }

  // scuffed, this notifies twice
  useMemo(() => notify(), [office])

  // two big divs (left side for suggestions stuff, right side for map)
  return (
    <div className="container">
      {/* Controls is where you put your google places search bar */}
      <div className="controls">
        <h1>Nearby stores?</h1>

        {/* We'll use our places component here */}
        <Places
          // expects a setOffice function to update state to store latitude and longitude of selected office
          // you defined those states above
          setOffice={(position) => {
            // this function takes a position, and it will call the setOffice state function
            // while the places component is rendered, it can call its setOffice prop to update the location the map is zoomed on
            setOffice(position);
            // not only do we update state but we also move map to position with mapRef
            // we just .current? > .current because position may not be available, just in case
            mapRef.current?.panTo(position);
          }}
        />
        {!office && <p>Enter the address of your office.</p>}

        {/* Get the [0] (1st) route */}
        {directions && <Distance leg={directions.routes[0].legs[0]} />} 
        
      </div>

      {/* Map is where you put actual map */}
      <div className="map">

        {/* GoogleMap component is your actual map, it needs some props to work */}
        <GoogleMap
          //  zoom = It needs default zoom level.
          zoom={10}

          //  center = where it centers at start (don't hard code cause it will center back to that coordinate on each rerender
          //  even when user have moved map to somewhere else), we can define a center with useMemo
          center={center}

          // container is what space this map is rendered into (this is the id in the .css file), you set it to 100% width of the map component which is 80% of the site
          mapContainerClassName="map-container"

          // our options removed some stuff
          options={options}

          // Google maps has an onload function that when it finishes loading, it gives reference to the map
          onLoad={onLoad}
        >
          {/* render directions here */}
          {directions && (
            <DirectionsRenderer
              directions={directions}
              options={{
                polylineOptions: {
                  zIndex: 50,
                  strokeColor: "#1976D2",
                  strokeWeight: 5,
                },
              }}
            />
          )}

          {/* if there is an office (places component sets office location when user click suggest),
              then put a marker at office location lat/lng*/}
          {/* this is one way to do an if statement, you could also do a ternary approach */}
          {office && (
            <>
              {/* All of this is in a fragment, so the marker, houses, circles will all appear in one area */}
              <Marker
                position={office}
                icon="https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png"
              />

              {/* clustering the house pins together when you zoom out so instead of showing 100 pins, it only show a few pins
                  with a number to indicate how many pins in that cluster pin */}
              <MarkerClusterer>
                {(clusterer) =>
                  houses.map((house) => {
                    return (
                      <Marker
                        key={house.lat}
                        position={house}
                        clusterer={clusterer} // pass the clusterer prop
                        onClick={() => {
                          fetchDirections(house);
                        }}
                      />

                    )
                  })
                }
              </MarkerClusterer>

              {/* center circle at office coordinate, radius is in meters so 15000 = 15km
                  you set up the color styling below */}
              <Circle center={office} radius={15000} options={closeOptions} />
              <Circle center={office} radius={30000} options={middleOptions} />
              <Circle center={office} radius={45000} options={farOptions} />
            </>
          )}
        </GoogleMap>
      </div>
    </div>
  );
}


// these options are the styling for our commute distance circles (close to far)
const defaultOptions = {
  strokeOpacity: 0.5,
  strokeWeight: 2,
  clickable: false,
  draggable: false,
  editable: false,
  visible: true,
};
const closeOptions = {
  ...defaultOptions,
  zIndex: 3,
  fillOpacity: 0.05,
  strokeColor: "#8BC34A",
  fillColor: "#8BC34A",
};
const middleOptions = {
  ...defaultOptions,
  zIndex: 2,
  fillOpacity: 0.05,
  strokeColor: "#FBC02D",
  fillColor: "#FBC02D",
};
const farOptions = {
  ...defaultOptions,
  zIndex: 1,
  fillOpacity: 0.05,
  strokeColor: "#FF5252",
  fillColor: "#FF5252",
};

// generate houses to show them on the map, this is our mock data
const generateHouses = (position: LatLngLiteral) => {
  const _houses: Array<LatLngLiteral> = [];
  for (let i = 0; i < 100; i++) {
    const direction = Math.random() < 0.5 ? -2 : 2;
    _houses.push({
      lat: position.lat + Math.random() / direction,
      lng: position.lng + Math.random() / direction,
    });
  }
  return _houses;
};

// calculate nearest house
const findNearHouse = (office: LatLngLiteral, houses: Array<LatLngLiteral>) => {
  const target = office.lat + office.lng
  const values: Array<number> = []

  // get absolute distance value of each house
  houses.map((house) => {
    const value = Math.abs(Math.abs(target) - Math.abs(house.lat + house.lng))
    values.push(value)
  })

  // find min using reduce function
  const min = values.indexOf(values.reduce((a,b) => Math.min(a,b)))
  return houses[min]
}