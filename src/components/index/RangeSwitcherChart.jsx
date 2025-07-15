import { ColorType, createChart, AreaSeries, LineSeries, CandlestickSeries } from 'lightweight-charts';
import React, { useEffect, useRef, useState } from 'react';
import '../../css/RangeSwitcherChart.css';

export default function RangeSwitcherChart({ onDataUpdate, chartType = 'area' }) {
  const chartContainerRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const lineSeriesRef = useRef(null);
  const [selectedRange, setSelectedRange] = useState('1año');
  const [historicalData, setHistoricalData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Configuración de colores por intervalo (con relleno para área)
  const intervalColors = {
    '1dia': { 
      lineColor: '#2962FF', 
      topColor: 'rgba(41, 98, 255, 0.8)', 
      bottomColor: 'rgba(41, 98, 255, 0.1)' 
    },
    '1semana': { 
      lineColor: 'rgb(225, 87, 90)', 
      topColor: 'rgba(225, 87, 90, 0.8)', 
      bottomColor: 'rgba(225, 87, 90, 0.1)' 
    },
    '1mes': { 
      lineColor: 'rgb(242, 142, 44)', 
      topColor: 'rgba(242, 142, 44, 0.8)', 
      bottomColor: 'rgba(242, 142, 44, 0.1)' 
    },
    '3meses': { 
      lineColor: 'rgb(164, 89, 209)', 
      topColor: 'rgba(164, 89, 209, 0.8)', 
      bottomColor: 'rgba(164, 89, 209, 0.1)' 
    },
    '6meses': { 
      lineColor: '#6BB6E3', 
      topColor: 'rgba(107, 182, 227, 0.8)', 
      bottomColor: 'rgba(107, 182, 227, 0.1)' 
    },
    '1año': { 
      lineColor: 'rgb(164, 89, 209)', 
      topColor: 'rgba(164, 89, 209, 0.8)', 
      bottomColor: 'rgba(164, 89, 209, 0.1)' 
    },
    'todos': { 
      lineColor: '#2962FF', 
      topColor: 'rgba(41, 98, 255, 0.8)', 
      bottomColor: 'rgba(41, 98, 255, 0.1)' 
    },
  };

  // Configuración de rangos temporales
  const timeRanges = [
    { label: '1D', value: '1dia', days: 1 },
    { label: '1S', value: '1semana', days: 7 },
    { label: '1M', value: '1mes', days: 30 },
    { label: '3M', value: '3meses', days: 90 },
    { label: '6M', value: '6meses', days: 180 },
    { label: '1A', value: '1año', days: 365 },
    { label: 'ALL', value: 'todos', days: 730 },
  ];

  // Generar datos simulados
  const generateSimulatedData = () => {
    const data = [];
    let price = 450;
    
    for (let i = 799; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const change = (Math.random() - 0.5) * 10;
      price = price + change;
      
      const timeString = date.toISOString().split('T')[0];
      
      data.push({
        time: timeString,
        value: Number(price.toFixed(2))
      });
    }
    
    return data;
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    setIsLoading(true);
    const simulatedData = generateSimulatedData();
    setHistoricalData(simulatedData);
    
    // Pasar datos a las cards
    if (onDataUpdate) {
      onDataUpdate(simulatedData);
    }
    
    setIsLoading(false);
  }, [onDataUpdate]);

  // Filtrar datos según el rango
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
        
        const variance = lastDayData.value * 0.002;
        const change = (Math.random() - 0.5) * variance;
        const value = lastDayData.value + change;
        
        hourlyData.push({
          time: Math.floor(hourDate.getTime() / 1000),
          value: Number(value.toFixed(2))
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

  // Función para establecer intervalo del chart (similar al código original)
  const setChartInterval = (interval) => {
    if (!chartInstanceRef.current || !lineSeriesRef.current) return;
    
    try {
      const range = timeRanges.find(r => r.value === interval);
      if (!range) return;
      
      const priceData = getFilteredData(range);
      
      if (priceData.length === 0) {
        console.warn('No data available for range:', range.label);
        return;
      }
      
      lineSeriesRef.current.setData(priceData);
      lineSeriesRef.current.applyOptions({
        lineColor: intervalColors[interval].lineColor,
        topColor: intervalColors[interval].topColor,
        bottomColor: intervalColors[interval].bottomColor,
      });
      chartInstanceRef.current.timeScale().fitContent();
    } catch (error) {
      console.error('Error updating chart:', error);
    }
  };

  // Actualizar gráfico
  const updateChartRange = (range) => {
    if (!chartInstanceRef.current || !lineSeriesRef.current) return;
    
    try {
      const priceData = getFilteredData(range);
      
      if (priceData.length === 0) {
        console.warn('No data available for range:', range.label);
        return;
      }
      
      lineSeriesRef.current.setData(priceData);
      chartInstanceRef.current.timeScale().fitContent();
    } catch (error) {
      console.error('Error updating chart:', error);
    }
  };

  // Manejar cambio de rango
  const handleRangeChange = (rangeValue) => {
    setSelectedRange(rangeValue);
    setChartInterval(rangeValue);
  };

  useEffect(() => {
    if (!chartContainerRef.current) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.remove();
      chartInstanceRef.current = null;
      lineSeriesRef.current = null;
    }

    const chartOptions = {
      layout: {
        textColor: 'black',
        background: { type: 'solid', color: 'white' },
      },
      width: 0, // Se ajustará automáticamente al CSS
      height: 0, // Se ajustará automáticamente al CSS
      grid: {
        vertLines: { color: 'rgba(107, 182, 227, 0.06)', style: 2 },
        horzLines: { color: 'rgba(107, 182, 227, 0.06)', style: 2 },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderVisible: false,
        rightOffset: 10,
      },
      rightPriceScale: {
        visible: true,
        borderColor: 'rgba(107, 182, 227, 0.3)',
        textColor: 'black',
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          width: 1,
          color: 'rgba(126, 199, 236, 0.8)',
          style: 3,
          labelBackgroundColor: '#7EC7EC',
        },
        horzLine: {
          width: 1,
          color: 'rgba(126, 199, 236, 0.8)',
          style: 3,
          labelBackgroundColor: '#7EC7EC',
        },
      },
    };

    const chart = createChart(chartContainerRef.current, chartOptions);

    chartInstanceRef.current = chart;

    const areaSeries = chart.addSeries(AreaSeries, {
      lineColor: intervalColors[selectedRange].lineColor,
      topColor: intervalColors[selectedRange].topColor,
      bottomColor: intervalColors[selectedRange].bottomColor,
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: true,
    });

    lineSeriesRef.current = areaSeries;

    // Cargar datos iniciales si están disponibles
    if (historicalData && historicalData.length > 0) {
      const initialRange = timeRanges.find(r => r.value === selectedRange);
      const priceData = getFilteredData(initialRange);
      
      if (priceData.length > 0) {
        areaSeries.setData(priceData);
        areaSeries.applyOptions({
          lineColor: intervalColors[selectedRange].lineColor,
          topColor: intervalColors[selectedRange].topColor,
          bottomColor: intervalColors[selectedRange].bottomColor,
        });
        chart.timeScale().fitContent();
      }
    }

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.remove();
        chartInstanceRef.current = null;
        lineSeriesRef.current = null;
      }
    };
  }, [historicalData]);

  // Actualizar cuando cambie el rango
  useEffect(() => {
    if (chartInstanceRef.current && historicalData) {
      setChartInterval(selectedRange);
    }
  }, [selectedRange, historicalData]);

  return (
    <div className="range-switcher-chart">
      {/* Range Switcher Buttons */}
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

      {/* Chart Container */}
      <div ref={chartContainerRef} className="chart-container">
        {isLoading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            🎲 Generating data...
          </div>
        )}
      </div>
    </div>
  );
}