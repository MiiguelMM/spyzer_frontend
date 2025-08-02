import { ColorType, createChart, AreaSeries, LineSeries, CandlestickSeries } from 'lightweight-charts';
import React, { useEffect, useRef, useState } from 'react';
import '../../../css/RangeSwitcherChart.css';

export default function RangeSwitcherChart({ onDataUpdate }) {
  const chartContainerRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const seriesRef = useRef(null);
  const [selectedRange, setSelectedRange] = useState('1año');
  const [selectedChartType, setSelectedChartType] = useState('area');
  const [historicalData, setHistoricalData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Chart types configuration
  const chartTypes = [
    {
      label: 'Area',
      value: 'area',
      description: 'Gráfico de área suave'
    },
    {
      label: 'Line',
      value: 'line',
      description: 'Gráfico de línea simple'
    },
    {
      label: 'Candles',
      value: 'candlestick',
      description: 'Gráfico de velas japonesas'
    }
  ];

  // 🎨 Color palettes updated for dark mode
  const intervalColors = {
    '1dia': {
      lineColor: '#007ACC',
      topColor: 'rgba(0, 122, 204, 0.7)',
      bottomColor: 'rgba(0, 0, 0, 0.05)'
    },
    '1semana': {
     lineColor: '#007ACC',
      topColor: 'rgba(0, 122, 204, 0.7)',
      bottomColor: 'rgba(0, 0, 0, 0.05)'
    },
    '1mes': {
     lineColor: '#007ACC',
      topColor: 'rgba(0, 122, 204, 0.7)',
      bottomColor: 'rgba(0, 0, 0, 0.05)'
    },
    '3meses': {
      lineColor: '#007ACC',
      topColor: 'rgba(0, 122, 204, 0.7)',
      bottomColor: 'rgba(0, 0, 0, 0.05)'
    },
    '6meses': {
      lineColor: '#007ACC',
      topColor: 'rgba(0, 122, 204, 0.7)',
      bottomColor: 'rgba(0, 0, 0, 0.05)'
    },
    '1año': {
      lineColor: '#007ACC',
      topColor: 'rgba(0, 122, 204, 0.7)',
      bottomColor: 'rgba(0, 0, 0, 0.05)'
    },
    'todos': {
      lineColor: '#007ACC',
      topColor: 'rgba(0, 122, 204, 0.7)',
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

  // Enhanced data generation with realistic patterns
  const generateSimulatedData = () => {
    const data = [];
    let price = 320 + Math.random() * 100; // Base price between 320-420

    for (let i = 799; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      // Add trend and volatility
      const trend = Math.sin(i / 50) * 2; // Long-term trend
      const volatility = (Math.random() - 0.5) * 15; // Daily volatility
      const momentum = Math.sin(i / 10) * 5; // Medium-term momentum

      price = Math.max(50, price + trend + volatility + momentum);

      const timeString = date.toISOString().split('T')[0];

      // Generate OHLC data for candlesticks
      const open = price;
      const close = price + (Math.random() - 0.5) * 8;
      const high = Math.max(open, close) + Math.random() * 5;
      const low = Math.min(open, close) - Math.random() * 5;

      data.push({
        time: timeString,
        value: Number(close.toFixed(2)),
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        close: Number(close.toFixed(2))
      });

      price = close; // Update price for next iteration
    }

    return data;
  };

  // Load data
  useEffect(() => {
    setIsLoading(true);

    setTimeout(() => {
      const simulatedData = generateSimulatedData();
      setHistoricalData(simulatedData);

      if (onDataUpdate) {
        onDataUpdate(simulatedData);
      }

      setIsLoading(false);
    }, 800);
  }, [onDataUpdate]);

  // Enhanced data filtering
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

        const variance = lastDayData.value * 0.003;
        const change = (Math.random() - 0.5) * variance;
        const hourlyVolatility = Math.sin(h / 4) * 2; // Intraday pattern
        const value = lastDayData.value + change + hourlyVolatility;

        hourlyData.push({
          time: Math.floor(hourDate.getTime() / 1000),
          value: Number(value.toFixed(2)),
          open: Number(value.toFixed(2)),
          high: Number((value + Math.random() * 2).toFixed(2)),
          low: Number((value - Math.random() * 2).toFixed(2)),
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
          // Colores actualizados para modo oscuro
          upColor: '#00FF85', // Verde brillante para datos positivos
          downColor: '#FF4D4F', // Rojo vibrante para datos negativos
          borderVisible: false,
          wickUpColor: '#00FF85',
          wickDownColor: '#FF4D4F',
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

  // Chart update with smooth color transitions
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

      // Prepare data based on chart type
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

      // Update colors for area and line charts
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

    // Recreate the chart with new series type
    if (chartInstanceRef.current && historicalData) {
      // Remove old series
      if (seriesRef.current) {
        chartInstanceRef.current.removeSeries(seriesRef.current);
      }

      // Create new series
      const newSeries = createSeriesForType(chartInstanceRef.current, chartType);
      seriesRef.current = newSeries;

      // Load data for current range
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

  // Chart initialization
  useEffect(() => {
    if (!chartContainerRef.current) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.remove();
      chartInstanceRef.current = null;
      seriesRef.current = null;
    }

    const chartOptions = {
      layout: {
        // Colores actualizados para modo oscuro
        textColor: '#B0B0B0', // Texto secundario
        background: {
          type: 'solid',
          color: '#181818' // Fondo de tarjeta de información
        },
        fontSize: 11,
        fontFamily: 'Satoshi, Arial, sans-serif',
      },
      width: 0,
      height: 0,
      grid: {
        vertLines: {
          color: 'rgba(255, 255, 255, 0.05)', // Líneas de grid sutiles para modo oscuro
          style: 2,
          visible: true,
        },
        horzLines: {
          color: 'rgba(255, 255, 255, 0.05)', // Líneas de grid sutiles para modo oscuro
          style: 2,
          visible: true,
        },
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
        textColor: '#B0B0B0', // Texto secundario
        scaleMargins: { top: 0.08, bottom: 0.08 },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          width: 1,
          color: 'rgba(0, 191, 255, 0.8)', // Azul eléctrico
          style: 3,
          labelBackgroundColor: '#00BFFF', // Botón activo
        },
        horzLine: {
          width: 1,
          color: 'rgba(0, 191, 255, 0.8)', // Azul eléctrico
          style: 3,
          labelBackgroundColor: '#00BFFF', // Botón activo
        },
      },
    };

    const chart = createChart(chartContainerRef.current, chartOptions);
    chartInstanceRef.current = chart;

    // Create initial series
    const initialSeries = createSeriesForType(chart, selectedChartType);
    seriesRef.current = initialSeries;

    // Load initial data
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
  }, [historicalData]);

  // Update when range changes
  useEffect(() => {
    if (chartInstanceRef.current && historicalData) {
      setChartInterval(selectedRange);
    }
  }, [selectedRange, historicalData]);

  return (
    <div className="range-switcher-chart">

      {/* Range Switcher */}



      {/* Chart Container */}
      <div ref={chartContainerRef} className="chart-container">
        {isLoading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <span className="loading-text">🎲 Generating data...</span>
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