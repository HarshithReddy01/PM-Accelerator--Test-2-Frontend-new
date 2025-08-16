import React from 'react';
import { WiHumidity, WiStrongWind, WiBarometer, WiUmbrella, WiSunrise, WiSunset } from 'react-icons/wi';
import './WeatherDisplay.css';

function WeatherDisplay({ data, unit, onUnitToggle }) {
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

  const formatTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getTemperatureUnit = () => unit === 'metric' ? '°C' : '°F';

  return (
    <div className="weather-display">
      <div className="weather-header">
        <div className="location-info">
          <h2>{data.name}, {data.sys.country}</h2>
          <p className="current-time">Current Weather Forecast</p>
        </div>
        <div className="header-actions">
          <button 
            className="unit-toggle"
            onClick={onUnitToggle}
            aria-label={`Switch to ${unit === 'metric' ? 'Fahrenheit' : 'Celsius'}`}
          >
            {unit === 'metric' ? '°F' : '°C'}
          </button>
        </div>
      </div>

      
      <div className="weather-main-section">
        <div className="weather-icon-section">
          <div className="weather-icon">{getWeatherIcon(data.weather[0].id)}</div>
          <p className="weather-summary">Right now in {data.name}</p>
          <p className="weather-description">{data.weather[0].description}</p>
        </div>
        
        <div className="temperature-section">
          <div className="current-temperature">
            {Math.round(data.main.temp)}{getTemperatureUnit()}
          </div>
          <div className="temperature-details">
            <span className="feels-like">Feels like {Math.round(data.main.feels_like)}{getTemperatureUnit()}</span>
            <div className="temp-range">
              <span className="temp-min">Min: {Math.round(data.main.temp_min)}{getTemperatureUnit()}</span>
              <span className="temp-max">Max: {Math.round(data.main.temp_max)}{getTemperatureUnit()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="weather-details-grid">
        <div className="detail-card">
          <div className="detail-icon">
            <WiHumidity />
          </div>
          <div className="detail-content">
            <h4>Humidity</h4>
            <p>{data.main.humidity}%</p>
          </div>
        </div>

        <div className="detail-card">
          <div className="detail-icon">
            <WiStrongWind />
          </div>
          <div className="detail-content">
            <h4>Wind Speed</h4>
            <p>{data.wind.speed} {unit === 'metric' ? 'm/s' : 'mph'}</p>
          </div>
        </div>

        <div className="detail-card">
          <div className="detail-icon">
            <WiBarometer />
          </div>
          <div className="detail-content">
            <h4>Pressure</h4>
            <p>{data.main.pressure} hPa</p>
          </div>
        </div>

        <div className="detail-card">
          <div className="detail-icon">
            <WiUmbrella />
          </div>
          <div className="detail-content">
            <h4>Visibility</h4>
            <p>{(data.visibility / 1000).toFixed(1)} km</p>
          </div>
        </div>
      </div>

          
      <div className="sun-info-section">
        <div className="sun-card">
          <div className="sun-icon sunrise">
            <WiSunrise />
          </div>
          <div className="sun-content">
            <h4>Sunrise</h4>
            <p>{formatTime(data.sys.sunrise)}</p>
          </div>
        </div>

        <div className="sun-card">
          <div className="sun-icon sunset">
            <WiSunset />
          </div>
          <div className="sun-content">
            <h4>Sunset</h4>
            <p>{formatTime(data.sys.sunset)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WeatherDisplay;
