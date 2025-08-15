import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import WeatherDisplay from './WeatherDisplay';
import ForecastDisplay from './ForecastDisplay';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import YouTubeVideos from './YouTubeVideos';

import NearbyPlaces from './NearbyPlaces';
import './WeatherPage.css';

const API_KEY = process.env.REACT_APP_WEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

function WeatherPage() {
  const getWeatherIcon = (weatherId) => {
    if (weatherId >= 200 && weatherId < 300) return '⛈️';
    if (weatherId >= 300 && weatherId < 400) return '🌧️';
    if (weatherId >= 500 && weatherId < 600) return '🌧️';
    if (weatherId >= 600 && weatherId < 700) return '❄️';
    if (weatherId >= 700 && weatherId < 800) return '🌫️';
    if (weatherId === 800) return '☀️';
    if (weatherId >= 801 && weatherId < 900) return '☁️';
    return '🌤️';
  };
  const { location } = useParams();
  const navigate = useNavigate();
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [hourlyData, setHourlyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unit, setUnit] = useState('metric');
  const [activeSection, setActiveSection] = useState('today'); // today, forecast, videos, places

  // 5-day forecast using OpenWeatherMap API
  const fetchForecastData = useCallback(async (lat, lon) => {
    if (!API_KEY) {
      console.error('OpenWeatherMap API key not configured for forecast');
      setError('OpenWeatherMap API key not configured. Please check your environment variables.');
      return;
    }
    
    try {
      const forecastUrl = `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${unit}`;
      console.log('🌤️ Forecast API URL:', forecastUrl);
      
      const response = await fetch(forecastUrl);
      
      console.log('🌤️ Forecast API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('🌤️ Forecast API error:', errorText);
        throw new Error(`Could not get forecast data: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('🌤️ Forecast API data received:', data);
      console.log('🌤️ Number of forecast entries:', data.list ? data.list.length : 0);
      
      if (data.list && data.list.length > 0) {
        console.log('🌤️ First forecast entry:', data.list[0]);
        console.log('🌤️ Last forecast entry:', data.list[data.list.length - 1]);
        setForecastData(data);
      } else {
        console.error('🌤️ No forecast data in response');
        setForecastData(null);
      }
    } catch (err) {
      console.error('🌤️ Forecast error:', err);
      setForecastData(null);
    }
  }, [unit]);

  // Hourly forecast using OpenWeatherMap One Call API 2.5
  const fetchHourlyData = useCallback(async (lat, lon) => {
    if (!API_KEY) {
      console.error('OpenWeatherMap API key not configured for hourly forecast');
      return;
    }
    
    try {
      // Try backend API first
      const hourlyUrl = `http://localhost:5000/api/hourly/direct?lat=${lat}&lon=${lon}`;
      console.log('⏰ Hourly API URL:', hourlyUrl);
      
      let response = await fetch(hourlyUrl);
      
      console.log('⏰ Hourly API response status:', response.status);
      
      let data;
      
      if (!response.ok) {
        console.log('⏰ Backend API failed, trying OpenWeatherMap API directly...');
        // Fallback to OpenWeatherMap API directly
        const openWeatherUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${unit}&exclude=current,minutely,daily,alerts`;
        console.log('⏰ OpenWeatherMap API URL:', openWeatherUrl);
        
        response = await fetch(openWeatherUrl);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('⏰ OpenWeatherMap API error:', errorText);
          throw new Error(`Could not get hourly data: ${response.status} - ${errorText}`);
        }
        
        const openWeatherData = await response.json();
        console.log('⏰ OpenWeatherMap API data received:', openWeatherData);
        
        // Convert OpenWeatherMap format to our format
        const hourlyList = openWeatherData.hourly.map(hour => ({
          dt: hour.dt,
          temp: hour.temp,
          feels_like: hour.feels_like,
          pressure: hour.pressure,
          humidity: hour.humidity,
          dew_point: hour.dew_point,
          uvi: hour.uvi,
          clouds: hour.clouds,
          visibility: hour.visibility,
          wind_speed: hour.wind_speed,
          wind_deg: hour.wind_deg,
          wind_gust: hour.wind_gust,
          weather: hour.weather,
          pop: hour.pop,
          dt_txt: new Date(hour.dt * 1000).toISOString()
        }));
        
        data = {
          hourly_forecast: {
            hourly: hourlyList,
            timezone: openWeatherData.timezone,
            timezone_offset: openWeatherData.timezone_offset,
            note: 'Using OpenWeatherMap One Call API 2.5 directly'
          }
        };
      } else {
        data = await response.json();
      }
      
      console.log('⏰ Final hourly data:', data);
      console.log('⏰ Number of hourly entries:', data.hourly_forecast?.hourly?.length || 0);
      
      if (data.hourly_forecast && data.hourly_forecast.hourly && data.hourly_forecast.hourly.length > 0) {
        console.log('⏰ First hourly entry:', data.hourly_forecast.hourly[0]);
        console.log('⏰ Last hourly entry:', data.hourly_forecast.hourly[data.hourly_forecast.hourly.length - 1]);
        setHourlyData(data.hourly_forecast);
      } else {
        console.error('⏰ No hourly data in response');
        setHourlyData(null);
      }
    } catch (err) {
      console.error('⏰ Hourly error:', err);
      setHourlyData(null);
    }
  }, [unit]);

  // data from API
  const fetchWeatherData = useCallback(async (query) => {
    console.log('fetchWeatherData called with query:', query);
    
    if (!API_KEY) {
      console.error('API key not configured');
      setError('API key not configured. Please check your environment variables.');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    console.log('Loading state set to true');
    
    try {
      let response;
      let searchQuery;
      let latNum, lonNum; // Declare variables at function scope
      
      // Handle both coordinate objects and string queries
      if (typeof query === 'object' && query.latitude && query.longitude) {
        // Coordinate object from Google Places
        latNum = query.latitude;
        lonNum = query.longitude;
        searchQuery = `${latNum},${lonNum}`;
        console.log('Processing coordinate object:', { latNum, lonNum });
      } else {
        // String query
        searchQuery = query.trim();
        console.log('Processing string query:', searchQuery);
        
        if (searchQuery.includes(',')) {
          const [lat, lon] = searchQuery.split(',').map(coord => coord.trim());
          console.log('Parsed coordinates:', { lat, lon });
          
          // Validity check
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
      
      // Use OpenWeatherMap API for all queries (more reliable)
      if (latNum && lonNum) {
        console.log('Making OpenWeatherMap API call with coordinates:', { latNum, lonNum });
        response = await fetch(
          `${BASE_URL}/weather?lat=${latNum}&lon=${lonNum}&appid=${API_KEY}&units=${unit}`
        );
      } else {
        console.log('Making OpenWeatherMap API call with city name:', searchQuery);
        response = await fetch(
          `${BASE_URL}/weather?q=${encodeURIComponent(searchQuery)}&appid=${API_KEY}&units=${unit}`
        );
      }
       
       console.log('Weather API response status:', response.status);
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
             console.log('🌤️ Raw API response:', data);
             
             // Handle OpenWeatherMap response
             console.log('Weather data received:', data.name, data.sys?.country);
             setWeatherData(data);
             
             // Get coordinates for forecast
             const forecastLat = data.coord.lat;
             const forecastLon = data.coord.lon;
             
             // forecast too
             console.log('Fetching forecast data...');
             await fetchForecastData(forecastLat, forecastLon);
             
             // Fetch hourly data too
             console.log('Fetching hourly data...');
             await fetchHourlyData(forecastLat, forecastLon);
    } catch (err) {
      console.error('Error in fetchWeatherData:', err);
      setError(err.message);
      setWeatherData(null);
      setForecastData(null);
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  }, [unit, fetchForecastData]);

  useEffect(() => {
    if (location) {
      const decodedLocation = decodeURIComponent(location);
      console.log('📍 WeatherPage received location:', decodedLocation);
      
      // Check if it's a coordinate string (contains comma)
      if (decodedLocation.includes(',')) {
        const [lat, lon] = decodedLocation.split(',').map(coord => coord.trim());
        const latNum = parseFloat(lat);
        const lonNum = parseFloat(lon);
        
        if (!isNaN(latNum) && !isNaN(lonNum)) {
          console.log('📍 Parsed coordinates from URL:', { latNum, lonNum });
          // Pass as coordinate object
          fetchWeatherData({
            latitude: latNum,
            longitude: lonNum,
            formatted_address: decodedLocation
          });
        } else {
          // Fallback to string
          fetchWeatherData(decodedLocation);
        }
      } else {
        // String query (city name)
        fetchWeatherData(decodedLocation);
      }
    }
  }, [location, fetchWeatherData, fetchHourlyData]);

  const handleBackClick = () => {
    navigate('/');
  };



  const handleUnitToggle = () => {
    setUnit(prevUnit => prevUnit === 'metric' ? 'imperial' : 'metric');
  };

  const testHourlyData = async () => {
    if (weatherData && weatherData.coord) {
      console.log('🧪 Testing hourly data fetch...');
      await fetchHourlyData(weatherData.coord.lat, weatherData.coord.lon);
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'today':
        return (
          <div className="section-content">
            <div className="current-weather-section">
              <WeatherDisplay data={weatherData} unit={unit} onUnitToggle={handleUnitToggle} />
            </div>
            {(hourlyData || forecastData) && (
              <div className="hourly-forecast-section">
                <h3>Today's Hourly Forecast</h3>
                <p className="hourly-note">
                  {hourlyData ? 'Showing hourly forecasts for the complete day (until midnight) using OpenWeather API 2.5' : 'Showing 3-hour intervals for the remaining hours of today'}
                </p>
                {console.log('🔍 Debug - hourlyData:', hourlyData)}
                {console.log('🔍 Debug - forecastData:', forecastData)}
                <div className="hourly-forecast-grid">
                  {(() => {
                    let todayItems = [];
                    
                    if (hourlyData && hourlyData.hourly) {
                      // Use true hourly data
                      todayItems = hourlyData.hourly
                        .filter(item => {
                          const itemDate = new Date(item.dt * 1000);
                          const today = new Date();
                          const tomorrow = new Date(today);
                          tomorrow.setDate(tomorrow.getDate() + 1);
                          tomorrow.setHours(0, 0, 0, 0); // Start of next day
                          return itemDate >= today && itemDate < tomorrow;
                        });
                    } else if (forecastData && forecastData.list) {
                      // Fallback to 3-hour forecast data
                      todayItems = forecastData.list
                        .filter(item => {
                          const itemDate = new Date(item.dt * 1000);
                          const today = new Date();
                          return itemDate.toDateString() === today.toDateString();
                        });
                    }
                    
                    console.log('Today\'s hourly items:', todayItems?.length || 0);
                    console.log('Today\'s items:', todayItems?.map(item => new Date(item.dt * 1000).toLocaleTimeString()));
                    
                    if (!todayItems || todayItems.length === 0) {
                      return (
                        <div key="no-data" className="hourly-no-data">
                          <p>No hourly forecast data available for today.</p>
                        </div>
                      );
                    }
                    
                    return todayItems.map((item, index) => {
                      const time = new Date(item.dt * 1000);
                      const temp = unit === 'metric' ? 
                        (item.temp || item.main?.temp) : 
                        ((item.temp || item.main?.temp) * 9/5) + 32;
                      const tempUnit = unit === 'metric' ? '°C' : '°F';
                      const weatherIcon = getWeatherIcon(item.weather[0]?.id);
                      
                      return (
                        <div key={index} className="hourly-forecast-item">
                          <div className="hourly-time">
                            {time.toLocaleTimeString('en-US', { 
                              hour: 'numeric', 
                              hour12: true 
                            })}
                          </div>
                          <div className="hourly-icon">
                            {weatherIcon}
                          </div>
                          <div className="hourly-temp">
                            {Math.round(temp)}{tempUnit}
                          </div>
                          <div className="hourly-description">
                            {item.weather[0]?.description || 'Clear'}
                          </div>
                          <div className="hourly-details">
                            <div className="detail-item">
                              <span className="detail-label">Humidity:</span>
                              <span className="detail-value">{item.humidity || item.main?.humidity}%</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Wind:</span>
                              <span className="detail-value">{Math.round(item.wind_speed || item.wind?.speed)} m/s</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Feels Like:</span>
                              <span className="detail-value">
                                {Math.round(unit === 'metric' ? 
                                  (item.feels_like || item.main?.feels_like) : 
                                  ((item.feels_like || item.main?.feels_like) * 9/5) + 32)}{tempUnit}
                              </span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">UV Index:</span>
                              <span className="detail-value">{item.uvi || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}
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
        {/* Header */}
        <header className="weather-page-header">
          <div className="header-left">
            <button className="back-button" onClick={handleBackClick}>
              ← Back to Search
            </button>
          </div>
          <div className="header-center">
            <h1>Weather Forecast</h1>
            {weatherData && weatherData.name && weatherData.sys && weatherData.sys.country && (
              <p className="location-display">📍 {weatherData.name}, {weatherData.sys.country}</p>
            )}
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
            {/* Navigation Bar */}
            <nav className="weather-navbar">
              <button 
                className={`nav-button ${activeSection === 'today' ? 'active' : ''}`}
                onClick={() => setActiveSection('today')}
              >
                🌤️ Today's Weather
              </button>

              <button 
                className={`nav-button ${activeSection === 'forecast' ? 'active' : ''}`}
                onClick={() => setActiveSection('forecast')}
              >
                📅 5-Day Forecast
              </button>
              <button 
                className={`nav-button ${activeSection === 'videos' ? 'active' : ''}`}
                onClick={() => setActiveSection('videos')}
              >
                🎥 Location Videos
              </button>
              <button 
                className={`nav-button ${activeSection === 'places' ? 'active' : ''}`}
                onClick={() => setActiveSection('places')}
              >
                📍 Nearby Places
              </button>
            </nav>

            {/* Section Content */}
            {renderSection()}
          </div>
        )}
      </div>
    </div>
  );
}

export default WeatherPage;
