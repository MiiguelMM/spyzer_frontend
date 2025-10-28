// DaxRangeSwitcherChart.jsx - DAX usando datos reales del backend
import { createChart, AreaSeries, LineSeries, CandlestickSeries } from 'lightweight-charts';
import React, { useEffect, useRef, useState } from 'react';
import { useDAX } from '../../context/IndicesProvider';
import '../../../css/RangeSwitcherChart.css';

export default function DaxRangeSwitcherChart() {
  const chartContainerRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const seriesRef = useRef(null);
  const [selectedRange, setSelectedRange] = useState('1year');
  const [selectedChartType, setSelectedChartType] = useState('area');

  const {
    historicalData,
    isLoading,
    hasError,
    error,
    marketInfo,
    currentPrice
  } = useDAX();

  const chartTypes = [
    { label: 'Area', value: 'area', description: 'Gráfico de área suave' },
    { label: 'Line', value: 'line', description: 'Gráfico de línea simple' },
    { label: 'Candles', value: 'candlestick', description: 'Gráfico de velas japonesas' }
  ];

  const intervalColors = {
    '3dias': {
      lineColor: marketInfo?.colors.primary || '#00B8D4',
      topColor: `rgba(0, 184, 212, 0.7)`,
      bottomColor: 'rgba(0, 0, 0, 0.05)'
    },
    '1semana': {
      lineColor: marketInfo?.colors.primary || '#00B8D4',
      topColor: `rgba(0, 184, 212, 0.7)`,
      bottomColor: 'rgba(0, 0, 0, 0.05)'
    },
    '1mes': {
      lineColor: marketInfo?.colors.primary || '#00B8D4',
      topColor: `rgba(0, 184, 212, 0.7)`,
      bottomColor: 'rgba(0, 0, 0, 0.05)'
    },
    '3meses': {
      lineColor: marketInfo?.colors.primary || '#00B8D4',
      topColor: `rgba(0, 184, 212, 0.7)`,
      bottomColor: 'rgba(0, 0, 0, 0.05)'
    },
    '6meses': {
      lineColor: marketInfo?.colors.primary || '#00B8D4',
      topColor: `rgba(0, 184, 212, 0.7)`,
      bottomColor: 'rgba(0, 0, 0, 0.05)'
    },
    '1year': {
      lineColor: marketInfo?.colors.primary || '#00B8D4',
      topColor: `rgba(0, 184, 212, 0.7)`,
      bottomColor: 'rgba(0, 0, 0, 0.05)'
    },
    'todos': {
      lineColor: marketInfo?.colors.primary || '#00B8D4',
      topColor: `rgba(0, 184, 212, 0.7)`,
      bottomColor: 'rgba(0, 0, 0, 0.05)'
    },
  };

  const timeRanges = [
    { label: '3D', value: '3dias', days: 3 },
    { label: '1W', value: '1semana', days: 7 },
    { label: '1M', value: '1mes', days: 30 },
    { label: '3M', value: '3meses', days: 90 },
    { label: '6M', value: '6meses', days: 180 },
    { label: '1Y', value: '1year', days: 365 },
    { label: 'MAX', value: 'todos', days: 730 },
  ];

  const getFilteredData = (range) => {
    if (!historicalData || historicalData.length === 0) {
      return [];
    }

    // Fecha actual en segundos
    const nowTimestamp = Math.floor(Date.now() / 1000);
    
    let filteredData;

    if (range.value === 'todos') {
      filteredData = [...historicalData];
    } else {
      // Determinar si usar días de mercado o días calendario
      let useMarketDays = false;
      let marketDaysToShow;
      let daysToSubtract;
      
      switch (range.value) {
        case '3dias':
          useMarketDays = true;
          marketDaysToShow = 3; // 3 días de trading
          break;
        case '1semana':
          useMarketDays = true;
          marketDaysToShow = 5; // 1 semana laboral = 5 días de mercado
          break;
        case '1mes':
          daysToSubtract = 30;
          break;
        case '3meses':
          daysToSubtract = 90;
          break;
        case '6meses':
          daysToSubtract = 180;
          break;
        case '1year':
          daysToSubtract = 365;
          break;
        default:
          daysToSubtract = 365;
      }

      if (useMarketDays) {
        // Filtrar por días de mercado únicos (para rangos cortos)
        const uniqueDays = [];
        const seenDates = new Set();
        
        // Recorrer desde el final hacia atrás para encontrar N días únicos
        for (let i = historicalData.length - 1; i >= 0 && uniqueDays.length < marketDaysToShow; i--) {
          const dateStr = new Date(historicalData[i].time * 1000).toDateString();
          
          if (!seenDates.has(dateStr)) {
            seenDates.add(dateStr);
            uniqueDays.unshift(dateStr); // Añadir al principio para mantener orden
          }
        }
        
        // Filtrar todos los puntos que pertenezcan a esos días de mercado
        filteredData = historicalData.filter(item => {
          const itemDate = new Date(item.time * 1000).toDateString();
          return uniqueDays.includes(itemDate);
        });
      } else {
        // Timestamp de inicio (fecha actual - días calendario)
        const startTimestamp = nowTimestamp - (daysToSubtract * 24 * 60 * 60);
        
        // Filtrar por fecha real - obtiene TODOS los puntos en ese rango
        filteredData = historicalData.filter(item => item.time >= startTimestamp);
      }
    }

    // Agregar precio actual si existe
    if (currentPrice !== undefined && currentPrice !== null) {
      const lastPoint = filteredData[filteredData.length - 1];
      
      if (!lastPoint || lastPoint.close !== currentPrice) {
        filteredData.push({
          time: nowTimestamp,
          value: currentPrice,
          open: lastPoint ? lastPoint.close : currentPrice,
          high: currentPrice,
          low: currentPrice,
          close: currentPrice
        });
      }
    }
    
    // =========================================================
    // 🔑 LA SOLUCIÓN: ORDENAR Y FILTRAR DUPLICADOS
    // Esto previene el error 'data must be asc ordered by time'
    // =========================================================
    
    // 1. Asegurar orden ascendente por tiempo (del más antiguo al más reciente)
    filteredData.sort((a, b) => a.time - b.time); 
    
    // 2. Filtrar entradas con el mismo timestamp consecutivo
    const uniqueData = filteredData.filter((item, index, self) => 
      index === 0 || item.time !== self[index - 1].time
    );

    return uniqueData; // Devolvemos el array ordenado y sin duplicados por tiempo
  };

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
          upColor: marketInfo?.colors.positive || '#00FF85',
          downColor: marketInfo?.colors.negative || '#FF4D4F',
          borderVisible: false,
          wickUpColor: marketInfo?.colors.positive || '#00FF85',
          wickDownColor: marketInfo?.colors.negative || '#FF4D4F',
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
        // Usamos item.value o item.close como fallback para gráficos de línea/área
        chartData = priceData.map(item => ({
          time: item.time,
          value: item.value || item.close
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

  const handleRangeChange = (rangeValue) => {
    if (selectedRange === rangeValue || isLoading) return;
    setSelectedRange(rangeValue);
    setChartInterval(rangeValue);
  };

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
            value: item.value || item.close
          }));
        }

        newSeries.setData(chartData);
        chartInstanceRef.current.timeScale().fitContent();
      }
    }
  };

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
        horzTouchDrag: true,
        vertTouchDrag: false,
      },
      handleScale: {
        axisPressedMouseMove: {
          time: true,
          price: false,
        },
        mouseWheel: true,
        pinch: true,
      },
      crosshair: {
        mode: 1,
        vertLine: {
          width: 1,
          color: intervalColors[selectedRange].lineColor, // Usa el color funcional del mercado
          style: 3,
          labelBackgroundColor: intervalColors[selectedRange].lineColor,
        },
        horzLine: {
          width: 1,
          color: intervalColors[selectedRange].lineColor,
          style: 3,
          labelBackgroundColor: intervalColors[selectedRange].lineColor,
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
            value: item.value || item.close
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
            <span className="loading-text">🇩🇪 Loading {marketInfo?.name} data...</span>
          </div>
        )}
        {hasError && (
          <div className="error-container">
            <span>⚠️ Error loading data: {error}</span>
            <button onClick={() => window.location.reload()}>Retry</button>
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