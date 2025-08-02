// Section2.jsx - ARREGLADO con comunicación de datos
import React, { useState, useCallback } from 'react';
import '../../../css/Section2.css';
import IbexChartHeader from '../Ibex35/IbexChartHeader';
import IbexRangeSwitcherChart from '../Ibex35/IbexRangeSwitcherChart';
import IbexMetricsCards from '../Ibex35/IbexMetricCards';

export default function Section2() {
  const [chartType, setChartType] = useState('area');
  const [historicalData, setHistoricalData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);

  const handleChartTypeChange = (newType) => {
    setChartType(newType);
    console.log('Chart type changed to:', newType);
  };

  // Callback para recibir datos del chart
  const handleDataUpdate = useCallback((data, loading = false, error = null) => {
    setHistoricalData(data);
    setIsLoading(loading);
    setHasError(!!error);
    setError(error);
  }, []);

  return (
    <div className='section2'>
      <IbexChartHeader />
      <IbexRangeSwitcherChart 
        chartType={chartType} 
        onDataUpdate={handleDataUpdate}
      />
      <IbexMetricsCards 
        historicalData={historicalData}
        isLoading={isLoading}
        hasError={hasError}
        error={error}
      />
    </div>
  );
}