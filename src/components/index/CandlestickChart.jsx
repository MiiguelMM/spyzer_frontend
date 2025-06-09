import React, { useEffect, useRef } from 'react';
import { createChart, CandlestickSeries } from 'lightweight-charts'; // Import directly from lightweight-charts if not using react-lightweight-charts wrapper

const CandlestickChart = () => {
  const chartContainerRef = useRef();
  const chartInstanceRef = useRef(null);
  const candlestickSeriesRef = useRef(null);

  // Sample data (your provided data)
  const data = [
    { open: 10, high: 10.63, low: 9.49, close: 9.55, time: 1642427876 },
    { open: 9.55, high: 10.30, low: 9.42, close: 9.94, time: 1642514276 },
    { open: 9.94, high: 10.17, low: 9.92, close: 9.78, time: 1642600676 },
    { open: 9.78, high: 10.59, low: 9.18, close: 9.51, time: 1642687076 },
    { open: 9.51, high: 10.46, low: 9.10, close: 10.17, time: 1642773476 },
    { open: 10.17, high: 10.96, low: 10.16, close: 10.47, time: 1642859876 },
    { open: 10.47, high: 11.39, low: 10.40, close: 10.81, time: 1642946276 },
    { open: 10.81, high: 11.60, low: 10.30, close: 10.75, time: 1643032676 },
    { open: 10.75, high: 11.60, low: 10.49, close: 10.93, time: 1643119076 },
    { open: 10.93, high: 11.53, low: 10.76, close: 10.96, time: 1643205476 }
  ];

  useEffect(() => {
    // Chart options
    const chartOptions = {
      layout: {
        textColor: 'black',
        background: {
          type: 'solid',
          color: 'white'
        }
      },
      width: chartContainerRef.current.clientWidth,
      height: 400, // You can make this dynamic
    };

    // Create chart
    const chart = createChart(chartContainerRef.current, chartOptions);
    chartInstanceRef.current = chart;

    // Add candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350'
    });
    candlestickSeriesRef.current = candlestickSeries;

    // Set data
    candlestickSeries.setData(data.map(item => ({
      ...item,
      time: item.time // Ensure time is in a format lightweight-charts expects (unix timestamp in seconds or string)
    })));

    // Fit content
    chart.timeScale().fitContent();

    // Handle resizing
    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current.clientWidth });
    };

    window.addEventListener('resize', handleResize);

    // Cleanup on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartInstanceRef.current) {
        chartInstanceRef.current.remove();
        chartInstanceRef.current = null;
      }
    };
  }, [data]); // Re-run effect if data changes

  return (
    <div ref={chartContainerRef} style={{ width: '100%', height: '400px' }}>
      {/* Chart will be rendered here */}
    </div>
  );
};

export default CandlestickChart;