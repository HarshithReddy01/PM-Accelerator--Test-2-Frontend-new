import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import './ErrorMessage.css';

const ErrorMessage = ({ message }) => {
  return (
    <div className="error-container">
      <div className="error-message">
        <FaExclamationTriangle className="error-icon" />
        <h3>Location Entered Wrong</h3>
        <p>{message}</p>
      </div>
    </div>
  );
};

export default ErrorMessage;
