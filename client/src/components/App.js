import React, { useState } from 'react';
import Navbar from './Navbar';
// import FilterBar from './FilterBar';
import Map from './Map';
import Content from './Content';
import { LoopCircleLoading } from 'react-loadingg';

import './App.css';

let mapFullWidth = true;

const App = () => {
    // good use case for eventually using Context
    const [map, setMap] = useState({});
    const [places, setPlaces] = useState({googlePlaces: [], yelpPlaces: []});
    const [isLoading, setIsLoading] = useState(false);

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
        <div className="appWrapper">
            <div id="loader" className={isLoading ? '' :'hidden'}>
                <LoopCircleLoading color="#ff1a4c" />
            </div>
            <div className="container-fluid p-0 d-flex flex-column contentContainer">
                <div className="sticky-top">
                    <Navbar map={map} places={places} setPlaces={setPlaces} setIsLoading={setIsLoading}/>
                    {/* <FilterBar /> */}
                </div>
                <div className="row row-cols-sm-1 row-cols-md-2 justify-content-center m-0 mainContent">
                        {renderContent()}
                        <div className={`${mapFullWidth ? 'maxSize col-md-12' : 'minSize col-md-8'} p-0 overflow-hidden mapContainer`}>
                            <Map map={map} setMap={setMap}/>
                        </div>
                </div>
            </div>
        </div>
    );
}

export default App;