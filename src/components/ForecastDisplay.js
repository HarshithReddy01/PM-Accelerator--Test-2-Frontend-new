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
    const todayStr = today.toDateString();
    const tomorrowStr = tomorrow.toDateString();
    
    if (dateStr === todayStr) {
      return 'Today';
    } else if (dateStr === tomorrowStr) {
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
    const todayStr = today.toDateString();
    const tomorrowStr = tomorrow.toDateString();
    
    if (dateStr === todayStr) {
      return 'Today';
    } else if (dateStr === tomorrowStr) {
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
    console.log('Grouped forecast data by day:', Object.keys(grouped));
    console.log('Number of days in grouped data:', Object.keys(grouped).length);
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
  console.log('Raw forecast data list length:', data.list ? data.list.length : 0);
  console.log('First forecast item:', data.list ? data.list[0] : 'No data');
  console.log('Last forecast item:', data.list ? data.list[data.list.length - 1] : 'No data');
  
  // Debug: Log all forecast dates to see what we're getting
  if (data.list) {
    console.log('All forecast dates from API:');
    data.list.forEach((item, index) => {
      const date = new Date(item.dt * 1000);
      console.log(`Item ${index}: ${date.toDateString()} - ${item.dt_txt}`);
    });
  }
  
  const groupedForecast = groupByDay(data.list);
  
  // Use local dates instead of UTC to avoid timezone issues
  const now = new Date();
  const today = now.toLocaleDateString('en-CA'); // YYYY-MM-DD format in local timezone
  
  // Debug: Log the available dates
  console.log('Available dates in forecast:', Object.keys(groupedForecast));
  console.log('Today (local):', today);
  console.log('Current time:', now.toLocaleString());
  console.log('Current date object:', now);
  console.log('Today string format:', today);
  
  // Get tomorrow's date for comparison
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toLocaleDateString('en-CA');
  
  console.log('Tomorrow (local):', tomorrowStr);
  console.log('All available dates:', Object.keys(groupedForecast).sort());
  
  // Get all available dates and sort them
  const allDates = Object.keys(groupedForecast).sort();
  console.log('All available dates from API:', allDates);
  console.log('Total available dates:', allDates.length);
  
  // Find the index of today in the sorted dates
  const todayIndex = allDates.indexOf(today);
  console.log('Today index in available dates:', todayIndex);
  
  // Get exactly 5 days starting from today (including today)
  let next5Days = [];
  
  if (todayIndex >= 0) {
    // If today is found, get today plus the next 4 days
    next5Days = allDates.slice(todayIndex, todayIndex + 5);
  } else {
    // If today is not found, get the first 5 days available
    next5Days = allDates.slice(0, 5);
  }
  
  // If we don't have 5 days, try to get more days from the available data
  if (next5Days.length < 5) {
    console.warn(`Only ${next5Days.length} days available, trying to get more...`);
    
    // Try to get more days from the remaining data
    const remainingDays = allDates.slice(todayIndex >= 0 ? todayIndex + 5 : 5);
    if (remainingDays.length > 0) {
      const additionalDays = remainingDays.slice(0, 5 - next5Days.length);
      next5Days = [...next5Days, ...additionalDays];
      console.log('Added additional days:', additionalDays);
    }
        
        // If we still don't have 5 days, try to get more days from the beginning
        if (next5Days.length < 5) {
          const moreDays = allDates.slice(0, 5);
          if (moreDays.length > next5Days.length) {
            next5Days = moreDays;
            console.log('Using first 5 available days:', next5Days);
          }
        }
  }
  
  console.log('Final selected days to display (today + next 4 days):', next5Days);
  console.log('Number of days to display:', next5Days.length);
  
  const dailyForecasts = next5Days
    .map((date) => {
      const dayData = groupedForecast[date];
      if (!dayData) return null;
      
      // Create a proper Date object for the forecast day using local timezone
      const forecastDate = new Date(date + 'T12:00:00'); // Use noon in local timezone
      return {
        date: forecastDate,
        data: calculateDailyAverages(dayData)
      };
    })
    .filter(Boolean); // Remove any null entries
    
  // Debug: Log the final forecast dates
  console.log('Final forecast dates:', dailyForecasts.map(f => f.date.toDateString()));
  console.log('Final forecast dates (formatted):', dailyForecasts.map(f => f.date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })));

  return (
    <div className="forecast-display">
      <div className="forecast-header">
        <h3>📅 5-Day Weather Forecast</h3>
        <p className="forecast-subtitle">Daily weather predictions for the next 5 days</p>
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
      
      {dailyForecasts.length > 0 && dailyForecasts.length < 5 && (
        <div className="forecast-note">
          <p>Note: Only {dailyForecasts.length} days of forecast data available from the weather service.</p>
        </div>
      )}
    </div>
  );
}

export default ForecastDisplay;
