import React, {useEffect, useState, useRef} from 'react';
import _ from 'lodash';
import axios from 'axios';
import { getRadiusFromLatLonInM } from '../helpers';
import './SearchBox.css';
import pin from '../icons/gelp.png';
// import SearchButton from './SearchButton';

// const svgTemplate = "<svg xmlns='http://www.w3.org/2000/svg' width='6' height='10' viewBox='0 0 20 34.9'><g transform='translate(-814.59595 -274.38623)matrix(1.1855854 0 0 1.1855854 -151.17715 -57.3976)'><path d='m817.1 283c-1.3 1.3-2 3.3-2 5.1 0.1 3.8 1.8 5.3 4.6 10.6 1 2.3 2 4.8 3 8.9 0.1 0.6 0.3 1.2 0.3 1.2 0.1 0 0.2-0.5 0.3-1.1 1-4.1 2-6.5 3-8.9 2.8-5.3 4.5-6.7 4.6-10.6 0-1.8-0.8-3.8-2-5.1-1.4-1.5-3.6-2.7-5.9-2.7-2.3 0-4.5 1.1-5.9 2.6z' style='fill:{{ color }};stroke:#000'/><circle r='3' cy='288.3' cx='823' style='fill:none;opacity:0'/></g></svg>";
// const googlePin = svgTemplate.replace('{{ color }}', '#1ea829');
// const yelpPin = svgTemplate.replace('{{ color }}', '#d32323');

let searchForBox;
let service;
let infowindow;
let markers = [];
let didSubmit = false;

