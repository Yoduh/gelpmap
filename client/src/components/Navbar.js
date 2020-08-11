import React from 'react';
import SearchBox from './SearchBox';
import gelp from '../icons/gelp.png';

const Navbar = ({map, places, setPlaces, setIsLoading}) => {
    return (
        <nav className="navbar navbar-dark bg-dark d-inline-flex flex-nowrap w-100">
            <img className="navbar-brand btn btn-link p-0" href="#" src={gelp} height='32' width='32' alt='brand'></img>
            <span className="navbar-text flex-shrink-0 mr-2">Search For </span>
            <SearchBox map={map} places={places} setPlaces={setPlaces} setIsLoading={setIsLoading}/>
        </nav>
    );
}

export default Navbar