import React, {useState, useEffect} from 'react';
import _ from 'lodash';
import axios from 'axios';
import './PlaceDetails.css';

const PlaceDetails = ({placesClicked, googleService, id}) => {
    const [placeDetails, setPlaceDetails] = useState({});
    const weekday = (new Date().getDay() + 6) % 7; // 0 = monday, 6 = sunday
    useEffect(() => {
        if (_.isEmpty(placeDetails) && placesClicked.indexOf(id) !== -1) {
            getPlaceDetails();
        }
    }, [placesClicked]);

    const getPlaceDetails = () => {
        // yelp request
        if (googleService === null) {
            axios.post(`/yelp/${id}`)
            .then(res => {processDetails(res.data)});
        }
        // google request
        else {
            let request = {
                placeId: id
            };
            googleService.getDetails(request, callback);
        }
    }

    const callback = (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
            setPlaceDetails(place);
        }
    }
    
    const processDetails = (yelpDetails) => {
        const finalizedDetails = yelpDetails;
        // hours
        const yelpWeekdayText = [];
        const weekdayStrings = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        let weekdayCount = 0;
        if (yelpDetails.hours === undefined)
            yelpWeekdayText.push("No hours found");
        else {
            if (yelpDetails.hours[0].open[0].day !== 0) // closed on Monday
                yelpWeekdayText.push(`${weekdayStrings[0]}: Closed`);
            yelpDetails.hours[0].open.forEach(yelpOpen => {
                let day = yelpOpen.day;
                if (day !== weekdayCount && ++weekdayCount !== day) {
                    yelpWeekdayText.push(`${weekdayStrings[weekdayCount - 1]}: Closed`);
                }
                else
                    yelpWeekdayText.push(`${weekdayStrings[weekdayCount]}: ${timeConvert(yelpOpen.start)} - ${timeConvert(yelpOpen.end)}`);
            });
            if (weekday !== 6) // closed on Sunday
                yelpWeekdayText.push(`${weekdayStrings[6]}: Closed`);
        }
        finalizedDetails.opening_hours = {weekday_text: yelpWeekdayText};

        // website + phone
        finalizedDetails.website = yelpDetails.url;
        finalizedDetails.formatted_phone_number = yelpDetails.display_phone;
        setPlaceDetails(finalizedDetails)
    }

    const timeConvert = (time) => {
        time = time.toString().match(/^([01]\d|2[0-3])([0-5]\d)(:[0-5]\d)?$/) || [time];
        if (time.length > 1) { // If time format correct
        time = time.slice(1); // Remove full string match value
        time[1] = ":" + time[1];
        time[5] = +time[0] < 12 ? ' AM' : ' PM'; // Set AM/PM
        time[0] = +time[0] % 12 || 12; // Adjust hours
        }
        return time.join(''); // return adjusted time or original string
    }
    
    const renderPlaceDetails = () => {
        if (_.isEmpty(placeDetails))
            return (
                <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Loading...</span>
                </div>
            ); // do loading animation
        let openHours = [];
        if (placeDetails.opening_hours !== undefined && placeDetails.opening_hours.weekday_text !== undefined) {
            const today = Intl.DateTimeFormat('en-US', {weekday: 'long'}).format(new Date());
            openHours = placeDetails.opening_hours.weekday_text.map((day,index) => {
                if (day.startsWith(today))
                    return(<div key={index}><strong>{day}</strong></div>);
                else
                    return(<div key={index}>{day}</div>);
            });
        }
        let images = [];
        if (placeDetails.photos !== undefined && placeDetails.photos.length > 0) {
            images = placeDetails.photos.map((photo, index) => {
                let carouselClass = 'carousel-item' + (index === 0 ? ' active' : '');
                return(
                    <div key={index} className={carouselClass}>
                            <img src={`${photo.getUrl ? photo.getUrl() : photo}`} className="d-block w-100" height="200" alt="business"/>
                    </div>
                );
            });
        }
        return (
            <div>
                <div id="surrounding">
                    <div id={`carousel-${id}`} className="carousel slide carousel-fade" data-ride="carousel" data-interval="false">
                        <div className="carousel-inner">
                            {images}
                        </div>
                        <a className="carousel-control-prev" href={`#carousel-${id}`} role="button" data-slide="prev">
                            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                            <span className="sr-only">Previous</span>
                        </a>
                        <a className="carousel-control-next" href={`#carousel-${id}`} role="button" data-slide="next">
                            <span className="carousel-control-next-icon" aria-hidden="true"></span>
                            <span className="sr-only">Next</span>
                        </a>
                    </div>
                </div>
                <div><strong>Telephone: </strong>{placeDetails.formatted_phone_number}</div>
                <div>{openHours}</div>
                <a className="btn btn-sm btn-info" href={`${placeDetails.website}`} target="_blank" rel="noopener noreferrer">Website</a>
            </div>
        );
    }

    return (
        <div>
        {renderPlaceDetails()}
        </div>
    );
}

export default PlaceDetails;