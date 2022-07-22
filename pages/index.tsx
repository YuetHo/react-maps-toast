import { useLoadScript } from "@react-google-maps/api";
import Map from "../components/map";

/*
    In google cloud, you need to enable the following API:
    Maps JavaScript API: for using the map
    Places API: to search place
    Geocoding API: to convert string address of places into latitude and longitude
    Directions API: to ask for direction between two coordinates
*/
export default function Home() {

  // isLoaded is our variable to know when map is ready to display
  const { isLoaded } = useLoadScript({
    // API is from google cloud, keep your API private so don't hardcode it here
    // we'll keep the API key in a local file for now
    // you need NEXT_PUBLIC_ for nextJS to expose the key
    googleMapsApiKey: 'AIzaSyDftFMAJdxsfv797H3rsVtO8SccLMFKn2s',

    // this is which library you want to use with this google maps script, we will work with google places
    libraries: ["places"],
  });

  // check to see if this script has finished loading, shows loading for a split second because it loads the site fast
  if (!isLoaded) return <div>Loading...</div>;
  return <Map />;  // this map component is what we render (from our components folder)
}
