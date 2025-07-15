// MetricsCards.jsx - Componente de las Cards de Métricas usando DataDistributor
import React from 'react';
import { useMarketData } from '../SP500data/DataDistributor';
import '../../css/MetricsCards.css';

export default function MetricsCards() {
  // Obtener datos del contexto centralizado
  const { 
    historicalData, 
    isLoading, 
    hasError, 
    error, 
    currentPrice,
    dailyChange,
    percentChange,
    lastUpdated 
  } = useMarketData();

  // Si está cargando, mostrar loading
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-icon">📊</div>
        Loading market data...
      </div>
    );
  }

  // Si no hay datos, mostrar mensaje
  if (!historicalData || historicalData.length < 2) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        {hasError ? `Error: ${error}` : 'No market data available'}
      </div>
    );
  }

  const today = historicalData[historicalData.length - 1];
  const yesterday = historicalData[historicalData.length - 2];
  
  // Usar datos calculados del contexto si están disponibles, sino calcular localmente
  const priceChange = dailyChange || (today.close - yesterday.close);
  const percentageChange = percentChange || ((priceChange / yesterday.close) * 100);
  const isPositive = priceChange >= 0;

  return (
    <div className="metrics-container">
      {/* Today's Metrics */}
      <div className="metrics-card">
        <div className="card-header">
          <div className="card-indicator today"></div>
          <h3 className="card-title">Today's Session</h3>
        </div>
        <div className="card-content">
          <div className="metric-row">
            <span className="metric-label">Open:</span>
            <span className="metric-value">${today.open}</span>
          </div>
          <div className="metric-row high">
            <span className="metric-label">High:</span>
            <span className="metric-value high">${today.high}</span>
          </div>
          <div className="metric-row low">
            <span className="metric-label">Low:</span>
            <span className="metric-value low">${today.low}</span>
          </div>
          <div className="metric-row close">
            <span className="metric-label">Close:</span>
            <span className="metric-value close">${today.close}</span>
          </div>
        </div>
      </div>

      {/* Yesterday's Metrics */}
      <div className="metrics-card">
        <div className="card-header">
          <div className="card-indicator yesterday"></div>
          <h3 className="card-title">Previous Session</h3>
        </div>
        <div className="card-content">
          <div className="metric-row high">
            <span className="metric-label">Open:</span>
            <span className="metric-value">${yesterday.open}</span>
          </div>
          <div className="metric-row high">
            <span className="metric-label">High:</span>
            <span className="metric-value high">${yesterday.high}</span>
          </div>
          <div className="metric-row low">
            <span className="metric-label">Low:</span>
            <span className="metric-value low">${yesterday.low}</span>
          </div>
          <div className="metric-row yesterday-close">
            <span className="metric-label">Close:</span>
            <span className="metric-value yesterday-close">${yesterday.close}</span>
          </div>
        </div>
      </div>

      {/* Daily Change */}
      <div className="metrics-card">
        <div className="card-header">
          <div className={`card-indicator ${isPositive ? 'positive' : 'negative'}`}></div>
          <h3 className="card-title">Daily Change</h3>
        </div>
        
        <div className="card-content">
          <div className="metric-row change-amount">
            <span className="metric-label">Amount:</span>
            <span className={`metric-value change-amount ${isPositive ? 'positive' : 'negative'}`}>
              {isPositive ? '+' : ''}${priceChange.toFixed(2)}
            </span>
          </div>
          <div className="metric-row change-percent">
            <span className="metric-label">Percent:</span>
            <span className={`metric-value change-percent ${isPositive ? 'positive' : 'negative'}`}>
              {isPositive ? '+' : ''}{percentageChange.toFixed(2)}%
            </span>
          </div>
          
        </div>
      </div>
    </div>
  );
}