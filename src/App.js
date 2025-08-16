import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import SearchBar from './components/SearchBar';
import WeatherPage from './components/WeatherPage';
import WeatherHistory from './components/WeatherHistory';
import SaveWeather from './components/SaveWeather';

function HomePage() {
  const navigate = useNavigate();

  const handleSearch = (searchQuery) => {
    if (typeof searchQuery === 'object' && searchQuery.latitude && searchQuery.longitude) {
      console.log('📍 Navigating with coordinates:', searchQuery.latitude, searchQuery.longitude);
      navigate(`/weather/${searchQuery.latitude},${searchQuery.longitude}`);
    } else if (typeof searchQuery === 'string' && searchQuery.trim()) {
      console.log('📍 Navigating with string query:', searchQuery);
      navigate(`/weather/${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLocationClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          navigate(`/weather/${latitude},${longitude}`);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    } else {
      console.error('Geolocation not supported.');
    }
  };

  return (
    <div className="App">
      <video 
        className="video-background" 
        autoPlay 
        muted 
        loop 
        playsInline
        preload="auto"
      >
        <source src={`${process.env.PUBLIC_URL}/Assests/naturevideo.mp4`} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      <div className="pm-accelerator-section">
        <div className="pm-accelerator-left">
          <button
            onClick={handleLocationClick}
            className="mobile-location-btn"
            aria-label="Get weather for my current location"
          >
            📍
          </button>
        </div>
        <div className="pm-accelerator-right">
          <a 
            href="https://www.pmaccelerator.io/" 
            rel="noopener noreferrer"
            className="pm-accelerator-link"
          >
            About Us
          </a>
        </div>
      </div>
      
      <div className="container">
        <header className="app-header">
          <div className="header-content">
            <div className="header-main">
              <h1>Weather Forecast</h1>
              <p>Get real-time weather information for any location.</p>
            </div>
          </div>
        </header>

        <div className="search-section">
          <SearchBar onSearch={handleSearch} onLocationClick={handleLocationClick} />
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router basename="/PM-Accelerator--Test-1">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/weather/:location" element={<WeatherPage />} />
        <Route path="/history" element={<WeatherHistory />} />
        <Route path="/save" element={<SaveWeather />} />
      </Routes>
    </Router>
  );
}

export default App;
