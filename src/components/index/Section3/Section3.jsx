// Section3.jsx - NASDAQ usando DataDistributor
import React from 'react';
import '../../../css/Section3.css';
import NasdaqChartHeader from '../Nasdaq/NasdaqChartHeader';
import NasdaqRangeSwitcherChart from '../Nasdaq/NasdaqRangeSwitcherChart';
import NasdaqMetricsCards from '../Nasdaq/NasdaqMetricsCards';


export default function Section3() {
  return (
    <div className='section3'>
      <NasdaqChartHeader />
     <NasdaqRangeSwitcherChart />
      <NasdaqMetricsCards />
    </div>
  );
}