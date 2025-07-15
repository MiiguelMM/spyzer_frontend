// Section1.jsx - REFACTORIZADO PARA FLEXBOX

import React, { useState, useEffect, useRef } from 'react';
import '../../css/Section1.css';
import RangeSwitcherChart from './RangeSwitcherChart';
import ChartHeader from './ChartHeader';
import MetricsCards from './MetricsCards';
import ChartTypeSwitcher from './ChartTypeSwitcher';

export default function Section1() {
  const [chartType, setChartType] = useState('area'); // Estado para el tipo de chart

  const handleChartTypeChange = (newType) => {
    setChartType(newType);
    console.log('Chart type changed to:', newType); // Para debugging
  };

  return (
    <div className='section1'>
        
        <ChartHeader />
        
        <RangeSwitcherChart chartType={chartType} />
        
        <ChartTypeSwitcher 
          selectedChartType={chartType}
          onChartTypeChange={handleChartTypeChange}
          isLoading={false}
        />
        
        <MetricsCards />
       
    </div>
  );
}