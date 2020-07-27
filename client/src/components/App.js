import React, { useState } from 'react';
import Navbar from './Navbar';
import FilterBar from './FilterBar';
import Map from './Map';
import Content from './Content';

import './App.css';

let mapFullWidth = true;

const App = () => {
    const [map, setMap] = useState({});
    const [places, setPlaces] = useState({googlePlaces: [], yelpPlaces: []});

    
    const renderContent = () => {
        if (places.googlePlaces.length === 0 && places.yelpPlaces.length === 0)
            return null;

        mapFullWidth = false;
        return (
            <div className="col-md-4 overflow-auto p-0" id="content">
                <Content map={map} places={places}/>
            </div>
        );
    }
    return (
        <div className="container-fluid p-0 d-flex flex-column contentContainer">
            <div className="sticky-top">
                <Navbar map={map} places={places} setPlaces={setPlaces}/>
                <FilterBar />
            </div>
            <div className="row row-cols-sm-1 row-cols-md-2 justify-content-center m-0 mainContent">
                    {renderContent()}
                    <div className={`${mapFullWidth ? 'col-md-12' : 'col-md-8'} p-0 overflow-hidden mapContainer`}>
                        <Map map={map} setMap={setMap}/>
                    </div>
            </div>
        </div>
    );
}

export default App;