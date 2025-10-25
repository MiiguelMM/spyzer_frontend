// DaxMetricCards.jsx - DAX usando DataDistributor
import React from 'react';
import { useDAX } from '../../context/IndicesProvider';
import '../../../css/MetricsCards.css';

export default function DaxMetricsCards() {
  // Obtener datos del contexto centralizado para DAX
  const {
    historicalData,
    isLoading,
    hasError,
    error,
    currentPrice,
    dailyChange,
    percentChange,
    marketInfo
  } = useDAX();

  // Si está cargando, mostrar loading
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-icon">📊</div>
        Loading {marketInfo?.name || 'DAX'} data...
      </div>
    );
  }

  // Si no hay datos, mostrar mensaje
  if (!historicalData || historicalData.length < 2) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        {hasError ? `Error: ${error}` : `No ${marketInfo?.name || 'DAX'} data available`}
      </div>
    );
  }

  const today = historicalData[historicalData.length - 1];
  const yesterday = historicalData[historicalData.length - 2];

  // Usar datos calculados del contexto
  const priceChange = dailyChange || (today.close - yesterday.close);
  const percentageChange = percentChange || ((priceChange / yesterday.close) * 100);
  const isPositive = priceChange >= 0;

  return (
    <div className="metrics-container">
      {/* Today's Metrics */}
      <div className="metrics-card">
        <div className="card-header">
          <div className="card-indicator today"></div>
          <h3 className="card-title">Today</h3>
        </div>
        <div className="card-content">
          <div className="metric-row">
            <span className="metric-label">Current:</span>
            <span className="metric-value">
              €{(currentPrice || today.close).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Yesterday's Metrics */}
      <div className="metrics-card">
        <div className="card-header">
          <div className="card-indicator yesterday"></div>
          <h3 className="card-title">Yesterday</h3>
        </div>
        <div className="card-content">
          <div className="metric-row yesterday-close">
            <span className="metric-label">Close:</span>
            <span className="metric-value yesterday-close">
              €{yesterday.close.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Daily Change */}
      <div className="metrics-card">
        <div className="card-header">
          <div className={`card-indicator ${isPositive ? 'positive' : 'negative'}`}></div>
          <h3 className="card-title">Change</h3>
        </div>

        <div className="card-content">
          <div className="metric-row change-amount">
            <span className="metric-label">Change:</span>
            <span className={`metric-value change-amount ${isPositive ? 'positive' : 'negative'}`}>
              {isPositive ? '+' : ''}{percentageChange.toFixed(2)}%
              <span className="price-change-detail">
                ({isPositive ? '+' : ''}€{Math.abs(priceChange).toFixed(2)})
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}