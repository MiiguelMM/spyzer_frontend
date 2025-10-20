
// VixChartHeader.jsx
import React from 'react';
import '../../../css/ChartHeader.css'; 

export default function VixChartHeader() {
  return (
    <div className="chart-header">
      <div className="chart-header-content">
        <h1 className="chart-header-title">
          DAX ETF 
        </h1>
        <p className="chart-header-subtitle">
          Real-time market data & analytics 
        </p>
      </div>
    </div>
  );
}