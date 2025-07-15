// ChartTypeSwitcher.jsx - Componente para cambiar tipos de gráfico
import React from 'react';
import '../../css/ChartTypeSwitcher.css'

export default function ChartTypeSwitcher({ 
  selectedChartType, 
  onChartTypeChange, 
  isLoading = false 
}) {
  // Tipos de gráfico disponibles
  const chartTypes = [
    { 
      label: 'Area', 
      value: 'area', 
      icon: '📈',
      description: 'Gráfico de área suave'
    },
    { 
      label: 'Line', 
      value: 'line', 
      icon: '📉',
      description: 'Gráfico de línea simple'
    },
    { 
      label: 'Candles', 
      value: 'candlestick', 
      icon: '🕯️',
      description: 'Gráfico de velas japonesas'
    }
  ];

  return (
    <div className="chart-type-switcher">
      {chartTypes.map((type) => (
        <button
          key={type.value}
          onClick={() => onChartTypeChange(type.value)}
          disabled={isLoading}
          className={`chart-type-button ${selectedChartType === type.value ? 'active' : ''}`}
          title={type.description}
        >
          <span className="chart-type-icon">{type.icon}</span>
          <span className="chart-type-label">{type.label}</span>
        </button>
      ))}
    </div>
  );
}