// ChartHeader.jsx - Componente del Header
import React from 'react';
import '../../../css/ChartHeader.css'; 

export default function ChartHeader() {
  return (
    <div className="chart-header">
      <div className="chart-header-content">
        <h1 className="chart-header-title">
          S&P 500 Global by Spyzer
        </h1>
        <p className="chart-header-subtitle">
          Real-time market data & analytics
        </p>
      </div>
    </div>
  );
}