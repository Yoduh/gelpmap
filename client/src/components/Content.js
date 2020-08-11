import React, {useEffect, useState} from 'react';
import Results from './Results';
import _ from 'lodash';

const Content = ({map, places}) => {
    const [combinedPlaces, setCombinedPlaces] = useState({});

    useEffect(() => {
        console.log(places);
        let uniqueYelpPlaces = [...places.yelpPlaces];
        places.googlePlaces.forEach(gPlace => {
            const duplicate = uniqueYelpPlaces.find(yPlace => gPlace.formatted_address.startsWith(yPlace.location.address1));
            if (duplicate !== undefined) {
                // googlePlaces already contains yelpPlace, just add rating to googlePlace
                gPlace.yelp_rating = duplicate.rating;
                uniqueYelpPlaces.splice(uniqueYelpPlaces.indexOf(duplicate), 1);
            }
        })
        uniqueYelpPlaces = uniqueYelpPlaces.map(place => {
            return({
                name: place.name,
                formatted_address: `${place.location.address1}, ${place.location.city}, ${place.location.state} ${place.location.zip_code}`,
                yelp_rating: place.rating,
                user_ratings_total: place.review_count,
                price_level: place.price ? place.price.length : 0,
                place_id: place.alias, // id for fetching more details
                id: place.id,
                marker: place.marker
            });
        })
        setCombinedPlaces(places.googlePlaces.concat(uniqueYelpPlaces));
    }, [places])

    const googleService = _.isEmpty(map) ? null : new window.google.maps.places.PlacesService(map);

    return (
        <Results places={combinedPlaces} googleService={googleService}/>
    );
}

export default Content;