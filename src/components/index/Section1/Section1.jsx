// Section1.jsx - S&P 500 usando DataDistributor
import React from 'react';
import '../../../css/Section1.css';
import RangeSwitcherChart from '../Sp500/RangeSwitcherChart';
import ChartHeader from '../Sp500/ChartHeader';
import MetricsCards from '../Sp500/MetricsCards';

export default function Section1() {
  return (
    <div className='section1'>
      <ChartHeader />
      <RangeSwitcherChart />
      <MetricsCards />
    </div>
  );
}