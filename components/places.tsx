import usePlacesAutocomplete, // autocomplete hook which returns values to use to display and control google places
{
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import {
  Combobox, // combobox instead of div since it better lets ppl search google places
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
} from "@reach/combobox";
import "@reach/combobox/styles.css";
import { ToastContainer, toast } from 'react-toastify';  // toast notifications
import 'react-toastify/dist/ReactToastify.css';

type PlacesProps = {
  setOffice: (position: google.maps.LatLngLiteral) => void;
};

export default function Places({ setOffice }: PlacesProps) {

  // autocomplete hook which returns values to use to display and control google places
  // no script needed to load script beacuse you already did that in index.tsx where you set library = places
  const {
    ready,  // bool is script ready to use
    value,  // value user put in input box
    setValue,
    suggestions: { status, data },  // status of if we actual recieved suggestions, and the actual data
    clearSuggestions,  // whenever user selected a suggestion, we should remove others
  } = usePlacesAutocomplete();

  // async function because you work with promises inside of it
  // handles user clicking on a suggestion in the search
  // it takes string argument which is the selected suggestion location name
  const handleSelect = async (val: string) => {
    // update value to what user selected, and say false to shouldfetchdata to stop further loading data and dont want more
    setValue(val, false);
    clearSuggestions();   // user has selected an option, dont show the suggestions list anymore

    // now to convert address string to coordinates
    // geocode uses the text of the place and return the lat/lng coordinates
    // await it operator used in async functions to wait for a promise
    const results = await getGeocode({ address: val });
    const { lat, lng } = await getLatLng(results[0]); // there is only one element in results, grab the first one
    setOffice({ lat, lng });  // set office state to coordinate, this state as defined in map module will then pan map to location

  };


  // this will be your search bar, and dropdown suggested places list
  return (
    // combobox needs a onSelect function for when user clicks on any of the suggested options popup
    <Combobox onSelect={handleSelect}>

      {/* inside the box is the input */}
      <ComboboxInput
        value={value} // user input value, we need to listen for the value
        onChange={(e) => setValue(e.target.value)}  // listen for value on change in the input
        disabled={!ready} // disables the input area if not ready to use
        className="combobox-input"  // id for css
        placeholder="Search office address" // placeholder prompt to let user know what to type
      />

      {/* you will put the list of places suggestions here, popover is the list popup when you type a place in input */}
      <ComboboxPopover>
        <ComboboxList>
          { // verify google says status is OK, you got places to work with
            status === "OK" &&
            // if status was true then also map over the data
            // using each place's id and description, render a combobox option in the list
            data.map(({ place_id, description }) => (
              <ComboboxOption key={place_id} value={description} />
            ))}
        </ComboboxList>
      </ComboboxPopover>
    </Combobox>
  );
}
