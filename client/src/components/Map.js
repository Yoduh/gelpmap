import React, { useEffect, useRef, useState } from 'react';

const Map = ({map, setMap}) => {
    const [location, setLocation] = useState({lat: 35.779791, lng:-78.638149});
    const googleMapRef = useRef(null);
    const googleMap = useRef(null);

    const initMap = async () => {
        const map = await new window.google.maps.Map(googleMapRef.current, {
            zoom: 14,
            mapTypeId: "roadmap",
            gestureHandling: "greedy",
            center: {
                lat: location.lat,
                lng: location.lng
            }
        });
        setMap(map);
        return map;
    }

    useEffect(() => {
        const googleMapScript = document.createElement('script');
        googleMapScript.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAP_API_KEY}&libraries=places`;
        window.document.body.appendChild(googleMapScript);
        googleMapScript.addEventListener('load', () => { googleMap.current = initMap(); });
        window.navigator.geolocation.getCurrentPosition(
            position => setLocation({lat: position.coords.latitude, lng: position.coords.longitude}), //success callback
            err => console.log(err.message) //failure callback
        );
    }, []);

    return (
        <div id="map" ref={googleMapRef} />
    );
}

export default Map;