const SearchBox = ({map, places, setPlaces, setIsLoading}) => {
    const searchForEl = useRef(null);
    const [bounds, setBounds] = useState({});
    const [target, setTarget] = useState({});
    const [googleLoaded, setGoogleLoaded] = useState(false);
    const [yelpLoaded, setYelpLoaded] = useState(false);

    useEffect(() => {
        setPlaces({...places, ...target});
        if (!_.isEmpty(target) && target.googlePlaces !== undefined) {
            setGoogleLoaded(true);
        } else if (!_.isEmpty(target) && target.yelpPlaces !== undefined) {
            setYelpLoaded(true);
        }
    }, [target])

    useEffect(() => {
        if(googleLoaded && yelpLoaded)
            setIsLoading(false);
    }, [googleLoaded, yelpLoaded]);

    useEffect(() => {
        let mapListen;
        let searchListen;

        const mapChanged = () => {
            searchForBox.setBounds(map.getBounds());
            if (didSubmit) {
                setBounds(map.getBounds());
                didSubmit = false;
            }
        }

        if (map != null && !_.isEmpty(map)) {
            searchForBox = new window.google.maps.places.SearchBox(searchForEl.current);
            mapListen = map.addListener("bounds_changed", () => mapChanged());
            searchListen = searchForBox.addListener("places_changed", () => submit());
            service = new window.google.maps.places.PlacesService(map);
            infowindow = new window.google.maps.InfoWindow();
        }

        return () => {
            window.google.maps.event.removeListener(mapListen);
            window.google.maps.event.removeListener(searchListen);
        }
    }, [map])

    const submit = (e) => {
        setIsLoading(true);
        setGoogleLoaded(false);
        setYelpLoaded(false);
        if (e !== undefined)
            e.preventDefault();
        if (map !== null && !_.isEmpty(map) && service !== null && searchForEl.current.value !== '') {
            didSubmit = true;
            if (searchForBox.getPlaces()[0])
                map.setCenter(searchForBox.getPlaces()[0].geometry.location);
            else {
                setIsLoading(false); // should also add toast to let user know that no results were found
                console.log("no places found");
            }
        }
    }

    useEffect(() => {
        if (searchForBox !== undefined) {
            setTarget({googlePlaces: searchForBox.getPlaces()});

            let center = bounds.getCenter();
            let rad = getRadiusFromLatLonInM(
                bounds.getNorthEast().lat(), bounds.getNorthEast().lng(), 
                bounds.getSouthWest().lat(), bounds.getSouthWest().lng());
            let yelpRequest = {
                latitude: center.lat(),
                longitude: center.lng(),
                radius: rad,
                term: searchForEl.current.value
            }
            axios.post('/yelp', { yelpRequest })
            .then(res => {setTarget({yelpPlaces: res.data.businesses})});
        }
    }, [bounds])

    // scroll to div given div id
    window.smoothScroll = function(id) {
        let target = document.getElementById(`${id}`);
        let scrollContainer = target;
        do { //find scroll container
            scrollContainer = scrollContainer.parentNode;
            if (!scrollContainer) return;
            scrollContainer.scrollTop += 1;
        } while (scrollContainer.scrollTop === 0);
    
        let targetY = 0;
        do { //find the top of target relatively to the container
            if (target === scrollContainer) break;
            targetY += target.offsetTop;
        } while (target = target.offsetParent);
    
        let scroll = function(c, a, b, i) {
            i++; if (i > 30) return;
            c.scrollTop = a + (b - a) / 30 * i;
            setTimeout(function(){ scroll(c, a, b, i); }, 20);
        }
        // start scrolling
        scroll(scrollContainer, scrollContainer.scrollTop, targetY, 0);
    }

    useEffect(() => {
        if (_.isEmpty(places.yelpPlaces) && _.isEmpty(places.googlePlaces)) {
            return;
        }
        document.getElementById('content').scrollTo({ top: 0 });
        // clear all map markers
        if (!_.isEmpty(markers))
            markers.forEach(marker => marker.setMap(null));
        markers = [];

        // on click show info popup and scroll results column to matching business
        const markerClick = (mark, id) => {
            infowindow.setContent(mark.title);
            infowindow.open(map, mark);
            window.smoothScroll(id);
        }
        let resizeBounds = new window.google.maps.LatLngBounds();
        let addrDict = [];
        Object.entries(places).forEach(placeArray => {
            placeArray[1].forEach(place => {
                if (!place.geometry && !place.coordinates) {
                    console.log("Returned place contains no geometry");
                    return;
                }
                // dont add marker for yelp location if same google location already exists
                if (place.geometry) { // is google object
                    addrDict.push(place.formatted_address);
                } else { // is yelp object
                    if (addrDict.find(addr => addr.startsWith(place.location.address1))) {
                        return;
                    }
                }
                // let pin = place.geometry ? googlePin : yelpPin;  // eventually change pins to indicate google only, yelp only, or google+yelp result
                let icon = {
                    url: pin.toString(),// for SVG: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(pin),
                    size: new window.google.maps.Size(40, 40),
                    origin: new window.google.maps.Point(0, 0),
                    anchor: new window.google.maps.Point(20, 40),
                    scaledSize: new window.google.maps.Size(40, 40)
                };
            
                // Create a marker for each place.
                let marker = new window.google.maps.Marker({
                    map: map,
                    icon: icon,
                    title: place.name,
                    position: place.geometry ? place.geometry.location : {lat: place.coordinates.latitude, lng: place.coordinates.longitude}
                    });
                marker.addListener('click', () => markerClick(marker, place.geometry ? place.place_id : place.alias));
                markers.push(marker);
                place.marker = marker;
                resizeBounds.extend(marker.getPosition());
            });
        })
        map.fitBounds(resizeBounds);
        
    }, [places]);

    // const renderSearchButton = () => {
    //     if (mapLoaded) {
    //         return (<SearchButton box={searchForBox}/>);
    //     }
        
    //     return null;
    // }

    return (
        <div className="w-100">
            <input ref={searchForEl} className="form-control" id="searchFor" aria-describedby="search for" placeholder="Pizza near me"/>
            {/* {renderSearchButton()} */}
        </div>
    );
}

export default SearchBox;