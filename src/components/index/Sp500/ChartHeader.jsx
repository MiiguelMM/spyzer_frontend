// ChartHeader.jsx - Componente del Header
import React from 'react';
import '../../../css/ChartHeader.css'; 

export default function ChartHeader() {
  return (
    <div className="chart-header">
      <div className="chart-header-content">
        <h1 className="chart-header-title">
          S&P 500 ETF (SPY)
        </h1>
        <p className="chart-header-subtitle">
         Real-time US market data & analytics
        </p>
      </div>
    </div>
  );
}