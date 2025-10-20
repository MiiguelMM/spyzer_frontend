// VixMetricsCards.jsx - VIX usando DataDistributor
import React from 'react';
import { useDAX } from '../../context/IndicesProvider';
import '../../../css/MetricsCards.css';

export default function VixMetricsCards() {
  // Obtener datos del contexto centralizado para VIX
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
        <div className="loading-icon">😱</div>
        Loading {marketInfo?.name || 'VIX'} data...
      </div>
    );
  }

  // Si no hay datos, mostrar mensaje
  if (!historicalData || historicalData.length < 2) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        {hasError ? `Error: ${error}` : `No ${marketInfo?.name || 'VIX'} data available`}
      </div>
    );
  }

  const today = historicalData[historicalData.length - 1];
  const yesterday = historicalData[historicalData.length - 2];

  // Usar datos calculados del contexto
  const vixChange = dailyChange || (today.close - yesterday.close);
  const percentageChange = percentChange || ((vixChange / yesterday.close) * 100);
  const isHigh = vixChange >= 0; // Para VIX, más alto = más miedo

  // VIX interpretation
  const getVixLevel = (value) => {
    if (value < 12) return 'Low Fear';
    if (value < 20) return 'Normal';
    if (value < 30) return 'High Fear';
    return 'Extreme Fear';
  };

  // VIX color based on level
  const getVixLevelColor = (value) => {
    if (value < 12) return '#00FF85'; // Verde - poco miedo
    if (value < 20) return '#FFA500'; // Naranja - normal
    if (value < 30) return '#FF6B35'; // Rojo claro - miedo alto
    return '#FF4757'; // Rojo intenso - miedo extremo
  };

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
            <span className="metric-label">VIX:</span>
            <span className="metric-value">
              {(currentPrice || today.close).toFixed(2)}
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
              {yesterday.close.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Daily Change */}
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