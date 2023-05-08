import React from 'react'
import { GoogleMap, MarkerF, InfoWindowF, useLoadScript } from '@react-google-maps/api';
import usePlacesAutocomplete, { getGeocode, getLatLng, } from 'use-places-autocomplete';
import { Combobox, ComboboxInput, ComboboxPopover, ComboboxList, ComboboxOption, } from '@reach/combobox';
import Geocode from 'react-geocode';
import axios from 'axios';
import * as DateHolidays from 'date-holidays';

import '@reach/combobox/styles.css';
import './globals.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'



export default function App() {
  const { isLoaded } = useLoadScript({
    //id: 'doyeonkim-cpt304',
    googleMapsApiKey: "Google API",
    libraries: ['places'],
  });

  if (!isLoaded) return <div>Loading...</div>;
  return <Map />;
}

// map initial position
// the map location can be changed by function Map()
const center = { lat: 37.5656, lng: 126.9769 };

function Map() {
  // const to save map elements
  const [map, setMap] = React.useState(null);
  const [markers, setMarkers] = React.useState([]); // when map selected, display marker
  const [markerSelected, setMarkerSelected] = React.useState(null);

  // const to save country, state and city information
  const [Country, setCountry] = React.useState(null);
  const [State, setState] = React.useState(null);
  const [City, setCity] = React.useState(null);
  const [CountryName, setCountryName] = React.useState(null);
  const [StateName, setStateName] = React.useState(null);
  const [CityName, setCityName] = React.useState(null);

  // const for holidays, hotels and weathers
  const [holidays, setHolidays] = React.useState([]);
  

  // get the client current location when loading the map
  const onLoad = React.useCallback(function callback(map) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        var lat = position.coords.latitude;
        var lng = position.coords.longitude;
        map.setCenter(new window.google.maps.LatLng(lat, lng));
        setMarkers((current) => [
          ...current,
          {
            lat: lat,
            lng: lng
          }
        ]);
      });
      setMap(map)
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  }, [])

  const onUnmount = React.useCallback(function callback(map) {
    setMap(null)
  }, [])

  // get the location when map is clicked
  const onMapClick = (e) => {
    // to put only one marker, setMarkers would be:
    // setMarkers([{
    //   lat: e.latLng.lat(),
    //   lng: e.latLng.lng()
    // }]);
    setMarkers((current) => [
      ...current,
      {
        lat: e.latLng.lat(),
        lng: e.latLng.lng()
      }
    ]);
  }


  return (
    <>
      <div className='places-container'>
        <PlacesAutocomplete
          setMarkers={setMarkers}
          map={map}
          setMap={setMap}
        />
      </div>

      <GoogleMap
        mapContainerClassName='map-container'
        center={center}
        zoom={7}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={onMapClick}
      >
        {markers.map((marker) => (
        <MarkerF
          position={{ lat: marker.lat, lng: marker.lng }}
          onClick={() => {
            // reset city, because some countries do not have city information
            setCity(null);
            setCityName(null);
            console.log(marker);
            setMarkerSelected(marker);
            
            // call address
            Geocode.setApiKey("Google API");
            Geocode.fromLatLng(marker.lat, marker.lng).then(
              (response) => {
                console.log('geocode');
                let city, state, country;
                let cityName, stateName, countryName;
                for (let i = 0; i < response.results[0].address_components.length; i++) {
                  for (let j = 0; j < response.results[0].address_components[i].types.length; j++) {
                    switch (response.results[0].address_components[i].types[j]) {
                      case "locality":
                        city = response.results[0].address_components[i].long_name;
                        cityName = response.results[0].address_components[i].short_name;
                        setCity(city);
                        setCityName(cityName);
                        break;
                      case "administrative_area_level_1":
                        state = response.results[0].address_components[i].long_name;
                        stateName = response.results[0].address_components[i].short_name;
                        setState(state);
                        setStateName(stateName);
                        break;
                      case "country":
                        country = response.results[0].address_components[i].long_name;
                        countryName = response.results[0].address_components[i].short_name;
                        setCountry(country);
                        setCountryName(countryName);
                        break;
                    }
                  }
                }
              },
              (error) => { console.error(error); }
            );
			
          }}
        />
        ))}
        
        {markerSelected && 
          <InfoWindowF
            position={markerSelected}
            options={{ pixelOffset: new window.google.maps.Size(0, -25) }}
            onCloseClick={() => {      // handle not infowindow not displaying error after 'x' button on window is pressed
              setMarkerSelected(null); // delete all selected marker information
            }}
          >
            <div>
              <h4>{Country}</h4>
              <div style={{ whiteSpace: 'pre-wrap' }}>{State}</div>
              <div style={{ whiteSpace: 'pre-wrap' }}>{City}</div>
              <div class='scrollFix'>
                <Holidays
                  CountryName={CountryName}
                  StateName={StateName}
                  CityName={CityName}
                  marker={markerSelected}
                  map={map}
                />
              </div>
            </div>
          </InfoWindowF>
        }
      </GoogleMap>
    </>
  )
}

