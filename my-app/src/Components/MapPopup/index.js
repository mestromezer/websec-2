import React from 'react';

const MapPopup = ({ content }) => (
  <div
    id="popup"
    className="ol-popup"
    style={{
      backgroundColor: '#fff',
      border: '1px solid #ccc',
      padding: '10px',
      position: 'absolute',
      display: content ? 'block' : 'none',
      maxWidth: '200px',
      zIndex: 1000,
      boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
    }}
  >
    <div dangerouslySetInnerHTML={{ __html: content }} />
  </div>
);

export default MapPopup;
