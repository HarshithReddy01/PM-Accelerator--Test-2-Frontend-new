import React, { useState, useEffect } from 'react';
import { MdLocationOn, MdDelete, MdEdit, MdWarning, MdClear, MdDescription, MdAssessment, MdCode, MdCreate, MdDateRange, MdPublic, MdAccessTime, MdUpdate, MdArrowBack } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import config from '../config.js';
import './WeatherHistory.css';

const WeatherHistory = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [editForm, setEditForm] = useState({
    location: '',
    start_date: '',
    end_date: ''
  });

  const handleBackToForecast = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          navigate(`/weather/${latitude},${longitude}`);
        },
        (error) => {
          console.error('Error getting location:', error);
          navigate('/weather/New York');
        }
      );
    } else {
      navigate('/weather/New York');
    }
  };

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${config.API_BASE_URL}/api/weather`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setRecords(data.records || []);
      } else {
        setError('Failed to fetch weather records');
      }
    } catch (err) {
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const deleteRecord = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        const response = await fetch(`${config.API_BASE_URL}/api/weather/${id}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        if (response.ok) {
          setRecords(records.filter(record => record.id !== id));
        } else {
          setError('Failed to delete record');
        }
      } catch (err) {
        setError('Error deleting record');
      }
    }
  };

  const startEdit = (record) => {
    setEditingRecord(record.id);
    setEditForm({
      location: record.location,
      start_date: record.start_date,
      end_date: record.end_date
    });
  };

  const cancelEdit = () => {
    setEditingRecord(null);
    setEditForm({ location: '', start_date: '', end_date: '' });
  };

  const updateRecord = async (id) => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/api/weather/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm),
        credentials: 'include'
      });
      
      if (response.ok) {
        const updatedRecord = await response.json();
        setRecords(records.map(record => 
          record.id === id ? { ...record, ...editForm } : record
        ));
        setEditingRecord(null);
        setEditForm({ location: '', start_date: '', end_date: '' });
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update record');
      }
    } catch (err) {
      setError('Error updating record');
    }
  };

  const exportData = async (format) => {
    try {
      setError(null);
      console.log(`Attempting to export ${format}...`);
      const response = await fetch(`${config.API_BASE_URL}/api/export/${format}`, {
        credentials: 'include'
      });
      
      console.log(`Response status: ${response.status}`);
      console.log(`Response headers:`, response.headers);
      
      if (response.ok) {
        const blob = await response.blob();
        console.log(`Blob size: ${blob.size} bytes`);
        console.log(`Blob type: ${blob.type}`);
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `weather_records.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        console.log(`${format} export completed successfully`);
      } else {
        const errorData = await response.json();
        console.error(`Export failed:`, errorData);
        setError(`Failed to export ${format}: ${errorData.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Export error:', err);
      setError(`Error exporting ${format}: ${err.message}`);
    }
  };

  const clearAllHistory = async () => {
    if (!window.confirm('Are you sure you want to delete ALL weather records? This action cannot be undone!')) {
      return;
    }

    try {
      setLoading(true);
              const response = await fetch(`${config.API_BASE_URL}/api/weather/clear-all`, {
          method: 'DELETE',
          credentials: 'include'
        });
      
             if (response.ok) {
         setRecords([]);
         setError(null);
         setSuccessMessage('All weather records have been deleted successfully!');
         setTimeout(() => setSuccessMessage(null), 3000);
       } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to clear history');
      }
    } catch (err) {
      setError('Error clearing history');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="weather-history">
        <div className="loading">Loading weather history...</div>
      </div>
    );
  }

  return (
    <div className="weather-history">
      <div className="back-button-container">
        <button onClick={handleBackToForecast} className="back-to-forecast-btn">
          <MdArrowBack /> Back to Weather Forecast
        </button>
      </div>
      
      <div className="history-header">
        <h2>Weather History</h2>
        <p>View and manage your saved weather records</p>
        
                 <div className="export-buttons">
           <h4>Export Data:</h4>
           <button onClick={() => exportData('json')} className="export-btn json">
             <MdCode /> JSON
           </button>
           <button onClick={() => exportData('xml')} className="export-btn xml">
             <MdDescription /> XML
           </button>
           <button onClick={() => exportData('csv')} className="export-btn csv">
             <MdAssessment /> CSV (delimited)
           </button>
         </div>
        
        <div className="clear-history-section">
          <button 
            onClick={clearAllHistory} 
            className="clear-history-btn"
            disabled={loading || records.length === 0}
          >
            {loading ? <><MdClear /> Clearing...</> : <><MdClear /> Clear All Records</>}
          </button>
          {records.length > 0 && (
            <p className="clear-warning">
              <MdWarning /> This will permanently delete all {records.length} weather records
            </p>
          )}
        </div>
      </div>

             {error && (
         <div className="error-message">
           {error}
           <button onClick={() => setError(null)}>✕</button>
         </div>
       )}

       {successMessage && (
         <div className="success-message">
           {successMessage}
           <button onClick={() => setSuccessMessage(null)}>✕</button>
         </div>
       )}

      {records.length === 0 ? (
        <div className="no-records">
          <p>No weather records found. Save some weather data to see it here!</p>
        </div>
      ) : (
        <div className="records-grid">
          {records.map((record) => (
            <div key={record.id} className="record-card">
              <div className="record-header">
                <h3>{record.location}</h3>
                <div className="record-actions">
                  {editingRecord === record.id ? (
                    <>
                      <button onClick={() => updateRecord(record.id)} className="save-btn">
                        Save
                      </button>
                      <button onClick={cancelEdit} className="cancel-btn">
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(record)} className="edit-btn">
                        <MdEdit /> Edit
                      </button>
                      <button onClick={() => deleteRecord(record.id)} className="delete-btn">
                        <MdDelete /> Delete
                      </button>
                    </>
                  )}
                </div>
              </div>

              {editingRecord === record.id ? (
                <div className="edit-form">
                  <div className="form-group">
                    <label>Location:</label>
                    <input
                      type="text"
                      value={editForm.location}
                      onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Start Date:</label>
                    <input
                      type="date"
                      value={editForm.start_date}
                      onChange={(e) => setEditForm({...editForm, start_date: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date:</label>
                    <input
                      type="date"
                      value={editForm.end_date}
                      onChange={(e) => setEditForm({...editForm, end_date: e.target.value})}
                    />
                  </div>
                </div>
              ) : (
                <div className="record-details">
                  <div className="detail-row">
                    <span className="label"><MdLocationOn /> Location:</span>
                    <span className="value">{record.location}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label"><MdDateRange /> Date Range:</span>
                    <span className="value">
                      {new Date(record.start_date).toLocaleDateString()} - {new Date(record.end_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label"><MdPublic /> Coordinates:</span>
                    <span className="value">
                      {record.latitude?.toFixed(4)}, {record.longitude?.toFixed(4)}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label"><MdAccessTime /> Created:</span>
                    <span className="value">
                      {new Date(record.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label"><MdUpdate /> Updated:</span>
                    <span className="value">
                      {new Date(record.updated_at).toLocaleString()}
                    </span>
                  </div>
                  
                  {record.temperature_data && (
                    <div className="weather-preview">
                      <h4>Weather Data Preview:</h4>
                      <div className="weather-summary">
                        {record.temperature_data.current && (
                          <div className="current-weather">
                            <span>Current: {Math.round(record.temperature_data.current.main?.temp || 0)}°C</span>
                            <span>Humidity: {record.temperature_data.current.main?.humidity || 0}%</span>
                          </div>
                        )}
                        {record.temperature_data.forecast && (
                          <div className="forecast-count">
                            Forecast periods: {record.temperature_data.forecast.list?.length || 0}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WeatherHistory;
