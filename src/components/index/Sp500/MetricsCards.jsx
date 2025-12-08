// MetricsCards.jsx - S&P 500 usando DataDistributor (VERSIÓN LIMPIA)
import React from 'react';
import { useSP500 } from '../../context/IndicesProvider';
import '../../../css/MetricsCards.css';

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
    previousClose,
    marketInfo
  } = useSP500();

  // Si está cargando, mostrar skeleton loaders
  if (isLoading) {
    return (
      <div className="metrics-container">
        {/* Today's Metrics Skeleton */}
        <div className="metrics-card loading">
          <div className="card-header">
            <div className="card-indicator skeleton-indicator"></div>
            <h3 className="card-title skeleton-text" style={{ width: '60px', height: '16px' }}></h3>
          </div>
          <div className="card-content">
            <div className="metric-row">
              <span className="metric-label skeleton-text" style={{ width: '60px', height: '14px' }}></span>
              <span className="metric-value skeleton-text" style={{ width: '80px', height: '20px' }}></span>
            </div>
          </div>
        </div>

        {/* Previous Close Skeleton */}
        <div className="metrics-card loading">
          <div className="card-header">
            <div className="card-indicator skeleton-indicator"></div>
            <h3 className="card-title skeleton-text" style={{ width: '80px', height: '16px' }}></h3>
          </div>
          <div className="card-content">
            <div className="metric-row">
              <span className="metric-label skeleton-text" style={{ width: '50px', height: '14px' }}></span>
              <span className="metric-value skeleton-text" style={{ width: '80px', height: '20px' }}></span>
            </div>
          </div>
        </div>

        {/* Daily Change Skeleton */}
        <div className="metrics-card loading">
          <div className="card-header">
            <div className="card-indicator skeleton-indicator"></div>
            <h3 className="card-title skeleton-text" style={{ width: '70px', height: '16px' }}></h3>
          </div>
          <div className="card-content">
            <div className="metric-row">
              <span className="metric-label skeleton-text" style={{ width: '60px', height: '14px' }}></span>
              <span className="metric-value skeleton-text" style={{ width: '100px', height: '20px' }}></span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Si no hay datos, mostrar mensaje
  if (!historicalData || historicalData.length < 2) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        {hasError ? `Error: ${error}` : `No ${marketInfo?.name || 'market'} data available`}
      </div>
    );
  }

  // 🔧 SOLUCIÓN: Usar el día de la semana REAL para determinar qué mostrar
  const getPreviousClose = () => {
    if (historicalData.length < 3) return null;

    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=Domingo, 1=Lunes, ..., 5=Viernes, 6=Sábado

    // Determinar cuántos días de trading retroceder
    let diasAtras;

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      // Sábado o Domingo → 2 días de trading atrás (jueves)
      diasAtras = 2;
    } else if (dayOfWeek === 5) {
      // Viernes → 1 día de trading atrás (jueves)
      diasAtras = 1;
    } else if (dayOfWeek === 1) {
      // Lunes → 1 día de trading atrás (viernes)
      diasAtras = 1;
    } else {
      // Martes, Miércoles, Jueves → 1 día atrás
      diasAtras = 1;
    }

    // Buscar hacia atrás los días de trading necesarios
    const tradingDays = [];
    let lastDate = null;

    for (let i = historicalData.length - 1; i >= 0; i--) {
      const pointDate = new Date(historicalData[i].time * 1000);
      pointDate.setHours(0, 0, 0, 0);
      const pointDay = pointDate.getTime();

      // Solo agregar si es un día diferente al anterior
      if (lastDate === null || pointDay < lastDate) {
        tradingDays.push({
          date: pointDate,
          close: historicalData[i].close,
          index: i
        });
        lastDate = pointDay;

        // Si ya tenemos suficientes días, parar
        if (tradingDays.length > diasAtras) {
          break;
        }
      }
    }

    // Retornar el día correcto
    if (tradingDays.length > diasAtras) {
      const targetDay = tradingDays[diasAtras];
      console.log(`[S&P500] Previous Close: ${targetDay.date.toDateString()} - $${targetDay.close}`);
      return targetDay.close;
    }

    // Fallback
    return tradingDays[tradingDays.length - 1]?.close || historicalData[historicalData.length - 2].close;
  };

  const latestPoint = historicalData[historicalData.length - 1];
  const yesterdayClose = previousClose || getPreviousClose();

  if (!yesterdayClose) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        Not enough historical data
      </div>
    );
  }

  // Calcular cambios
  const priceChange = dailyChange || (currentPrice || latestPoint.close) - yesterdayClose;
  const percentageChange = percentChange || ((priceChange / yesterdayClose) * 100);
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
              ${(currentPrice || latestPoint.close).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Previous Close */}
      <div className="metrics-card">
        <div className="card-header">
          <div className="card-indicator yesterday"></div>
          <h3 className="card-title">Yesterday</h3>
        </div>
        <div className="card-content">
          <div className="metric-row yesterday-close">
            <span className="metric-label">Close:</span>
            <span className="metric-value yesterday-close">
              ${yesterdayClose.toFixed(2)}
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
                ({isPositive ? '+' : ''}${Math.abs(priceChange).toFixed(2)})
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}