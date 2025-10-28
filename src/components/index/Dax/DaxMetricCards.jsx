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

  // 🔧 SOLUCIÓN: Obtener el cierre del día anterior correctamente
  const getYesterdayClose = () => {
    if (!historicalData || historicalData.length === 0) return null;

    // Obtener la fecha de hoy (sin hora)
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const todayTimestamp = Math.floor(todayDate.getTime() / 1000);

    // Encontrar todos los puntos del día anterior
    const yesterdayPoints = [];
    for (let i = historicalData.length - 1; i >= 0; i--) {
      const pointDate = new Date(historicalData[i].time * 1000);
      pointDate.setHours(0, 0, 0, 0);
      const pointTimestamp = Math.floor(pointDate.getTime() / 1000);

      // Si el punto es de ayer, agregarlo
      if (pointTimestamp < todayTimestamp) {
        yesterdayPoints.push(historicalData[i]);
      }
      
      // Si encontramos puntos de ayer y luego pasamos a días anteriores, parar
      if (yesterdayPoints.length > 0 && pointTimestamp < todayTimestamp - 86400) {
        break;
      }
    }

    // Retornar el último punto de ayer (el cierre)
    return yesterdayPoints.length > 0 ? yesterdayPoints[0] : historicalData[historicalData.length - 2];
  };

  const today = historicalData[historicalData.length - 1];
  const yesterday = getYesterdayClose();

  if (!yesterday) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        Not enough historical data
      </div>
    );
  }

  // Usar datos calculados del contexto
  const priceChange = dailyChange || (currentPrice || today.close) - yesterday.close;
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