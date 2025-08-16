import React, { useState } from 'react';
import './SaveWeather.css';

const SaveWeather = ({ currentLocation, currentWeatherData, onSaveSuccess }) => {
  const [formData, setFormData] = useState({
    location: currentLocation || '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 5 days from now
  });

  React.useEffect(() => {
    if (currentLocation) {
      setFormData(prev => ({
        ...prev,
        location: currentLocation
      }));
    }
  }, [currentLocation]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.location.trim()) {
      setError('Location is required');
      return false;
    }
    
    const startDate = new Date(formData.start_date);
    const endDate = new Date(formData.end_date);
    const today = new Date();
    
    if (startDate < today) {
      setError('Start date cannot be in the past');
      return false;
    }
    
    if (endDate < startDate) {
      setError('End date must be after start date');
      return false;
    }
    
    const daysDiff = (endDate - startDate) / (1000 * 60 * 60 * 24);
    if (daysDiff > 7) {
      setError('Date range cannot exceed 7 days');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/weather', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        const result = await response.json();
        setSuccess(true);
        
        setFormData({
          location: currentLocation || '',
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });
        
        if (onSaveSuccess) {
          onSaveSuccess(result);
        }
        
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save weather data');
      }
    } catch (err) {
      console.error('Save error:', err);
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSave = async () => {
    if (!currentLocation || !currentWeatherData) {
      setError('No current weather data to save');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const fiveDaysFromNow = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const response = await fetch('http://localhost:5000/api/weather', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          location: currentLocation,
          start_date: today,
          end_date: fiveDaysFromNow
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        setSuccess(true);
        if (onSaveSuccess) {
          onSaveSuccess(result);
        }
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save current weather');
      }
    } catch (err) {
      console.error('Save error:', err);
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="save-weather">
      <div className="save-weather-header">
        <h3> Save Weather Data</h3>
        <p>Save weather information for future reference and download PDF from history</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {success && (
        <div className="success-message">
          Weather data saved successfully!
        </div>
      )}

      <div className="save-options">
        {currentLocation && currentWeatherData && (
          <div className="quick-save-section">
            <h4>Quick Save Current Weather</h4>
            <p>Save current weather for {currentLocation}</p>
            <button 
              onClick={handleQuickSave} 
              disabled={loading}
              className="quick-save-btn"
            >
              {loading ? 'Saving...' : 'Quick Save'}
            </button>
          </div>
        )}

        <div className="divider">
          <span>OR</span>
        </div>

        <div className="custom-save-section">
          <h4>Custom Weather Save</h4>
          <form onSubmit={handleSubmit} className="save-form">
            <div className="form-group">
              <label htmlFor="location">Location:</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Enter city, coordinates, or landmark"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="start_date">📅 Start Date:</label>
                <input
                  type="date"
                  id="start_date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="end_date">📅 End Date:</label>
                <input
                  type="date"
                  id="end_date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  min={formData.start_date}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="save-btn"
            >
              {loading ? ' Saving Weather Data...' : ' Save Weather Data'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SaveWeather;
