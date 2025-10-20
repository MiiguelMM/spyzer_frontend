import React, { useState, useEffect } from 'react';
import userService from '../../service/userService';
import portfolioService from '../../service/portfolioService';
import '../../css/PortfolioSection1.css';

export default function PortfolioHeader() {
  const [availableBalance, setAvailableBalance] = useState(0);
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPortfolioData = async () => {
      try {
        const usuario = userService.obtenerUsuarioSesion();
        
        if (usuario) {
          const balance = await userService.obtenerBalance(usuario.id);
          setAvailableBalance(balance);

          const valorTotal = await portfolioService.obtenerValorTotal(usuario.id);
          setPortfolioValue(valorTotal);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading portfolio data:', error);
        setIsLoading(false);
      }
    };

    loadPortfolioData();
  }, []);

  const formatCurrency = (value) => {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  return (
    <div className="portfolio-header-wrapper">
      {/* Available Balance Card */}
      <div className="portfolio-card">
        <h2 className="portfolio-card-label">Money Left</h2>
        {isLoading ? (
          <div className="portfolio-loading">
            <div className="loading-spinner"></div>
            <span className="loading-text">Loading...</span>
          </div>
        ) : (
          <div className="portfolio-value">
            <span className="portfolio-currency">$</span>
            <span className="portfolio-amount">{formatCurrency(availableBalance)}</span>
          </div>
        )}
      </div>

      {/* Portfolio Total Value Card */}
      <div className="portfolio-card">
        <h2 className="portfolio-card-label">Portfolio Total Value</h2>
        {isLoading ? (
          <div className="portfolio-loading">
            <div className="loading-spinner"></div>
            <span className="loading-text">Loading...</span>
          </div>
        ) : (
          <div className="portfolio-value">
            <span className="portfolio-currency">$</span>
            <span className="portfolio-amount">{formatCurrency(portfolioValue)}</span>
          </div>
        )}
      </div>
    </div>
  );
}