// further process of usePlacesAutocomplete for searching locations
const PlacesAutocomplete = ({ setMarkers, map, setMap }) => {
  const {
    ready,
    value,
    setValue,
    suggestions: { status, data },
    clearSuggestions,
  } = usePlacesAutocomplete(); // call useSearchBox hook

  const handleSelect = async (address) => {
    setValue(address, false);
    clearSuggestions();

    const results = await getGeocode({ address });
    const { lat, lng } = await getLatLng(results[0]);
    // change the center of the map
    map.setCenter(new window.google.maps.LatLng(lat, lng));
    setMap(map);
    // set marker on the map
    setMarkers((current) => [...current, { lat, lng }]);
  };

  return (
    <Combobox onSelect={handleSelect}>
      <ComboboxInput
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={!ready}
        className='combobox-input'
        placeholder='Search an address'
        />
      <ComboboxPopover>
        <ComboboxList>
          {status === 'OK' &&
            data.map(({ place_id, description }) => (
              <ComboboxOption key={place_id} value={description} />
            ))}
        </ComboboxList>
      </ComboboxPopover>
    </Combobox>
  )
}

// retrieves the list of holidays by country, state and city
// as in some countries, holidays vary by state or city as well
const Holidays = ({ CountryName, StateName, CityName, setHolidays, marker, map }) => {
  const [unix, setUnix] = React.useState(null); // const to save date unix value for weather
  const [selector, setSelector] = React.useState(null);


  const jsonResult = require ('./holidays_dict.json');
  console.log(jsonResult);
  var dict = jsonResult.holidays;
  console.log(CountryName)
  console.log(StateName)
  console.log(CityName);

  let lang = '';
  let days_list = [];
  let days_name = [];
  let dates_list = [];

  // variables to store holidays
  if( dict.hasOwnProperty(CountryName) ) {
    const hd = new DateHolidays.default();

    hd.init(CountryName);
    if (hd.__conf.state) {
      hd.init(CountryName, StateName);
      if (hd.__conf.region) {
        hd.init(CountryName, StateName, CityName);
      }
    }
    hd.getHolidays(2022)
    Object.entries(hd.holidays).map((hol, index) => {
      let holiday = hol[1].fn.holidays;
      let date = hol[0];
      let day = holiday[date].name.en;
      days_list.push( [date, ' ', day] );
      dates_list.push(date);
    })
  }

  return (
    <div>
	  <hr/>
      <div> Public Holidays : </div>
      <div>
      {days_list.map((days, index) => ( // for each holiday, process following
        <div key={index}>
          <label>
            <input
              name="holidays"
              value={days}
              type="radio"
              onChange={(event) => {
                if (event.target.checked) {
                  setSelector(days);

                  // get unix value
                  var date = dates_list[index]
                  date = date.replace('-0-', '-');
                  date = date.replace(/([^0-9]{2}-[^0-9]{2})/g, '');
                  if (!date.includes("2022")) {
                    date = `2022-${date}`;
                  }
                  var unix = Math.round(new Date(date).getTime()/1000);
                  setUnix(unix); // save unix data
                  
                } else {
                  setSelector(null);
                  setUnix(null);
                }
              }}
            />
          </label>
          <span> {days}</span>
          <div style={{ whiteSpace: 'pre-wrap' }}>
            {(() => {
              //console.log(selector === days)
              if (JSON.stringify(selector) == JSON.stringify(days)) {
                // get and display weather data
                return(<Weather marker={marker} map={map} unix={unix} />);
              }
            })()}
          </div>
          <div>
            {(() => {
              // get and display list of hotels
              if(selector && (JSON.stringify(selector) == JSON.stringify(days))) {
                return(<Hotels marker={marker} map={map} />);
              }
            })()}
          </div>
        </div>
      ))}
      </div>
	</div>
  );

}

// request for historical weather information
const Weather = ({ marker, map, unix }) => {
  const [weather, setWeather] = React.useState([]);

  // call only once
  React.useEffect(() => {
    // call history weather
    const api = {
      key: "historical weather API",
      base: "https://api.openweathermap.org/data/3.0/onecall/timemachine",
    };

    const url = `${api.base}?lat=${marker.lat}&lon=${marker.lng}&appid=${api.key}&dt=${unix}`;
    axios.get(url).then((responseData) => {
      //console.log('weather',responseData);
      const data = responseData.data.data[0];
      console.log('weather',data);
      setWeather({
        id: data.weather[0].id,
        temperature: data.temp,
        main: data.weather[0].main,
        loading: false,
      });
    });
  }, []);
  
  return (
    <div>
      <span>{['     ', weather.main]}</span>
    </div>
  );
}

// request for list of neighboring hotels
const Hotels = ({ marker, map }) => {
  const [hotels, setHotels] = React.useState([]);

  // call only once
  React.useEffect(() => {
    // find neighboring hotels
    //--> test
    // https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=31.278687,120.73932016666667&keyword=Hotel&radius=5000&key=AIzaSyAOsGufZ60m5bkegP00ueO17IyotCpB6vw
    var pyrmont = new window.google.maps.LatLng(marker.lat, marker.lng);
    var request = {
      location: pyrmont,
      radius: '5000',
      keyword: 'hotel'
    };
    let service = new window.google.maps.places.PlacesService(map);
    service.nearbySearch(request, function(results, status){
      if (status == window.google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
          var place = results[i];
          console.log(place);
          //createMarker(results[i]);
        }
        setHotels(results);
      }
    });
  }, []);
  
  return (
    <div class='scrollWithLeftSpace'>
      <span>Near Hotels :</span>
      {hotels.map((ht,index)=>(
        <li>{ht.name}</li>
      ))}
    </div>
  );
}