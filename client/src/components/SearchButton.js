import React from 'react';

const SearchButton = ({box}) => {
    const btnStyle = {
        position: 'absolute',
        margin: 'auto',
        top: '9rem',
        width: '7rem',
        left: '50%',
        marginLeft: '-3.5rem'
    };
    console.log("Test");
    console.log(box);

    return (
        <button className="btn btn-outline-primary" onClick={() => window.google.maps.event.trigger(box, 'places_changed')} style={btnStyle}>Search Area</button>
    );
}

export default SearchButton;