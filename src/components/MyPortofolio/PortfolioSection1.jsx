import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import portfolioService from '../../service/portfolioService';
import userService from '../../service/userService';
import '../../css/PortoflioSection2.css';

export default function PortfolioSection2() {
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);

  // Colores para el pie chart (siguiendo el design system)
  const COLORS = [
    '#007ACC', // S&P 500 - Azul
    '#FF6B35', // IBEX 35 - Naranja
    '#00D4AA', // NASDAQ - Verde
    '#FF4757', // VIX - Rojo
    '#00BFFF', // Azul claro
    '#FFB347', // Naranja claro
    '#4ECDC4', // Turquesa
    '#FF6B6B', // Rojo claro
    '#95E1D3', // Verde agua
    '#F38181', // Rosa
  ];

  useEffect(() => {
    const loadPortfolioData = async () => {
      try {
        const usuario = userService.obtenerUsuarioSesion();
        
        console.log('Usuario de sesión:', usuario); 
        
        if (usuario) {
          const posiciones = await portfolioService.obtenerPortfolioOrdenado(usuario.id);
          
          // Transformar datos para el pie chart
          const data = posiciones.map((posicion, index) => ({
            name: posicion.symbol,
            value: parseFloat(posicion.valorMercado || 0),
            percentage: 0, // Se calculará después
            color: COLORS[index % COLORS.length]
          }));

          // Calcular porcentajes
          const totalValue = data.reduce((sum, item) => sum + item.value, 0);
          const dataWithPercentages = data.map(item => ({
            ...item,
            percentage: totalValue > 0 ? ((item.value / totalValue) * 100).toFixed(2) : 0
          }));

          setChartData(dataWithPercentages);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading portfolio data:', error);
        setError('Failed to load portfolio data');
        setIsLoading(false);
      }
    };

    loadPortfolioData();
  }, []);

  const formatCurrency = (value) => {
    return `$${value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="tooltip-symbol">{data.name}</p>
          <p className="tooltip-value">{formatCurrency(data.value)}</p>
          <p className="tooltip-percentage">{data.percentage}%</p>
        </div>
      );
    }
    return null;
  };

  const renderLegend = (props) => {
    const { payload } = props;
    
    if (!payload || payload.length === 0) return null;
    
    // Mostrar solo top 5 o todas según el estado
    const displayData = showAll ? payload : payload.slice(0, 5);
    
    return (
      <div className="legend-wrapper">
        <div className="chart-legend">
          {displayData.map((entry, index) => {
            // Buscar el dato correspondiente en chartData por el nombre
            const dataItem = chartData.find(item => item.name === entry.value);
            return (
              <div key={`legend-${index}`} className="legend-item">
                <div 
                  className="legend-color" 
                  style={{ backgroundColor: entry.color }}
                ></div>
                <span className="legend-label">{entry.value}</span>
                <span className="legend-percentage">
                  {dataItem?.percentage || '0.00'}%
                </span>
              </div>
            );
          })}
        </div>
        
        {/* Botón Ver Más / Ver Menos */}
        {payload.length > 5 && (
          <button 
            className="show-more-button"
            onClick={(e) => {
              e.preventDefault();
              setShowAll(!showAll);
            }}
          >
            {showAll ? 'Ver menos' : `Ver más `}
          </button>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="portfolio-section2">
        <div className="section2-header">
          <h2 className="section2-title">Portfolio Distribution</h2>
        </div>
        <div className="section2-loading">
          <div className="loading-spinner"></div>
          <span className="loading-text">Loading portfolio...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="portfolio-section2">
        <div className="section2-header">
          <h2 className="section2-title">Portfolio Distribution</h2>
        </div>
        <div className="section2-error">
          <p className="error-text">{error}</p>
        </div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="portfolio-section2">
        <div className="section2-header">
          <h2 className="section2-title">Portfolio Distribution</h2>
        </div>
        <div className="section2-empty">
          <p className="empty-text">No positions in your portfolio yet</p>
          <p className="empty-subtext">Start investing to see your distribution</p>
        </div>
      </div>
    );
  }

  return (
    <div className="portfolio-section2">
      <div className="section2-header">
        <h2 className="section2-title">Portfolio Distribution</h2>
        <p className="section2-subtitle">{chartData.length} positions</p>
      </div>
      
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={500}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              innerRadius={60}
              fill="#8884d8"
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={renderLegend} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}