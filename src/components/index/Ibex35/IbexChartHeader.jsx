// IbexChartHeader.jsx
import React from 'react';
import '../../../css/ChartHeader.css'; 

export default function IbexChartHeader() {
  return (
    <div className="chart-header">
      <div className="chart-header-content">
        <h1 className="chart-header-title">
          IBEX 35 ETF 
        </h1>
        <p className="chart-header-subtitle">
          Real-time Spanish market data & analytics
        </p>
      </div>
    </div>
  );
}