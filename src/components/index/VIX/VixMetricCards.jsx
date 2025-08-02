// VixMetricsCards.jsx
import React from 'react';
import '../../../css/MetricsCards.css';

export default function VixMetricsCards({ historicalData, isLoading, hasError, error }) {
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-icon">😱</div>
        Loading VIX data...
      </div>
    );
  }

  if (!historicalData || historicalData.length < 2) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        {hasError ? `Error: ${error}` : 'No VIX data available'}
      </div>
    );
  }

  const today = historicalData[historicalData.length - 1];
  const yesterday = historicalData[historicalData.length - 2];
  
  const vixChange = today.close - yesterday.close;
  const percentageChange = (vixChange / yesterday.close) * 100;
  const isHigh = vixChange >= 0; // For VIX, higher = more fear

  // VIX interpretation
  const getVixLevel = (value) => {
    if (value < 12) return 'Low Fear';
    if (value < 20) return 'Normal';
    if (value < 30) return 'High Fear';
    return 'Extreme Fear';
  };

  return (
    <div className="metrics-container">
      <div className="metrics-card">
        <div className="card-header">
          <div className="card-indicator today"></div>
          <h3 className="card-title">Today</h3>
        </div>
        <div className="card-content">
          <div className="metric-row">
            <span className="metric-label">VIX:</span>
            <span className="metric-value">{today.close.toFixed(2)}</span>
          </div>
          <div className="metric-row">
            <span className="metric-label">Level:</span>
            <span className="metric-value" style={{fontSize: '12px'}}>{getVixLevel(today.close)}</span>
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
            <span className="metric-value yesterday-close">{yesterday.close.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="metrics-card">
        <div className="card-header">
          <div className={`card-indicator ${isHigh ? 'negative' : 'positive'}`}></div>
          <h3 className="card-title">Change</h3>
        </div>
        
        <div className="card-content">
          <div className="metric-row change-amount">
            <span className="metric-label">Amount:</span>
            <span className={`metric-value change-amount ${isHigh ? 'negative' : 'positive'}`}>
              {isHigh ? '+' : ''}{vixChange.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}