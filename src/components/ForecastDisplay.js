import React from 'react';
import './ForecastDisplay.css';

function ForecastDisplay({ data, unit }) {
  console.log('📅 ForecastDisplay received data:', data);
  console.log('📅 ForecastDisplay unit:', unit);
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

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Compare dates using date strings to avoid time issues
    const dateStr = date.toDateString();
    const tomorrowStr = tomorrow.toDateString();
    
    if (dateStr === tomorrowStr) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }
  };

  const formatFullDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Compare dates using date strings to avoid time issues
    const dateStr = date.toDateString();
    const tomorrowStr = tomorrow.toDateString();
    
    if (dateStr === tomorrowStr) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const getTemperatureUnit = () => unit === 'metric' ? '°C' : '°F';

  // data by day
  const groupByDay = (forecastList) => {
    const grouped = {};
    forecastList.forEach(item => {
      // Use local date for grouping to avoid timezone issues
      const date = new Date(item.dt * 1000).toLocaleDateString('en-CA');
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(item);
    });
    return grouped;
  };

  // averages
  const calculateDailyAverages = (dayData) => {
    const temps = dayData.map(item => item.main.temp);
    const humidities = dayData.map(item => item.main.humidity);
    const windSpeeds = dayData.map(item => item.wind.speed);
    const pressures = dayData.map(item => item.main.pressure);
    const feelsLike = dayData.map(item => item.main.feels_like);
    
    return {
      temp_min: Math.min(...temps),
      temp_max: Math.max(...temps),
      temp_avg: Math.round(temps.reduce((a, b) => a + b, 0) / temps.length),
      feels_like_avg: Math.round(feelsLike.reduce((a, b) => a + b, 0) / feelsLike.length),
      humidity: Math.round(humidities.reduce((a, b) => a + b, 0) / humidities.length),
      wind_speed: Math.round((windSpeeds.reduce((a, b) => a + b, 0) / windSpeeds.length) * 10) / 10,
      pressure: Math.round(pressures.reduce((a, b) => a + b, 0) / pressures.length),
      weather: dayData[Math.floor(dayData.length / 2)].weather[0],
      pop: Math.max(...dayData.map(item => item.pop || 0)) // Max probability of precipitation
    };
  };

  // Group 3-hour forecast data by day and calculate daily averages
  const groupedForecast = groupByDay(data.list);
  
  // Use local dates instead of UTC to avoid timezone issues
  const now = new Date();
  const today = now.toLocaleDateString('en-CA'); // YYYY-MM-DD format in local timezone
  
  // Debug: Log the available dates
  console.log('Available dates in forecast:', Object.keys(groupedForecast));
  console.log('Today (local):', today);
  console.log('Current time:', now.toLocaleString());
  
  // Get tomorrow's date for comparison
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toLocaleDateString('en-CA');
  
  console.log('Tomorrow (local):', tomorrowStr);
  console.log('All available dates:', Object.keys(groupedForecast).sort());
  
  const dailyForecasts = Object.entries(groupedForecast)
    .filter(([date]) => {
      // Filter out today, only show tomorrow onwards
      // date is already in local format from groupByDay function
      const forecastDateLocal = date; // Already in local format
      const todayDateLocal = today; // Already in local format
      const tomorrowDateLocal = tomorrowStr; // Already in local format
      
      const isTomorrowOrLater = forecastDateLocal >= tomorrowDateLocal;
      console.log(`Date ${date}: forecastDateLocal=${forecastDateLocal}, todayDateLocal=${todayDateLocal}, tomorrowDateLocal=${tomorrowDateLocal}, isTomorrowOrLater=${isTomorrowOrLater}`);
      return isTomorrowOrLater; // Only tomorrow and later dates
    })
    .map(([date, dayData]) => {
      // Create a proper Date object for the forecast day using local timezone
      // date is in YYYY-MM-DD format, convert to Date object
      const forecastDate = new Date(date + 'T12:00:00'); // Use noon in local timezone
      return {
        date: forecastDate,
        data: calculateDailyAverages(dayData)
      };
    })
    .slice(0, 5); // Show exactly 5 days starting from tomorrow
    
  // Debug: Log the final forecast dates
  console.log('Final forecast dates:', dailyForecasts.map(f => f.date.toDateString()));
  console.log('Final forecast dates (formatted):', dailyForecasts.map(f => f.date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })));

  return (
    <div className="forecast-display">
      <div className="forecast-header">
        <h3>📅 5-Day Weather Forecast</h3>
        <p className="forecast-subtitle">Daily weather predictions starting from tomorrow ({tomorrowStr})</p>
      </div>
      
      <div className="forecast-grid">
        {dailyForecasts.map((day, index) => (
          <div key={index} className="forecast-day">
            <div className="forecast-date">
              <div className="day-name">{formatDate(day.date.getTime() / 1000)}</div>
              <div className="full-date">{formatFullDate(day.date.getTime() / 1000)}</div>
            </div>
            
            <div className="forecast-icon">
              {getWeatherIcon(day.data.weather.id)}
            </div>
            
            <div className="forecast-description">
              {day.data.weather.description}
            </div>
            
            <div className="forecast-temp-range">
              <span className="temp-max">
                {Math.round(day.data.temp_max)}{getTemperatureUnit()}
              </span>
              <span className="temp-min">
                {Math.round(day.data.temp_min)}{getTemperatureUnit()}
              </span>
            </div>
            
            <div className="forecast-avg-temp">
              Avg: {day.data.temp_avg}{getTemperatureUnit()}
            </div>
            
            <div className="forecast-details">
              <div className="forecast-detail">
                <span className="detail-label">💧 Humidity</span>
                <span className="detail-value">{day.data.humidity}%</span>
              </div>
              <div className="forecast-detail">
                <span className="detail-label">💨 Wind</span>
                <span className="detail-value">{day.data.wind_speed} {unit === 'metric' ? 'm/s' : 'mph'}</span>
              </div>
              <div className="forecast-detail">
                <span className="detail-label">🌡️ Feels Like</span>
                <span className="detail-value">{day.data.feels_like_avg}{getTemperatureUnit()}</span>
              </div>
              <div className="forecast-detail">
                <span className="detail-label">📊 Pressure</span>
                <span className="detail-value">{day.data.pressure} hPa</span>
              </div>
              {day.data.pop > 0 && (
                <div className="forecast-detail">
                  <span className="detail-label">🌧️ Rain Chance</span>
                  <span className="detail-value">{Math.round(day.data.pop * 100)}%</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {dailyForecasts.length === 0 && (
        <div className="no-forecast-data">
          <p>No forecast data available for the next 5 days.</p>
        </div>
      )}
    </div>
  );
}

export default ForecastDisplay;
