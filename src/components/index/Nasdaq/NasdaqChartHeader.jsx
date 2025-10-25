// NasdaqChartHeader.jsx
import React from 'react';
import '../../../css/ChartHeader.css'; 

export default function NasdaqChartHeader() {
  return (
    <div className="chart-header">
      <div className="chart-header-content">
        <h1 className="chart-header-title">
          NASDAQ  ETF (QQQ)
        </h1>
        <p className="chart-header-subtitle">
          Real-time US technology data & analytics
        </p>
      </div>
    </div>
  );
}