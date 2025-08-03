// VixRangeSwitcherChart.jsx - VIX usando DataDistributor - FIXED VERSION
import { createChart, AreaSeries, LineSeries, CandlestickSeries } from 'lightweight-charts';
import React, { useEffect, useRef, useState } from 'react';
import { useVixData } from '../../SP500data/InternationalMarketsDistributor';
import '../../../css/RangeSwitcherChart.css';

export default function VixRangeSwitcherChart() {
  const chartContainerRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const seriesRef = useRef(null);
  const [selectedRange, setSelectedRange] = useState('1año');
  const [selectedChartType, setSelectedChartType] = useState('area');

  // Obtener datos del contexto centralizado para VIX
  const { 
    historicalData, 
    isLoading, 
    hasError, 
    error,
    marketInfo,
    refreshData 
  } = useVixData();

  // Chart types configuration
  const chartTypes = [
    { label: 'Area', value: 'area', description: 'Gráfico de área suave' },
    { label: 'Line', value: 'line', description: 'Gráfico de línea simple' },
    { label: 'Candles', value: 'candlestick', description: 'Gráfico de velas japonesas' }
  ];

  // 🎨 Color palettes usando configuración del mercado VIX (rojo fear)
  const intervalColors = {
    '1dia': {
      lineColor: marketInfo?.colors.primary || '#FF4757',
      topColor: `rgba(255, 71, 87, 0.7)`,
      bottomColor: 'rgba(0, 0, 0, 0.05)'
    },
    '1semana': {
      lineColor: marketInfo?.colors.primary || '#FF4757',
      topColor: `rgba(255, 71, 87, 0.7)`,
      bottomColor: 'rgba(0, 0, 0, 0.05)'
    },
    '1mes': {
      lineColor: marketInfo?.colors.primary || '#FF4757',
      topColor: `rgba(255, 71, 87, 0.7)`,
      bottomColor: 'rgba(0, 0, 0, 0.05)'
    },
    '3meses': {
      lineColor: marketInfo?.colors.primary || '#FF4757',
      topColor: `rgba(255, 71, 87, 0.7)`,
      bottomColor: 'rgba(0, 0, 0, 0.05)'
    },
    '6meses': {
      lineColor: marketInfo?.colors.primary || '#FF4757',
      topColor: `rgba(255, 71, 87, 0.7)`,
      bottomColor: 'rgba(0, 0, 0, 0.05)'
    },
    '1año': {
      lineColor: marketInfo?.colors.primary || '#FF4757',
      topColor: `rgba(255, 71, 87, 0.7)`,
      bottomColor: 'rgba(0, 0, 0, 0.05)'
    },
    'todos': {
      lineColor: marketInfo?.colors.primary || '#FF4757',
      topColor: `rgba(255, 71, 87, 0.7)`,
      bottomColor: 'rgba(0, 0, 0, 0.05)'
    },
  };

  // Time ranges configuration
  const timeRanges = [
    { label: '1D', value: '1dia', days: 1 },
    { label: '1W', value: '1semana', days: 7 },
    { label: '1M', value: '1mes', days: 30 },
    { label: '3M', value: '3meses', days: 90 },
    { label: '6M', value: '6meses', days: 180 },
    { label: '1Y', value: '1año', days: 365 },
    { label: 'ALL', value: 'todos', days: 730 },
  ];

  // Enhanced data filtering para VIX
  const getFilteredData = (range) => {
    if (!historicalData || historicalData.length === 0) {
      return [];
    }

    if (range.value === '1dia') {
      const lastDayData = historicalData[historicalData.length - 1];
      const hourlyData = [];

      for (let h = 0; h < 24; h++) {
        const hourDate = new Date();
        hourDate.setHours(h, 0, 0, 0);

        const variance = lastDayData.value * 0.05; // Higher intraday variance para VIX
        const change = (Math.random() - 0.5) * variance;
        const hourlyVolatility = Math.sin(h / 6) * 0.5;
        const value = Math.max(0, lastDayData.value + change + hourlyVolatility);

        hourlyData.push({
          time: Math.floor(hourDate.getTime() / 1000),
          value: Number(value.toFixed(2)),
          open: Number(value.toFixed(2)),
          high: Number((value + Math.random() * 1).toFixed(2)),
          low: Number(Math.max(0, value - Math.random() * 1).toFixed(2)),
          close: Number(value.toFixed(2))
        });
      }

      return hourlyData;
    } else {
      let numDays;
      switch (range.value) {
        case '1semana': numDays = 7; break;
        case '1mes': numDays = 30; break;
        case '3meses': numDays = 90; break;
        case '6meses': numDays = 180; break;
        case '1año': numDays = 365; break;
        case 'todos':
        default: numDays = historicalData.length; break;
      }

      const startIndex = Math.max(0, historicalData.length - numDays);
      return historicalData.slice(startIndex);
    }
  };

  // Create series based on chart type
  const createSeriesForType = (chart, type) => {
    const colors = intervalColors[selectedRange];

    switch (type) {
      case 'line':
        return chart.addSeries(LineSeries, {
          color: colors.lineColor,
          lineWidth: 2.5,
          priceLineVisible: false,
          lastValueVisible: true,
          crosshairMarkerVisible: true,
          crosshairMarkerRadius: 5,
          crosshairMarkerBorderColor: colors.lineColor,
          crosshairMarkerBackgroundColor: colors.lineColor,
        });

      case 'candlestick':
        return chart.addSeries(CandlestickSeries, {
          // Para VIX: rojo cuando sube (más miedo), verde cuando baja (menos miedo)
          upColor: marketInfo?.colors.negative || '#FF4757',
          downColor: marketInfo?.colors.positive || '#2ED573',
          borderVisible: false,
          wickUpColor: marketInfo?.colors.negative || '#FF4757',
          wickDownColor: marketInfo?.colors.positive || '#2ED573',
          priceLineVisible: false,
          lastValueVisible: true,
        });

      case 'area':
      default:
        return chart.addSeries(AreaSeries, {
          lineColor: colors.lineColor,
          topColor: colors.topColor,
          bottomColor: colors.bottomColor,
          lineWidth: 2.5,
          priceLineVisible: false,
          lastValueVisible: true,
          crosshairMarkerVisible: true,
          crosshairMarkerRadius: 5,
          crosshairMarkerBorderColor: colors.lineColor,
          crosshairMarkerBackgroundColor: colors.lineColor,
        });
    }
  };

  // Chart update
  const setChartInterval = (interval) => {
    if (!chartInstanceRef.current || !seriesRef.current) return;

    try {
      const range = timeRanges.find(r => r.value === interval);
      if (!range) return;

      const priceData = getFilteredData(range);

      if (priceData.length === 0) {
        console.warn('No data available for range:', range.label);
        return;
      }

      let chartData;
      if (selectedChartType === 'candlestick') {
        chartData = priceData.map(item => ({
          time: item.time,
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close
        }));
      } else {
        chartData = priceData.map(item => ({
          time: item.time,
          value: item.value
        }));
      }

      seriesRef.current.setData(chartData);

      if (selectedChartType !== 'candlestick') {
        const colors = intervalColors[interval];

        if (selectedChartType === 'area') {
          seriesRef.current.applyOptions({
            lineColor: colors.lineColor,
            topColor: colors.topColor,
            bottomColor: colors.bottomColor,
          });
        } else if (selectedChartType === 'line') {
          seriesRef.current.applyOptions({
            color: colors.lineColor,
          });
        }
      }

      chartInstanceRef.current.timeScale().fitContent();

    } catch (error) {
      console.error('Error updating chart:', error);
    }
  };

  // Handle range change
  const handleRangeChange = (rangeValue) => {
    if (selectedRange === rangeValue || isLoading) return;
    setSelectedRange(rangeValue);
    setChartInterval(rangeValue);
  };

  // Handle chart type change
  const handleChartTypeChange = (chartType) => {
    if (selectedChartType === chartType || isLoading) return;

    setSelectedChartType(chartType);

    if (chartInstanceRef.current && historicalData) {
      if (seriesRef.current) {
        chartInstanceRef.current.removeSeries(seriesRef.current);
      }

      const newSeries = createSeriesForType(chartInstanceRef.current, chartType);
      seriesRef.current = newSeries;

      const currentRange = timeRanges.find(r => r.value === selectedRange);
      const priceData = getFilteredData(currentRange);

      if (priceData.length > 0) {
        let chartData;
        if (chartType === 'candlestick') {
          chartData = priceData.map(item => ({
            time: item.time,
            open: item.open,
            high: item.high,
            low: item.low,
            close: item.close
          }));
        } else {
          chartData = priceData.map(item => ({
            time: item.time,
            value: item.value
          }));
        }

        newSeries.setData(chartData);
        chartInstanceRef.current.timeScale().fitContent();
      }
    }
  };

  // Chart initialization - FIXED: Igual que S&P 500
  useEffect(() => {
    if (!chartContainerRef.current) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.remove();
      chartInstanceRef.current = null;
      seriesRef.current = null;
    }

    const chartOptions = {
      layout: {
        textColor: '#B0B0B0',
        background: { type: 'solid', color: '#181818' },
        fontSize: 11,
        fontFamily: 'Satoshi, Arial, sans-serif',
      },
      width: 0,
      height: 0,
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.05)', style: 2, visible: true },
        horzLines: { color: 'rgba(255, 255, 255, 0.05)', style: 2, visible: true },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderVisible: false,
        rightOffset: 15,
        leftOffset: 5,
        borderColor: 'rgba(255, 255, 255, 0.1)',
      },
      rightPriceScale: {
        visible: true,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        textColor: '#B0B0B0',
        scaleMargins: { top: 0.08, bottom: 0.08 },
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,   // ✅ Permite arrastrar horizontalmente
        vertTouchDrag: false,  // ❌ DESHABILITA arrastrar verticalmente
      },
      handleScale: {
        axisPressedMouseMove: {
          time: true,    // ✅ Permite zoom en eje X (tiempo)
          price: false,  // ❌ DESHABILITA zoom en eje Y (precio)
        },
        mouseWheel: true,
        pinch: true,
      },
      crosshair: {
        mode: 1,
        vertLine: {
          width: 1,
          color: `rgba(255, 71, 87, 0.8)`, // VIX Red
          style: 3,
          labelBackgroundColor: marketInfo?.colors.primary || '#FF4757',
        },
        horzLine: {
          width: 1,
          color: `rgba(255, 71, 87, 0.8)`, // VIX Red
          style: 3,
          labelBackgroundColor: marketInfo?.colors.primary || '#FF4757',
        },
      },
    };

    const chart = createChart(chartContainerRef.current, chartOptions);
    chartInstanceRef.current = chart;

    const initialSeries = createSeriesForType(chart, selectedChartType);
    seriesRef.current = initialSeries;

    if (historicalData && historicalData.length > 0) {
      const initialRange = timeRanges.find(r => r.value === selectedRange);
      const priceData = getFilteredData(initialRange);

      if (priceData.length > 0) {
        let chartData;
        if (selectedChartType === 'candlestick') {
          chartData = priceData.map(item => ({
            time: item.time,
            open: item.open,
            high: item.high,
            low: item.low,
            close: item.close
          }));
        } else {
          chartData = priceData.map(item => ({
            time: item.time,
            value: item.value
          }));
        }

        initialSeries.setData(chartData);
        chart.timeScale().fitContent();
      }
    }

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.remove();
        chartInstanceRef.current = null;
        seriesRef.current = null;
      }
    };
  }, [historicalData]); // ✅ FIXED: Solo historicalData como dependencia

  // Update when range changes
  useEffect(() => {
    if (chartInstanceRef.current && historicalData) {
      setChartInterval(selectedRange);
    }
  }, [selectedRange, historicalData]);

  return (
    <div className="range-switcher-chart">
      <div ref={chartContainerRef} className="chart-container">
        {isLoading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <span className="loading-text">😱 Loading {marketInfo?.name} data...</span>
          </div>
        )}
        {hasError && (
          <div className="error-container">
            <span>⚠️ Error loading data: {error}</span>
            <button onClick={refreshData}>Retry</button>
          </div>
        )}
      </div>

      <div className="range-switcher-header">
        {timeRanges.map((range) => (
          <button
            key={range.value}
            onClick={() => handleRangeChange(range.value)}
            disabled={isLoading}
            className={`range-button ${selectedRange === range.value ? 'active' : ''}`}
          >
            {range.label}
          </button>
        ))}
      </div>

      <div className="chart-type-switcher">
        {chartTypes.map((type) => (
          <button
            key={type.value}
            onClick={() => handleChartTypeChange(type.value)}
            disabled={isLoading}
            className={`chart-type-button ${selectedChartType === type.value ? 'active' : ''}`}
            title={type.description}
          >
            <span className="chart-type-label">{type.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}