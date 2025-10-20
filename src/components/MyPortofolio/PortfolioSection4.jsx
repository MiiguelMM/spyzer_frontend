import React, { useState, useEffect } from 'react';
import portfolioService from '../../service/portfolioService';
import userService from '../../service/userService';
import '../../css/PortfolioSection4.css';

const PortfolioSection4 = () => {
  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPortfolioData = async () => {
      // Obtener userId de la sesión
      const usuario = userService.obtenerUsuarioSesion();
      if (!usuario) {
        setError('User session not found');
        setLoading(false);
        return;
      }
      
      const userId = usuario.id;

      setLoading(true);
      setError(null);

      try {
        // Obtener datos del portfolio con métricas calculadas
        const data = await portfolioService.obtenerPortfolioConMetricas(userId);
        
        // Extraer métricas y top ganancias/pérdidas
        const { metricas, topGananciasPerdidas, posiciones } = data;

        // Encontrar mejor y peor posición
        const mejorPosicion = topGananciasPerdidas.ganancias[0] || null;
        const peorPosicion = topGananciasPerdidas.perdidas[0] || null;

        // Preparar datos para el componente
        const portfolioInfo = {
          gananciaPerdidaTotal: metricas.gananciaPerdidaTotal,
          porcentajeGananciaPerdida: metricas.porcentajeGananciaPerdida,
          numeroPosiciones: metricas.numeroPosiciones,
          posicionesConGanancia: metricas.posicionesConGanancia,
          posicionesConPerdida: metricas.posicionesConPerdida,
          valorTotal: metricas.valorTotal,
          costoTotal: metricas.costoTotal,
          mejorPosicion: mejorPosicion ? {
            symbol: mejorPosicion.symbol,
            ganancia: parseFloat(mejorPosicion.gananciaPerdida),
            porcentaje: mejorPosicion.porcentajeGanancia || 
              ((parseFloat(mejorPosicion.gananciaPerdida) / parseFloat(mejorPosicion.costoTotal || 1)) * 100)
          } : null,
          peorPosicion: peorPosicion ? {
            symbol: peorPosicion.symbol,
            perdida: parseFloat(peorPosicion.gananciaPerdida),
            porcentaje: peorPosicion.porcentajeGanancia || 
              ((parseFloat(peorPosicion.gananciaPerdida) / parseFloat(peorPosicion.costoTotal || 1)) * 100)
          } : null
        };

        setPortfolioData(portfolioInfo);
      } catch (err) {
        console.error('Error fetching portfolio data:', err);
        setError(err.message || 'Failed to load portfolio data');
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioData();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(Math.abs(value));
  };

  const formatPercentage = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="portfolio-section4">
        <div className="section4-loading">
          <div className="loading-spinner-large"></div>
          <span className="loading-text">Loading Performance Data...</span>
        </div>
      </div>
    );
  }

  if (error || !portfolioData) {
    return (
      <div className="portfolio-section4">
        <div className="section4-error">
          <p>{error || 'Unable to load portfolio performance data'}</p>
        </div>
      </div>
    );
  }

  const isGain = portfolioData.gananciaPerdidaTotal >= 0;
  const winRate = portfolioData.numeroPosiciones > 0 
    ? ((portfolioData.posicionesConGanancia / portfolioData.numeroPosiciones) * 100).toFixed(1)
    : 0;

  return (
    <div className="portfolio-section4">
      {/* Header */}
      <div className="section4-header">
        <h2 className="section4-title">Current Portfolio Performance</h2>
        <p className="section4-subtitle">Real-time analysis of your investments</p>
      </div>

      {/* Main Performance Card */}
      <div className={`performance-main ${isGain ? 'gain' : 'loss'}`}>
        <div className="performance-label">
          {isGain ? 'Total Gain' : 'Total Loss'}
        </div>
        <div className="performance-amount">
          {isGain ? '+' : '-'}{formatCurrency(portfolioData.gananciaPerdidaTotal)}
        </div>
        <div className="performance-percentage">
          {formatPercentage(portfolioData.porcentajeGananciaPerdida)}
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="stats-grid">
        {/* Win Rate */}
        <div className="stat-card">
          <div className="stat-icon-wrapper">
            <svg className="stat-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 3v18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 16l4-4 4 4 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-label">Win Rate</div>
            <div className="stat-value">{winRate}%</div>
            <div className="stat-detail">
              {portfolioData.posicionesConGanancia} of {portfolioData.numeroPosiciones} positions
            </div>
          </div>
        </div>

        {/* Best Performer */}
        {portfolioData.mejorPosicion ? (
          <div className="stat-card highlight-green">
            <div className="stat-icon-wrapper">
              <svg className="stat-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-label">Best Performer</div>
              <div className="stat-value">{portfolioData.mejorPosicion.symbol}</div>
              <div className="stat-detail">
                +{formatCurrency(portfolioData.mejorPosicion.ganancia)} 
                <span className="stat-percentage"> ({formatPercentage(portfolioData.mejorPosicion.porcentaje)})</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="stat-card">
            <div className="stat-icon-wrapper">
              <svg className="stat-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-label">Best Performer</div>
              <div className="stat-value">N/A</div>
              <div className="stat-detail">No winning positions yet</div>
            </div>
          </div>
        )}

        {/* Worst Performer */}
        {portfolioData.peorPosicion ? (
          <div className="stat-card highlight-red">
            <div className="stat-icon-wrapper">
              <svg className="stat-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 3v18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 8l4 4 4-4 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-label">Worst Performer</div>
              <div className="stat-value">{portfolioData.peorPosicion.symbol}</div>
              <div className="stat-detail">
                {formatCurrency(portfolioData.peorPosicion.perdida)} 
                <span className="stat-percentage"> ({formatPercentage(portfolioData.peorPosicion.porcentaje)})</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="stat-card">
            <div className="stat-icon-wrapper">
              <svg className="stat-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 3v18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 8l4 4 4-4 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-label">Worst Performer</div>
              <div className="stat-value">N/A</div>
              <div className="stat-detail">No losing positions</div>
            </div>
          </div>
        )}

        {/* Total Invested */}
        <div className="stat-card">
          <div className="stat-icon-wrapper">
            <svg className="stat-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Invested</div>
            <div className="stat-value">{formatCurrency(portfolioData.costoTotal)}</div>
            <div className="stat-detail">
              Current value: {formatCurrency(portfolioData.valorTotal)}
            </div>
          </div>
        </div>

        {/* Portfolio Diversity */}
        <div className="stat-card">
          <div className="stat-icon-wrapper">
            <svg className="stat-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-label">Portfolio Diversity</div>
            <div className="stat-value">{portfolioData.numeroPosiciones}</div>
            <div className="stat-detail">
              Active positions
            </div>
          </div>
        </div>

        {/* Profit Factor */}
        <div className="stat-card">
          <div className="stat-icon-wrapper">
            <svg className="stat-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-label">Profit Factor</div>
            <div className="stat-value">
              {portfolioData.posicionesConPerdida > 0 
                ? (portfolioData.posicionesConGanancia / portfolioData.posicionesConPerdida).toFixed(2)
                : (portfolioData.posicionesConGanancia > 0 ? portfolioData.posicionesConGanancia : 0).toFixed(2)}x
            </div>
            <div className="stat-detail">
              Wins vs Losses ratio
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioSection4;