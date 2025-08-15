import React, { useState, useEffect } from 'react';
import './HourlyForecast.css';

const HourlyForecast = ({ location, recordId }) => {
  const [hourlyData, setHourlyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (!location) return;

    const fetchHourlyForecast = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('Fetching hourly forecast for location:', location, 'date:', selectedDate);
        
        let response;
        
        if (recordId) {
          // Use existing record ID
          response = await fetch(`http://localhost:5000/api/hourly/${recordId}?date=${selectedDate}`);
        } else {
          // Use direct API for better performance
          // First get coordinates for the location
          const geocodeResponse = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${process.env.REACT_APP_WEATHER_API_KEY}`);
          
          if (!geocodeResponse.ok) {
            throw new Error('Failed to get location coordinates');
          }
          
          const geocodeData = await geocodeResponse.json();
          if (!geocodeData || geocodeData.length === 0) {
            throw new Error('Location not found');
          }
          
          const { lat, lon } = geocodeData[0];
          
          // Get hourly forecast using coordinates
          response = await fetch(`http://localhost:5000/api/hourly/direct?lat=${lat}&lon=${lon}`);
        }

        console.log('Hourly forecast response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Hourly forecast API error:', errorText);
          throw new Error(`Failed to fetch hourly forecast: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('Hourly forecast data:', data);
        
        // Handle both old and new API response formats
        if (data.hourly_forecast) {
          setHourlyData(data);
        } else {
          // New API format
          setHourlyData({
            location: location,
            date: selectedDate,
            hourly_forecast: data
          });
        }
      } catch (err) {
        console.error('Error fetching hourly forecast:', err);
        setError(`Unable to load hourly forecast: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchHourlyForecast();
  }, [location, selectedDate, recordId]);

  const formatTime = (timeString) => {
    const time = new Date(timeString);
    return time.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getWeatherIcon = (weatherCode) => {
    // Map weather codes to icons (simplified)
    const iconMap = {
      '01': '☀️', // clear sky
      '02': '⛅', // few clouds
      '03': '☁️', // scattered clouds
      '04': '☁️', // broken clouds
      '09': '🌧️', // shower rain
      '10': '🌦️', // rain
      '11': '⛈️', // thunderstorm
      '13': '🌨️', // snow
      '50': '🌫️', // mist
    };
    
    const code = weatherCode.toString().substring(0, 2);
    return iconMap[code] || '🌤️';
  };

  if (loading) {
    return (
      <div className="hourly-forecast-container">
        <h3>Hourly Forecast</h3>
        <div className="hourly-loading">Loading hourly forecast...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="hourly-forecast-container">
        <h3>Hourly Forecast</h3>
        <div className="hourly-error">{error}</div>
      </div>
    );
  }

  if (!hourlyData || !hourlyData.hourly_forecast) {
    return (
      <div className="hourly-forecast-container">
        <h3>Hourly Forecast</h3>
        <div className="hourly-no-data">No hourly forecast data available</div>
      </div>
    );
  }

  const hourlyList = hourlyData.hourly_forecast.hourly || hourlyData.hourly_forecast.list || [];

  return (
    <div className="hourly-forecast-container">
      <div className="hourly-header">
        <h3>Hourly Forecast</h3>
        <div className="date-selector">
          <label htmlFor="date-select">Date: </label>
          <input
            id="date-select"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
                         max={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
          />
        </div>
      </div>
      
      <div className="hourly-info">
        <p><strong>Location:</strong> {hourlyData.location}</p>
        <p><strong>Date:</strong> {new Date(hourlyData.date).toLocaleDateString()}</p>
        {hourlyData.hourly_forecast.note && (
          <p className="hourly-note">📝 {hourlyData.hourly_forecast.note}</p>
        )}
      </div>

      {hourlyList.length === 0 ? (
        <div className="hourly-no-data">No hourly data available for this date</div>
      ) : (
        <div className="hourly-grid">
          {hourlyList.map((hour, index) => (
            <div key={index} className="hourly-item">
              <div className="hour-time">{hour.time || formatTime(hour.dt_txt)}</div>
              <div className="hour-icon">
                {getWeatherIcon(hour.weather[0].id)}
              </div>
              <div className="hour-temp">
                {Math.round(hour.temp || hour.main.temp)}°C
              </div>
              <div className="hour-description">
                {hour.weather[0].description}
              </div>
                             <div className="hour-details">
                 <div className="detail-item">
                   <span className="detail-label">Humidity:</span>
                   <span className="detail-value">{hour.humidity || hour.main?.humidity}%</span>
                 </div>
                 <div className="detail-item">
                   <span className="detail-label">Wind:</span>
                   <span className="detail-value">{Math.round(hour.wind_speed || hour.wind?.speed)} m/s</span>
                 </div>
                 <div className="detail-item">
                   <span className="detail-label">Feels Like:</span>
                   <span className="detail-value">{Math.round(hour.feels_like || hour.main?.feels_like)}°C</span>
                 </div>
                 <div className="detail-item">
                   <span className="detail-label">UV Index:</span>
                   <span className="detail-value">{hour.uvi || 'N/A'}</span>
                 </div>
                 <div className="detail-item">
                   <span className="detail-label">Pressure:</span>
                   <span className="detail-value">{hour.pressure || 'N/A'} hPa</span>
                 </div>
                 <div className="detail-item">
                   <span className="detail-label">Visibility:</span>
                   <span className="detail-value">{hour.visibility ? `${Math.round(hour.visibility / 1000)} km` : 'N/A'}</span>
                 </div>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HourlyForecast;
