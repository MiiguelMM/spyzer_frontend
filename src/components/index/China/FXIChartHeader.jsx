// FxiChartHeader.jsx
import React from 'react';
import '../../../css/ChartHeader.css'; 

export default function FxiChartHeader() {
  return (
    <div className="chart-header">
      <div className="chart-header-content">
        <h1 className="chart-header-title">
          FXI - China Large-Cap ETF
        </h1>
        <p className="chart-header-subtitle">
          Real-time Chinese market data & analytics
        </p>
      </div>
    </div>
  );
}