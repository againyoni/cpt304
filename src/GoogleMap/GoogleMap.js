import { useCallback, useEffect, useRef } from 'react';

function GoogleMap() {
  const mapElement = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const toggleSide = () => {
    setIsOpen(true);
  }

  // 컴포넌트가 마운트될 때, 수동으로 스크립트를 넣어줍니다. 
  // ﻿이는 script가 실행되기 이전에 window.initMap이 먼저 선언되어야 하기 때문입니다.
  const loadScript = useCallback((url: string) => {
    const firstScript = window.document.getElementsByTagName('script')[0];
    const newScript = window.document.createElement('script');
    newScript.src = url;
    newScript.async = true;
    newScript.defer = true;
    firstScript?.parentNode?.insertBefore(newScript, firstScript);
  }, []);


  // script에서 google map api를 가져온 후에 실행될 callback 함수
  const initMap = useCallback(() => {
    const { google } = window;
    if (!mapElement.current || !google) return;

    const location = { lat: 37.5656, lng: 126.9769 };
    const map = new google.maps.Map(mapElement.current, {
      zoom: 8,
      center: location,
    });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition);
    } else {
      alert("Geolocation is not supported by this browser.");
    }
    
    function showPosition(position) {
      var lat = position.coords.latitude;
      var lng = position.coords.longitude;
      map.setCenter(new google.maps.LatLng(lat, lng));
    }

    function Marker(map, location){
      const marker = new google.maps.Marker({
        position: location,
        map: map
      });
    }

    google.maps.event.addListener(map, 'click', function(event) {
      Marker(map, event.latLng); // set only one marker
    });

  }, []);


  useEffect(() => {
    const script = window.document.getElementsByTagName('script')[0];
    const includeCheck = script.src.startsWith(
      'https://maps.googleapis.com/maps/api'
    );

    // script 중복 호출 방지
    if (includeCheck) return initMap();

    // 호출 initMap function
    window.initMap = initMap;
    /*
    loadScript(
      'https://maps.googleapis.com/maps/api/js?key=클라이언트 키&callback=initMap&language=en'
      //AIzaSyAOsGufZ60m5bkegP00ueO17IyotCpB6vw
    );*/

  }, [initMap, loadScript]);

  return (
    <div ref={mapElement} style={{ minHeight: '800px', minWidth: '70%'}} /> // map loading
  );
  // height: 800px; /* The height is 800 pixels */
}


export default GoogleMap;