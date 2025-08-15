import React, { useState, useEffect } from 'react';
import './NearbyPlaces.css';

const NearbyPlaces = ({ latitude, longitude }) => {
  const [activeTab, setActiveTab] = useState('restaurant');
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [allPlaces, setAllPlaces] = useState({ restaurant: [], hospital: [], lodging: [] });

  const placeTypes = [
    { key: 'restaurant', label: 'Restaurants', icon: '🍽️' },
    { key: 'hospital', label: 'Hospitals', icon: '🏥' },
    { key: 'lodging', label: 'Hotels & Motels', icon: '🏨' }
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
      const apiUrl = `http://localhost:5000/api/nearby/${placeType}?lat=${latitude}&lon=${longitude}`;
      console.log(`🌐 API URL: ${apiUrl}`);
      
      // Add timeout to prevent long loading
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await fetch(apiUrl, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      console.log(`📡 Response status: ${response.status}`);
      
      const data = await response.json();
      console.log(`📦 Response data:`, data);
      
      if (response.ok) {
        const placesList = data.places || [];
        console.log(`✅ Found ${placesList.length} ${placeType}s`);
        setPlaces(placesList);
        
        // Store places for map display
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
    // Create a Google Maps URL with all places marked
    const baseUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    
    // Add all places as markers
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
      return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name || '')}`;
  };

  const getPhotoUrl = (photos) => {
    if (photos && photos.length > 0) {
      const photoRef = photos[0].photo_reference;
      // Use backend proxy to avoid CORS issues
      return `http://localhost:5000/api/places/photo?photo_reference=${photoRef}&max_width=400`;
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
    const photoUrl = getPhotoUrl(place.photos);
    const mapsUrl = getPlaceGoogleMapsUrl(place);
    const openStatus = isOpenNow(place.opening_hours);
    
    // Determine place type from place types array
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
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
          ) : null}
          <div className="place-image-placeholder" style={{ display: photoUrl ? 'none' : 'block' }}>
            {placeType === 'restaurant' ? '🍽️' : placeType === 'hospital' ? '🏥' : '🏨'}
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
          
          {place.formatted_address && (
            <div className="place-address">{place.formatted_address}</div>
          )}
          
          <div className="place-actions">
            {place.formatted_phone_number && (
              <a 
                href={`tel:${place.formatted_phone_number}`}
                className="place-phone"
                title="Call"
              >
                📞 {place.formatted_phone_number}
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
                🌐 Website
              </a>
            )}
            
            <a 
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="place-maps"
              title="Open in Google Maps"
            >
              🗺️ Directions
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
          <h2>📍 Nearby Places</h2>
          <p>Search for a location to see nearby places</p>
        </div>
      </div>
    );
  }

  return (
    <div className="nearby-places">
      <div className="nearby-places-header">
        <h2>📍 Nearby Places</h2>
        <p>Discover places around your selected location</p>
        
        {/* Open in Google Maps Button */}
        <a 
          href={getGoogleMapsUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="open-maps-button"
          title="Open all places in Google Maps"
        >
          🗺️ Open in Google Maps
        </a>
      </div>

      {/* Map Section */}
      <div className="map-section">
        <div className="map-container">
          <iframe
                            src={`https://www.google.com/maps/embed/v1/view?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&center=${latitude},${longitude}&zoom=14&maptype=roadmap`}
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
            <span className="legend-icon">🍽️</span>
            <span>Restaurants</span>
          </div>
          <div className="legend-item">
            <span className="legend-icon">🏥</span>
            <span>Hospitals</span>
          </div>
          <div className="legend-item">
            <span className="legend-icon">🏨</span>
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
            <p>❌ {error}</p>
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
              <p>Showing top {places.length} {activeTab}s by number of reviews</p>
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
