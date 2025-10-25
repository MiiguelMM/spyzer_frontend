// Section2.jsx - IBEX 35 usando DataDistributor
import React from 'react';
import '../../../css/Section2.css';
import IbexChartHeader from '../China/FXIChartHeader';
import IbexRangeSwitcherChart from '../China/FXIRangeSwitcherChart';
import IbexMetricsCards from '../China/FXIMetricCards';

export default function Section2() {
  return (
    <div className='section2'>
      <IbexChartHeader />
      <IbexRangeSwitcherChart />
      <IbexMetricsCards />
    </div>
  );
}