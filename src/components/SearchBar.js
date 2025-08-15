import React, { useState, useEffect, useRef } from 'react';
import './SearchBar.css';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef(null);

  // No need to initialize Google Places since we're using Nominatim for suggestions
  useEffect(() => {
    console.log('Using Nominatim (OpenStreetMap) for location suggestions');
  }, []);

  // Debounced search for suggestions
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      setIsLoadingSuggestions(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      fetchLocationSuggestions();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const fetchLocationSuggestions = () => {
    // Use Nominatim (OpenStreetMap) for suggestions
    console.log('Fetching suggestions with Nominatim for:', query);
    fetchNominatimSuggestions();
  };

  const fetchNominatimSuggestions = async () => {
    try {
      console.log('Fetching suggestions with Nominatim for:', query);
      setIsLoadingSuggestions(true);
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'WeatherApp/1.0 (https://github.com/yourusername/weatherapp)'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        console.log('Nominatim response:', data);
        
        if (data && data.length > 0) {
          // Convert Nominatim format to show detailed location info
          const convertedSuggestions = data.map(result => {
            const address = result.address || {};
            
            // Get city name (fallback order: city -> town -> village)
            const city = address.city || address.town || address.village || '';
            
            // Get state (fallback to state_district if state missing)
            const state = address.state || address.state_district || '';
            
            // Get country
            const country = address.country || '';
            
            // Get ZIP code (may be missing for some places)
            const zip = address.postcode || '';
            
            // Format: City, State, Country, Zip, (Latitude, Longitude)
            const description = `${city}, ${state}, ${country}, ${zip}, (${parseFloat(result.lat).toFixed(4)}, ${parseFloat(result.lon).toFixed(4)})`;
            
            return {
              place_id: `nominatim_${result.place_id}`,
              description: description,
              structured_formatting: {
                main_text: city || result.display_name.split(',')[0],
                secondary_text: `${state}, ${country}, ${zip}, (${parseFloat(result.lat).toFixed(4)}, ${parseFloat(result.lon).toFixed(4)})`
              },
              // Add coordinates for direct use
              latitude: parseFloat(result.lat),
              longitude: parseFloat(result.lon),
              // Add additional info for display
              name: city || result.display_name.split(',')[0],
              country_code: country,
              coordinates: `(${parseFloat(result.lat).toFixed(4)}, ${parseFloat(result.lon).toFixed(4)})`
            };
          });
          
          setSuggestions(convertedSuggestions);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } else {
        console.log('Nominatim API error:', response.status);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Nominatim fetch error:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    console.log('🔍 Selected suggestion:', suggestion);
    
    // Nominatim data has direct coordinates
    console.log('📍 Nominatim coordinates:', suggestion.latitude, suggestion.longitude);
    
    // Pass coordinates directly to onSearch
    const searchData = {
      latitude: suggestion.latitude,
      longitude: suggestion.longitude,
      formatted_address: suggestion.name
    };
    
    console.log('🚀 Passing to onSearch:', searchData);
    onSearch(searchData);
    
    // Set the query to show the clean location name
    setQuery(suggestion.name);
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      console.log('🔍 Submitting query:', query);
      onSearch(query);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    
    if (value.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e) => {
    if (suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else if (query.trim()) {
          onSearch(query);
        }
        break;
      case 'Escape':
        setSuggestions([]);
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
      default:
        break;
    }
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, 200);
  };

  const handleClickOutside = (e) => {
    if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const clearInput = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          onSearch({
            latitude,
            longitude,
            formatted_address: 'Current Location'
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your current location. Please search manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  return (
    <div className="search-container" ref={searchContainerRef}>
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-container">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder="Search for a city, landmark, or address..."
            className="search-input"
          />
          <button
            type="button"
            onClick={getCurrentLocation}
            className="location-button"
            title="Use my current location"
          >
            📍
          </button>
          <button type="submit" className="search-button">
            🔍
          </button>
        </div>
      </form>

      {/* Location Suggestions */}
      {showSuggestions && (
        <div className="location-suggestions">
          {isLoadingSuggestions ? (
            <div className="suggestion-loading">
              <div className="suggestion-loading-spinner"></div>
              <span>Searching...</span>
            </div>
          ) : suggestions.length > 0 ? (
            <ul className="suggestions-list">
              {suggestions.map((suggestion, index) => (
                <li
                  key={suggestion.place_id}
                  className={`suggestion-item ${index === selectedIndex ? 'selected' : ''}`}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div className="suggestion-main-text">{suggestion.structured_formatting?.main_text}</div>
                  <div className="suggestion-secondary-text">{suggestion.structured_formatting?.secondary_text}</div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="no-suggestions">No locations found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
