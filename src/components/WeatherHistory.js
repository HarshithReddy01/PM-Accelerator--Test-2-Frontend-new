import React, { useState, useEffect } from 'react';
import './WeatherHistory.css';

const WeatherHistory = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [editForm, setEditForm] = useState({
    location: '',
    start_date: '',
    end_date: ''
  });

  // Fetch all weather records
  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/weather');
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

  // Delete a record
  const deleteRecord = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/weather/${id}`, {
          method: 'DELETE'
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

  // Start editing a record
  const startEdit = (record) => {
    setEditingRecord(record.id);
    setEditForm({
      location: record.location,
      start_date: record.start_date,
      end_date: record.end_date
    });
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingRecord(null);
    setEditForm({ location: '', start_date: '', end_date: '' });
  };

  // Update a record
  const updateRecord = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/weather/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
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

  // Export data
  const exportData = async (format) => {
    try {
      const response = await fetch(`http://localhost:5000/api/export/${format}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `weather_records.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setError(`Failed to export ${format}`);
      }
    } catch (err) {
      setError(`Error exporting ${format}`);
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
      <div className="history-header">
        <h2>📚 Weather History</h2>
        <p>View and manage your saved weather records</p>
        
        <div className="export-buttons">
          <h4>Export Data:</h4>
          <button onClick={() => exportData('json')} className="export-btn json">
            📄 JSON
          </button>
          <button onClick={() => exportData('csv')} className="export-btn csv">
            📊 CSV
          </button>
          <button onClick={() => exportData('xml')} className="export-btn xml">
            📋 XML
          </button>
          <button onClick={() => exportData('pdf')} className="export-btn pdf">
            📑 PDF
          </button>
          <button onClick={() => exportData('markdown')} className="export-btn markdown">
            📝 Markdown
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>✕</button>
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
                        💾 Save
                      </button>
                      <button onClick={cancelEdit} className="cancel-btn">
                        ❌ Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(record)} className="edit-btn">
                        ✏️ Edit
                      </button>
                      <button onClick={() => deleteRecord(record.id)} className="delete-btn">
                        🗑️ Delete
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
                    <span className="label">📍 Location:</span>
                    <span className="value">{record.location}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">📅 Date Range:</span>
                    <span className="value">
                      {new Date(record.start_date).toLocaleDateString()} - {new Date(record.end_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">🌍 Coordinates:</span>
                    <span className="value">
                      {record.latitude?.toFixed(4)}, {record.longitude?.toFixed(4)}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">📊 Created:</span>
                    <span className="value">
                      {new Date(record.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">🔄 Updated:</span>
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
