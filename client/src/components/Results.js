import React, {useState} from 'react';
import _ from 'lodash'

import { ReactComponent as Star } from '../icons/star.svg';
import { ReactComponent as HalfStar } from '../icons/star-half.svg';
import yelp_half_star from '../icons/yelp_half_star.png';
import yelp_star from '../icons/yelp_star.png';
import yelp_no_star from '../icons/yelp_no_star.png';
import PlaceDetails from './PlaceDetails';
import './Results.css';

const Results = ({places, googleService}) => {
    const [placesClicked, setPlacesClicked] = useState([]);

    const ratings = (place) => {
        const combinedRatings = [];
        if (place.rating) {
            const rating = Number.isInteger(place.rating) ? place.rating + '.0' : place.rating;
            combinedRatings.push(<div key='0'>{rating} {stars(place.rating, true)}</div>);
        }
        if  (place.yelp_rating) {
            const rating = Number.isInteger(place.yelp_rating) ? place.yelp_rating + '.0' : place.yelp_rating;
            combinedRatings.push(<div key='1'>{rating} {stars(place.yelp_rating, false)}</div>);
        }
        return (combinedRatings);
    }
    const stars = (num, isGooglePlace) => {
        num = Math.round(num*2)/2; // rounds to nearest half
        let i;
        let stars = [];
        for(i = 1; i <= 5; i++) {
            if (i - num === 0.5)
                stars.push(isGooglePlace ? <HalfStar className='starlight' key={`g${i}`} alt="half star"/> : <img src={yelp_half_star} className='yelpstar' key={`y${i}`} alt="half star"/>)
            else if (i <= num)
                stars.push(isGooglePlace ? <Star className='starlight' key={`g${i}`} alt="full star"/> : <img src={yelp_star}  className='yelpstar' key={`y${i}`} alt="full star"/>)
            else
                stars.push(isGooglePlace ? <Star className='nostar' key={`g${i}`} alt="blank star"/> : <img src={yelp_no_star} className='yelpstar' key={`y${i}`} alt="blank star"/>)
        }
        return (<span>{stars}</span>);
    }

    const price = (num) => {
        return _(num).times(idx => <span key={idx} className="fas fa-dollar-sign"></span>);
    }
    
    const renderPlaces = _.isEmpty(places) ? null : places.map((place, index) => {
        return (
            <div key={place.place_id} id={place.id}>
                <hr />
                <div id="accordion">
                    <div className="card bg-transparent">
                        <div className="card-body">
                            <h5 className="card-title">{place.name}</h5>
                            {/* <a href={`${place.website}`}>{place.name}</a> */}
                            <div>{place.formatted_address}</div>
                            {ratings(place)}
                            <div>{place.user_ratings_total} reviews</div>
                            <div>{price(place.price_level)}</div>
                            <br />
                            <button className="btn btn-outline-primary" 
                                    data-toggle="collapse" data-target={`#collapse${index}`} 
                                    aria-expanded="false" aria-controls={`collapse${index}`} 
                                    onClick={() => setPlacesClicked( _.union(placesClicked, [place.place_id]) ) }>
                                        Show more
                            </button>
                        </div>
                        <div id={`collapse${index}`} className="collapse" aria-labelledby={`heading${index}`} data-parent="#accordion">
                            <div className="card-body">
                                <PlaceDetails placesClicked={placesClicked} 
                                    googleService={place.geometry ? googleService : null} // dont use googleService with yelp place
                                    id={place.place_id}/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    });

    return(
        <div className="text-center">
            <div className="card-columns d-flex flex-column">
                {renderPlaces}
                <hr className="mx-4" />
            </div>
        </div>
    );
};

export default Results;