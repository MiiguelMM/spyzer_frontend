// Section2.jsx - IBEX 35 usando DataDistributor
import React from 'react';
import '../../../css/Section2.css';
import IbexChartHeader from '../Ibex35/IbexChartHeader';
import IbexRangeSwitcherChart from '../Ibex35/IbexRangeSwitcherChart';
import IbexMetricsCards from '../Ibex35/IbexMetricCards';

export default function Section2() {
  return (
    <div className='section2'>
      <IbexChartHeader />
      <IbexRangeSwitcherChart />
      <IbexMetricsCards />
    </div>
  );
}