// NasdaqMetricsCards.jsx
import React from 'react';
import '../../../css/MetricsCards.css';

export default function NasdaqMetricsCards({ historicalData, isLoading, hasError, error }) {
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-icon">🚀</div>
        Loading NASDAQ data...
      </div>
    );
  }

  if (!historicalData || historicalData.length < 2) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        {hasError ? `Error: ${error}` : 'No NASDAQ data available'}
      </div>
    );
  }

  const today = historicalData[historicalData.length - 1];
  const yesterday = historicalData[historicalData.length - 2];
  
  const priceChange = today.close - yesterday.close;
  const percentageChange = (priceChange / yesterday.close) * 100;
  const isPositive = priceChange >= 0;

  return (
    <div className="metrics-container">
      <div className="metrics-card">
        <div className="card-header">
          <div className="card-indicator today"></div>
          <h3 className="card-title">Today</h3>
        </div>
        <div className="card-content">
          <div className="metric-row">
            <span className="metric-label">Current:</span>
            <span className="metric-value">${today.close.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="metrics-card">
        <div className="card-header">
          <div className="card-indicator yesterday"></div>
          <h3 className="card-title">Yesterday</h3>
        </div>
        <div className="card-content">
          <div className="metric-row yesterday-close">
            <span className="metric-label">Close:</span>
            <span className="metric-value yesterday-close">${yesterday.close.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="metrics-card">
        <div className="card-header">
          <div className={`card-indicator ${isPositive ? 'positive' : 'negative'}`}></div>
          <h3 className="card-title">Change</h3>
        </div>
        
        <div className="card-content">
          <div className="metric-row change-amount">
            <span className="metric-label">Amount:</span>
            <span className={`metric-value change-amount ${isPositive ? 'positive' : 'negative'}`}>
              {isPositive ? '+' : ''}${priceChange.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}