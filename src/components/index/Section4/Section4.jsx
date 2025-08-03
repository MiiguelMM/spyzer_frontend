// Section4.jsx - VIX usando DataDistributor
import React from 'react';
import '../../../css/Section4.css';
import VixChartHeader from '../VIX/VixChartHeader';
import VixRangeSwitcherChart from '../VIX/VixRangeSwitcherChart';
import VixMetricCards from '../VIX/VixMetricCards';


export default function Section4() {
  return (
    <div className='section4'>
      <VixChartHeader />
        <VixRangeSwitcherChart />
      <VixMetricCards />
    </div>
  );
}