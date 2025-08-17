import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { WiThunderstorm, WiRain, WiSnow, WiFog, WiDaySunny, WiCloudy, WiDayCloudy } from 'react-icons/wi';
import { MdLocationOn, MdSave, MdHistory } from 'react-icons/md';
import WeatherDisplay from './WeatherDisplay';
import ForecastDisplay from './ForecastDisplay';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import YouTubeVideos from './YouTubeVideos';
import SaveWeather from './SaveWeather';
import NearbyPlaces from './NearbyPlaces';
import config from '../config.js';
import './WeatherPage.css';

const API_KEY = process.env.REACT_APP_WEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

function WeatherPage() {
  const getWeatherIcon = (weatherId) => {
    if (weatherId >= 200 && weatherId < 300) return <WiThunderstorm />;
    if (weatherId >= 300 && weatherId < 400) return <WiRain />;
    if (weatherId >= 500 && weatherId < 600) return <WiRain />;
    if (weatherId >= 600 && weatherId < 700) return <WiSnow />;
    if (weatherId >= 700 && weatherId < 800) return <WiFog />;
    if (weatherId === 800) return <WiDaySunny />;
    if (weatherId >= 801 && weatherId < 900) return <WiCloudy />;
    return <WiDayCloudy />;
  };
  const { location } = useParams();
  const navigate = useNavigate();
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unit, setUnit] = useState('metric');
  const [activeSection, setActiveSection] = useState('today'); 
  const [showSaveForm, setShowSaveForm] = useState(false);



  const fetchForecastData = useCallback(async (lat, lon) => {
    if (!API_KEY) {
      console.error('OpenWeatherMap API key not configured for forecast');
      setError('OpenWeatherMap API key not configured. Please check your environment variables.');
      return;
    }
    
    try {
      const forecastUrl = `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${unit}`;
      
      const response = await fetch(forecastUrl);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Forecast API error:', errorText);
        throw new Error(`Could not get forecast data: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      
      if (data.list && data.list.length > 0) {
        setForecastData(data);
      } else {
        console.error('No forecast data in response');
        setForecastData(null);
      }
    } catch (err) {
      console.error('Forecast error:', err);
      setForecastData(null);
    }
  }, [unit]);





  const fetchWeatherData = useCallback(async (query) => {
    if (!API_KEY) {
      console.error('API key not configured');
      setError('API key not configured. Please check your environment variables.');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      let response;
      let searchQuery;
      let latNum, lonNum; 
      
      if (typeof query === 'object' && query.latitude && query.longitude) {
        latNum = query.latitude;
        lonNum = query.longitude;
        searchQuery = `${latNum},${lonNum}`;
        console.log('Processing coordinate object:', { latNum, lonNum });
      } else {
        searchQuery = query.trim();
        console.log('Processing string query:', searchQuery);
        
        if (searchQuery.includes(',')) {
          const [lat, lon] = searchQuery.split(',').map(coord => coord.trim());
          console.log('Parsed coordinates:', { lat, lon });
          
          latNum = parseFloat(lat);
          lonNum = parseFloat(lon);
          
          if (isNaN(latNum) || isNaN(lonNum)) {
            throw new Error('Coordinates look wrong. Try format: latitude,longitude (like 40.7128,-74.0060)');
          }
          
          if (latNum < -90 || latNum > 90) {
            throw new Error('Latitude should be between -90 and 90');
          }
          
          if (lonNum < -180 || lonNum > 180) {
            throw new Error('Longitude should be between -180 and 180');
          }
        }
      }
      
      if (latNum && lonNum) {
        response = await fetch(
          `${BASE_URL}/weather?lat=${latNum}&lon=${lonNum}&appid=${API_KEY}&units=${unit}`
        );
      } else {
        response = await fetch(
          `${BASE_URL}/weather?q=${encodeURIComponent(searchQuery)}&appid=${API_KEY}&units=${unit}`
        );
      }
             if (!response.ok) {
         console.error('API Error:', response.status, response.statusText);
         if (response.status === 404) {
           throw new Error(`Can't find "${searchQuery}". Check the spelling or try something else.`);
         } else if (response.status === 429) {
           throw new Error('Too many requests. Wait a bit and try again.');
         } else if (response.status === 401) {
           throw new Error('API key is invalid. Please check your configuration.');
         } else {
           throw new Error('Try again.');
         }
       }
       
             const data = await response.json();
             setWeatherData(data);
             const forecastLat = data.coord.lat;
             const forecastLon = data.coord.lon;
                           await fetchForecastData(forecastLat, forecastLon);
    } catch (err) {
      console.error('Error in fetchWeatherData:', err);
              setError(err.message);
        setWeatherData(null);
        setForecastData(null);
        
      } finally {
      setLoading(false);
    }
     }, [unit, fetchForecastData]);

  useEffect(() => {
    if (location) {
      const decodedLocation = decodeURIComponent(location);
      
      if (decodedLocation.includes(',')) {
        const [lat, lon] = decodedLocation.split(',').map(coord => coord.trim());
        const latNum = parseFloat(lat);
        const lonNum = parseFloat(lon);
        
        if (!isNaN(latNum) && !isNaN(lonNum)) {
          fetchWeatherData({
            latitude: latNum,
            longitude: lonNum,
            formatted_address: decodedLocation
          });
        } else {
          fetchWeatherData(decodedLocation);
        }
      } else {
        fetchWeatherData(decodedLocation);
      }
         }
   }, [location, fetchWeatherData]);

  const handleBackClick = () => {
    navigate('/');
  };



  const handleUnitToggle = () => {
    setUnit(prevUnit => prevUnit === 'metric' ? 'imperial' : 'metric');
  };



  const renderSection = () => {
    switch (activeSection) {
      case 'today':
                 return (
           <div className="section-content">
             <div className="current-weather-section">
               <WeatherDisplay data={weatherData} unit={unit} onUnitToggle={handleUnitToggle} />
             </div>
           </div>
         );

      case 'forecast':
        return (
          <div className="section-content">
            <div className="forecast-section">
              {forecastData && <ForecastDisplay data={forecastData} unit={unit} />}
            </div>
          </div>
        );
      case 'videos':
        return (
          <div className="section-content">
            <div className="youtube-section">
              <YouTubeVideos location={weatherData.name} />
            </div>
          </div>
        );
      case 'places':
        return (
          <div className="section-content">
            <div className="places-section">
              {weatherData && weatherData.coord && weatherData.coord.lat && weatherData.coord.lon ? (
                <NearbyPlaces 
                  latitude={weatherData.coord.lat} 
                  longitude={weatherData.coord.lon} 
                />
              ) : (
                <div className="error-message">Location coordinates not available for nearby places.</div>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="weather-page">
      <video 
        className="video-background" 
        autoPlay 
        muted 
        loop 
        playsInline
        preload="auto"
      >
        <source src={`${process.env.PUBLIC_URL}/Assests/nextpage.mp4`} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      <div className="weather-page-container">
        <header className="weather-page-header">
          <div className="header-left">
            <button className="back-button" onClick={handleBackClick}>
              ← Back to Search
            </button>
          </div>
          <div className="header-center">
            <h1>Weather Forecast</h1>
            {weatherData && weatherData.name && weatherData.sys && weatherData.sys.country && (
              <p className="location-display"><MdLocationOn /> {weatherData.name}, {weatherData.sys.country}</p>
            )}
          </div>
          <div className="header-right">
            <button className="save-button" onClick={() => setShowSaveForm(true)}>
              <MdSave /> Save Weather
            </button>
            <button className="history-button" onClick={() => navigate('/history')}>
              <MdHistory /> History
            </button>
          </div>

        </header>

        {loading && <LoadingSpinner />}
        
        {error && (
          <div className="error-section">
            <ErrorMessage message={error} />
          </div>
        )}

        {weatherData && !loading && (
          <div className="weather-content">
            {showSaveForm && (
              <div className="modal-overlay" onClick={() => setShowSaveForm(false)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <button className="modal-close" onClick={() => setShowSaveForm(false)}>✕</button>
                  <SaveWeather 
                    currentLocation={weatherData.name}
                    currentWeatherData={weatherData}
                    onSaveSuccess={(result) => {
                      setShowSaveForm(false);
                    }}
                  />
                </div>
              </div>
            )}

            <nav className="weather-navbar">
              <button 
                className={`nav-button ${activeSection === 'today' ? 'active' : ''}`}
                onClick={() => setActiveSection('today')}
              >
                Today's Weather
              </button>

              <button 
                className={`nav-button ${activeSection === 'forecast' ? 'active' : ''}`}
                onClick={() => setActiveSection('forecast')}
              >
                5-Day Forecast
              </button>
              <button 
                className={`nav-button ${activeSection === 'videos' ? 'active' : ''}`}
                onClick={() => setActiveSection('videos')}
              >
                Location Videos
              </button>
              <button 
                className={`nav-button ${activeSection === 'places' ? 'active' : ''}`}
                onClick={() => setActiveSection('places')}
              >
                Nearby Places
              </button>
            </nav>

            {renderSection()}
          </div>
        )}
      </div>
    </div>
  );
}

export default WeatherPage;
