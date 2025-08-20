import React, { useState, useEffect } from 'react';
import { MdRestaurant, MdLocalHospital, MdHotel, MdDirections, MdMap, MdPhone, MdLanguage } from 'react-icons/md';
import config from '../config';
import './NearbyPlaces.css';

const NearbyPlaces = ({ latitude, longitude }) => {
  const [activeTab, setActiveTab] = useState('restaurant');
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [allPlaces, setAllPlaces] = useState({ restaurant: [], hospital: [], lodging: [] });

  const placeTypes = [
    { key: 'restaurant', label: 'Restaurants', icon: <MdRestaurant /> },
    { key: 'hospital', label: 'Hospitals', icon: <MdLocalHospital /> },
    { key: 'lodging', label: 'Hotels & Motels', icon: <MdHotel /> }
  ];

  useEffect(() => {
    if (latitude && longitude) {
      fetchNearbyPlaces(activeTab);
    }
  }, [latitude, longitude, activeTab]);

  const fetchNearbyPlaces = async (placeType) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`🔍 Fetching nearby ${placeType}s for coordinates: ${latitude}, ${longitude}`);
      const apiUrl = `${config.API_BASE_URL}/api/places/nearby?lat=${latitude}&lon=${longitude}&type=${placeType}`;
      console.log(` API URL: ${apiUrl}`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); 
      
      const response = await fetch(apiUrl, { 
        signal: controller.signal,
        credentials: 'include'
      });
      clearTimeout(timeoutId);
      
      console.log(`📡 Response status: ${response.status}`);
      
      const data = await response.json();
      console.log(`📦 Response data:`, data);
      
      if (response.ok) {
        const placesList = data.places || [];
        console.log(` Found ${placesList.length} ${placeType}s`);
        setPlaces(placesList);
        
        setAllPlaces(prev => ({
          ...prev,
          [placeType]: placesList
        }));
      } else {
        setError(data.error || 'Failed to fetch nearby places');
        setPlaces([]);
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Request timed out. Please try again.');
      } else {
        console.error('Error fetching nearby places:', err);
        setError('Network error while fetching nearby places');
      }
      setPlaces([]);
    } finally {
      setLoading(false);
    }
  };

  const getGoogleMapsUrl = () => {
    const baseUrl = `${config.GOOGLE_MAPS_URL}/maps/search/?api=1&query=${latitude},${longitude}`;
    const allPlacesList = [
      ...allPlaces.restaurant.map(p => ({ ...p, type: 'restaurant' })),
      ...allPlaces.hospital.map(p => ({ ...p, type: 'hospital' })),
      ...allPlaces.lodging.map(p => ({ ...p, type: 'lodging' }))
    ];
    
    if (allPlacesList.length > 0) {
      const placeQueries = allPlacesList.map(place => 
        encodeURIComponent(`${place.name}, ${place.formatted_address || ''}`)
      ).join('|');
      return `${baseUrl}&query_place_id=${placeQueries}`;
    }
    
    return baseUrl;
  };

  const getPlaceGoogleMapsUrl = (place) => {
    if (place.geometry && place.geometry.location) {
      const lat = place.geometry.location.lat;
      const lng = place.geometry.location.lng;
      return `${config.GOOGLE_MAPS_URL}/maps/search/?api=1&query=${lat},${lng}`;
    }
    return `${config.GOOGLE_MAPS_URL}/maps/search/?api=1&query=${encodeURIComponent(place.name || '')}`;
  };

  const getPhotoUrl = (place) => {
    if (place.photo_url) {
      return place.photo_url;
    }
    
    if (place.photos && place.photos.length > 0) {
      const photoRef = place.photos[0].photo_reference;
      if (photoRef.startsWith('mock_photo_')) {
        const photoNumber = photoRef.split('_')[-1];
        return `${config.PLACEHOLDER_URL}/400x300/4A90E2/ffffff?text=Place+Photo+${photoNumber}`;
      }
      const apiKey = process.env.REACT_APP_GOOGLE_PLACES_API_KEY;
      if (apiKey) {
        return `${config.GOOGLE_PLACES_URL}/maps/api/place/photo?maxwidth=400&photoreference=${photoRef}&key=${process.env.REACT_APP_GOOGLE_PLACES_API_KEY}`;
      } else {
        console.warn('Google Places API key not found in environment variables');
        return null;
      }
    }
    return null;
  };

  const formatRating = (rating) => {
    if (!rating) return 'No rating';
    return `${rating}/5 ⭐`;
  };

  const formatPriceLevel = (priceLevel) => {
    if (!priceLevel) return 'Price not available';
    return '$'.repeat(priceLevel);
  };

  const isOpenNow = (openingHours) => {
    if (!openingHours) return null;
    return openingHours.open_now ? 'Open now' : 'Closed';
  };

  const renderPlaceCard = (place) => {
    const photoUrl = getPhotoUrl(place);
    const mapsUrl = getPlaceGoogleMapsUrl(place);
    const openStatus = isOpenNow(place.opening_hours);
    
    const placeType = place.types && place.types.includes('restaurant') ? 'restaurant' : 
                     place.types && place.types.includes('hospital') ? 'hospital' : 'lodging';

    return (
      <div key={place.place_id} className="place-card">
        <div className="place-image">
          {photoUrl ? (
            <img 
              src={photoUrl} 
              alt={place.name} 
              loading="lazy"
              onError={(e) => {
                console.log('Image failed to load:', photoUrl);
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
              onLoad={(e) => {
                console.log('Image loaded successfully:', photoUrl);
              }}
            />
          ) : null}
          <div className="place-image-placeholder" style={{ display: photoUrl ? 'none' : 'block' }}>
            {placeType === 'restaurant' ? <MdRestaurant /> : placeType === 'hospital' ? <MdLocalHospital /> : <MdHotel />}
          </div>
        </div>
        
        <div className="place-content">
          <h3 className="place-name">{place.name}</h3>
          
          <div className="place-details">
            {place.rating && (
              <div className="place-rating">
                {formatRating(place.rating)}
                {place.user_ratings_total && (
                  <span className="rating-count">({place.user_ratings_total} reviews)</span>
                )}
              </div>
            )}
            
            {place.price_level && (
              <div className="place-price">{formatPriceLevel(place.price_level)}</div>
            )}
            
            {openStatus && (
              <div className={`place-status ${openStatus === 'Open now' ? 'open' : 'closed'}`}>
                {openStatus}
              </div>
            )}
          </div>
          
          {(place.formatted_address || place.address) && (
            <div className="place-address">{place.formatted_address || place.address}</div>
          )}
          
          <div className="place-actions">
            {place.formatted_phone_number && (
              <a 
                href={`tel:${place.formatted_phone_number}`}
                className="place-phone"
                title="Call"
              >
                <MdPhone /> {place.formatted_phone_number}
              </a>
            )}
            
            {place.website && (
              <a 
                href={place.website}
                target="_blank"
                rel="noopener noreferrer"
                className="place-website"
                title="Visit website"
              >
                <MdLanguage /> Website
              </a>
            )}
            
            <a 
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="place-maps"
              title="Open in Google Maps"
            >
              <MdDirections /> Directions
            </a>
          </div>
        </div>
      </div>
    );
  };

  if (!latitude || !longitude) {
    return (
      <div className="nearby-places">
        <div className="nearby-places-header">
          <h2>Nearby Places</h2>
          <p>Search for a location to see nearby places</p>
        </div>
      </div>
    );
  }

  return (
    <div className="nearby-places">
      <div className="nearby-places-header">
        <h2>Nearby Places</h2>
        <p>Discover places around your selected location</p>
        
        <a 
          href={getGoogleMapsUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="open-maps-button"
          title="Open all places in Google Maps"
        >
          <MdMap /> Open in Google Maps
        </a>
      </div>

      <div className="map-section">
        <div className="map-container">
          <iframe
            src={`${config.GOOGLE_MAPS_URL}/maps?q=${latitude},${longitude}&z=14&output=embed`}
            width="100%"
            height="300"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Location Map"
          ></iframe>
        </div>
        
        <div className="map-legend">
          <div className="legend-item">
            <span className="legend-icon"><MdRestaurant /></span>
            <span>Restaurants</span>
          </div>
          <div className="legend-item">
            <span className="legend-icon"><MdLocalHospital /></span>
            <span>Hospitals</span>
          </div>
          <div className="legend-item">
            <span className="legend-icon"><MdHotel /></span>
            <span>Hotels & Motels</span>
          </div>
        </div>
      </div>

      <div className="places-tabs">
        {placeTypes.map((type) => (
          <button
            key={type.key}
            className={`tab-button ${activeTab === type.key ? 'active' : ''}`}
            onClick={() => setActiveTab(type.key)}
          >
            <span className="tab-icon">{type.icon}</span>
            <span className="tab-label">{type.label}</span>
          </button>
        ))}
      </div>

      <div className="places-content">
        {loading ? (
          <div className="places-loading">
            <div className="loading-spinner"></div>
            <p>Finding most-reviewed {activeTab}s near you...</p>
            <small>This may take a few seconds</small>
          </div>
        ) : error ? (
          <div className="places-error">
            <p> {error}</p>
            <button onClick={() => fetchNearbyPlaces(activeTab)} className="retry-button">
              Try Again
            </button>
          </div>
        ) : places.length === 0 ? (
          <div className="no-places">
            <p>No {activeTab}s found nearby</p>
          </div>
        ) : (
          <>
            <div className="places-content-header">
              <p>Showing top {places.length} {activeTab}s by number of reviews (sorted by prominence)</p>
            </div>
            <div className="places-grid">
              {places.map(renderPlaceCard)}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NearbyPlaces;
