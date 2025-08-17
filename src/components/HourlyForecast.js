import React, { useState, useEffect } from 'react';
import { WiDaySunny, WiDayCloudy, WiCloudy, WiRain, WiDayRain, WiThunderstorm, WiSnow, WiFog, WiDayCloudyGusts } from 'react-icons/wi';
import './HourlyForecast.css';

const HourlyForecast = ({ location, recordId }) => {
  const [hourlyData, setHourlyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentTime, setCurrentTime] = useState(new Date());

  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); 

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!location) return;

    const fetchHourlyForecast = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('Fetching hourly forecast for location:', location, 'date:', selectedDate);
        
        let response;
        
        if (recordId) {
          response = await fetch(`https://jte9rqvux8.execute-api.ap-south-1.amazonaws.com/api/hourly/${recordId}?date=${selectedDate}`);
        } else {
          const geocodeResponse = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${process.env.REACT_APP_WEATHER_API_KEY}`);
          
          if (!geocodeResponse.ok) {
            throw new Error('Failed to get location coordinates');
          }
          
          const geocodeData = await geocodeResponse.json();
          if (!geocodeData || geocodeData.length === 0) {
            throw new Error('Location not found');
          }
          
          const { lat, lon } = geocodeData[0];
          
          response = await fetch(`https://jte9rqvux8.execute-api.ap-south-1.amazonaws.com/api/hourly/direct?lat=${lat}&lon=${lon}`);
        }

        console.log('Hourly forecast response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Hourly forecast API error:', errorText);
          throw new Error(`Failed to fetch hourly forecast: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('Hourly forecast data:', data);
        
        if (data.hourly_forecast) {
          setHourlyData(data);
        } else {
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
    const iconMap = {
      '01': <WiDaySunny />, 
      '02': <WiDayCloudy />, 
      '03': <WiCloudy />, 
      '04': <WiCloudy />, 
      '09': <WiRain />, 
      '10': <WiDayRain />, 
      '11': <WiThunderstorm />, 
      '13': <WiSnow />, 
      '50': <WiFog />, 
    };
    
    const code = weatherCode.toString().substring(0, 2);
    return iconMap[code] || <WiDayCloudyGusts />;
  };

  const getUpcomingHours = (hourlyList) => {
    if (!hourlyList || hourlyList.length === 0) return [];

    const now = currentTime;
    const selectedDateObj = new Date(selectedDate);
    const isToday = selectedDateObj.toDateString() === now.toDateString();

    return hourlyList
      .map(hour => {
        let hourTime;
        if (hour.time) {
          // Handle time format like "14:00" or "2:00 PM"
          const timeStr = hour.time;
          if (timeStr.includes(':')) {
            const [hours, minutes] = timeStr.split(':').map(Number);
            hourTime = new Date(selectedDate);
            hourTime.setHours(hours, minutes, 0, 0);
          } else {
            // Fallback for other time formats
            hourTime = new Date(selectedDate);
          }
        } else if (hour.dt_txt) {
          hourTime = new Date(hour.dt_txt);
        } else {
          hourTime = new Date(selectedDate);
        }
        
        return {
          ...hour,
          parsedTime: hourTime,
          isPast: isToday && hourTime < now,
          isCurrent: isToday && Math.abs(hourTime - now) < 30 * 60 * 1000 // Within 30 minutes
        };
      })
      .filter(hour => !hour.isPast) 
      .slice(0, 24); // Show max 24 upcoming hours
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
  const upcomingHours = getUpcomingHours(hourlyList);

  return (
    <div className="hourly-forecast-container">
      <div className="hourly-header">
        <h3>Next Hours Forecast</h3>
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
        <p><strong>Current Time:</strong> {currentTime.toLocaleTimeString()}</p>
        {hourlyData.hourly_forecast.note && (
          <p className="hourly-note">📝 {hourlyData.hourly_forecast.note}</p>
        )}
      </div>

      {upcomingHours.length === 0 ? (
        <div className="hourly-no-data">
          {selectedDate === new Date().toISOString().split('T')[0] 
            ? "No more hourly forecasts available for today" 
            : "No hourly data available for this date"}
        </div>
      ) : (
        <div className="hourly-grid">
          {upcomingHours.map((hour, index) => (
            <div key={index} className={`hourly-item ${hour.isCurrent ? 'current-hour' : ''}`}>
              <div className="hour-time">
                {hour.time || formatTime(hour.dt_txt)}
                {hour.isCurrent && <span className="current-indicator">●</span>}
              </div>
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
