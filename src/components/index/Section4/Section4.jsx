// Section4.jsx - VIX usando DataDistributor
import React from 'react';
import '../../../css/Section4.css';
import VixChartHeader from '../Dax/DaxChartHeader';
import VixRangeSwitcherChart from '../Dax/DaxRangeSwitcherChart';
import VixMetricCards from '../Dax/DaxMetricCards';


export default function Section4() {
  return (
    <div className='section4'>
      <VixChartHeader />
        <VixRangeSwitcherChart />
      <VixMetricCards />
    </div>
  );
}