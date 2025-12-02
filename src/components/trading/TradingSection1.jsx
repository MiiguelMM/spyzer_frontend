import React, { useState, useEffect } from 'react';
import tradingService from '../../service/tradingService';
import userService from '../../service/userService';
import '../../css/TradingSection1.css';

export default function TradingSection1() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStock, setSelectedStock] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [stockPrice, setStockPrice] = useState(null);
  const [loadingPrice, setLoadingPrice] = useState(false);

  const categories = [
    'All',
    'ETF',
    'Tech',
    'Semiconductors',
    'Financial',
    'Fintech',
    'Health',
    'Consumer',
    'Energy',
    'Clean Energy',
    'Media',
    'Cloud/Security',
    'E-commerce',
    'Other'
  ];

  const stocks = {
    'ETF': [
      { symbol: 'SPY', name: 'S&P 500 ETF' },
      { symbol: 'QQQ', name: 'Nasdaq 100 ETF' },
      { symbol: 'DAX', name: 'DAX Index' },
      { symbol: 'FXI', name: 'iShares China Large-Cap ETF' },
      { symbol: 'IWM', name: 'Russell 2000 ETF' },
      { symbol: 'DIA', name: 'Dow Jones ETF' },
      { symbol: 'VTI', name: 'Total Stock Market ETF' },
      { symbol: 'XLF', name: 'Financial Sector ETF' },
      { symbol: 'XLK', name: 'Technology Sector ETF' },
      { symbol: 'XLE', name: 'Energy Sector ETF' },
      { symbol: 'ARKK', name: 'ARK Innovation ETF' },
      { symbol: 'TLT', name: 'iShares 20+ Year Treasury ETF' },
      { symbol: 'GLD', name: 'SPDR Gold Shares' },
      { symbol: 'SLV', name: 'iShares Silver Trust' },
      { symbol: 'XBI', name: 'SPDR S&P Biotech ETF' },
      { symbol: 'IBB', name: 'iShares Biotechnology ETF' },
      { symbol: 'XRT', name: 'SPDR S&P Retail ETF' },
      { symbol: 'XHB', name: 'SPDR S&P Homebuilders ETF' },
      { symbol: 'ITB', name: 'iShares U.S. Home Construction ETF' },
      { symbol: 'KRE', name: 'SPDR S&P Regional Banking ETF' }
    ],
    'Tech': [
      { symbol: 'AAPL', name: 'Apple Inc.' },
      { symbol: 'MSFT', name: 'Microsoft Corporation' },
      { symbol: 'GOOGL', name: 'Alphabet Inc.' },
      { symbol: 'AMZN', name: 'Amazon.com Inc.' },
      { symbol: 'META', name: 'Meta Platforms Inc.' },
      { symbol: 'TSLA', name: 'Tesla Inc.' },
      { symbol: 'NVDA', name: 'NVIDIA Corporation' },
      { symbol: 'NFLX', name: 'Netflix Inc.' },
      { symbol: 'ORCL', name: 'Oracle Corporation' },
      { symbol: 'CRM', name: 'Salesforce Inc.' },
      { symbol: 'ADBE', name: 'Adobe Inc.' },
      { symbol: 'CSCO', name: 'Cisco Systems Inc.' },
      { symbol: 'INTC', name: 'Intel Corporation' },
      { symbol: 'AMD', name: 'Advanced Micro Devices' },
      { symbol: 'QCOM', name: 'Qualcomm Inc.' }
    ],
    'Semiconductors': [
      { symbol: 'NVDA', name: 'NVIDIA Corporation' },
      { symbol: 'AMD', name: 'Advanced Micro Devices' },
      { symbol: 'TSM', name: 'Taiwan Semiconductor' },
      { symbol: 'ASML', name: 'ASML Holding' },
      { symbol: 'INTC', name: 'Intel Corporation' },
      { symbol: 'QCOM', name: 'Qualcomm Inc.' },
      { symbol: 'SMH', name: 'VanEck Semiconductor ETF' },
      { symbol: 'SOXX', name: 'iShares Semiconductor ETF' }
    ],
    'Financial': [
      { symbol: 'JPM', name: 'JPMorgan Chase & Co.' },
      { symbol: 'V', name: 'Visa Inc.' },
      { symbol: 'MA', name: 'Mastercard Inc.' },
      { symbol: 'WFC', name: 'Wells Fargo & Company' },
      { symbol: 'GS', name: 'Goldman Sachs Group' }
    ],
    'Fintech': [
      { symbol: 'PYPL', name: 'PayPal Holdings Inc.' },
      { symbol: 'SQ', name: 'Block Inc. (Square)' },
      { symbol: 'COIN', name: 'Coinbase Global Inc.' },
      { symbol: 'V', name: 'Visa Inc.' },
      { symbol: 'MA', name: 'Mastercard Inc.' }
    ],
    'Health': [
      { symbol: 'JNJ', name: 'Johnson & Johnson' },
      { symbol: 'PFE', name: 'Pfizer Inc.' },
      { symbol: 'UNH', name: 'UnitedHealth Group' },
      { symbol: 'ABT', name: 'Abbott Laboratories' },
      { symbol: 'TMO', name: 'Thermo Fisher Scientific' },
      { symbol: 'NVO', name: 'Novo Nordisk' }
    ],
    'Consumer': [
      { symbol: 'WMT', name: 'Walmart Inc.' },
      { symbol: 'HD', name: 'Home Depot Inc.' },
      { symbol: 'MCD', name: 'McDonald\'s Corporation' },
      { symbol: 'NKE', name: 'Nike Inc.' },
      { symbol: 'SBUX', name: 'Starbucks Corporation' },
      { symbol: 'KO', name: 'Coca-Cola Company' },
      { symbol: 'PG', name: 'Procter & Gamble' }
    ],
    'Energy': [
      { symbol: 'XOM', name: 'Exxon Mobil Corporation' },
      { symbol: 'CVX', name: 'Chevron Corporation' },
      { symbol: 'COP', name: 'ConocoPhillips' }
    ],
    'Clean Energy': [
      { symbol: 'TAN', name: 'Invesco Solar ETF' },
      { symbol: 'ICLN', name: 'iShares Global Clean Energy ETF' },
      { symbol: 'TSLA', name: 'Tesla Inc.' }
    ],
    'Media': [
      { symbol: 'DIS', name: 'Walt Disney Company' },
      { symbol: 'CMCSA', name: 'Comcast Corporation' },
      { symbol: 'NFLX', name: 'Netflix Inc.' },
      { symbol: 'SPOT', name: 'Spotify Technology' },
      { symbol: 'ROKU', name: 'Roku Inc.' }
    ],
    'Cloud/Security': [
      { symbol: 'NET', name: 'Cloudflare Inc.' },
      { symbol: 'CRWD', name: 'CrowdStrike Holdings' },
      { symbol: 'ZS', name: 'Zscaler Inc.' },
      { symbol: 'CRM', name: 'Salesforce Inc.' },
      { symbol: 'ORCL', name: 'Oracle Corporation' }
    ],
    'E-commerce': [
      { symbol: 'AMZN', name: 'Amazon.com Inc.' },
      { symbol: 'SHOP', name: 'Shopify Inc.' },
      { symbol: 'BABA', name: 'Alibaba Group' },
      { symbol: 'UBER', name: 'Uber Technologies' },
      { symbol: 'LYFT', name: 'Lyft Inc.' }
    ],
    'Other': [
      { symbol: 'BABA', name: 'Alibaba Group' },
      { symbol: 'TSM', name: 'Taiwan Semiconductor' },
      { symbol: 'ASML', name: 'ASML Holding' }
    ]
  };

  const getAllStocks = () => {
    const allStocks = Object.values(stocks).flat();
    const uniqueStocks = allStocks.filter((stock, index, self) =>
      index === self.findIndex((s) => s.symbol === stock.symbol)
    );
    return uniqueStocks;
  };

  const getFilteredStocks = () => {
    let filtered = selectedCategory === 'All' ? getAllStocks() : stocks[selectedCategory] || [];
    
    if (searchTerm) {
      filtered = filtered.filter(stock => 
        stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const fetchStockPrice = async (symbol) => {
    setLoadingPrice(true);
    try {
      const cotizacion = await tradingService.obtenerCotizacion({
        symbol,
        cantidad: 1,
        esCompra: true
      });
      setStockPrice(cotizacion.cotizacion);
    } catch (error) {
      console.error('Error fetching stock price:', error);
      setStockPrice(null);
    } finally {
      setLoadingPrice(false);
    }
  };

  const handleStockSelect = (stock) => {
    setSelectedStock(stock);
    setQuantity(1);
    setMessage({ type: '', text: '' });
    setStockPrice(null);
    fetchStockPrice(stock.symbol);
  };

  const handleCloseModal = () => {
    setSelectedStock(null);
    setStockPrice(null);
    setQuantity(1);
    setMessage({ type: '', text: '' });
  };

  const handleBuyStock = async () => {
    if (!selectedStock || quantity <= 0) {
      setMessage({ type: 'error', text: 'Please select a stock and valid quantity' });
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const usuario = userService.obtenerUsuarioSesion();
      
      if (!usuario) {
        setMessage({ type: 'error', text: 'Please log in to buy stocks' });
        setIsLoading(false);
        return;
      }

      const result = await tradingService.crearOrdenCompra(
        usuario.id,
        selectedStock.symbol,
        quantity,
        true
      );

      setMessage({ 
        type: 'success', 
        text: `Successfully bought ${quantity} shares of ${selectedStock.symbol}!` 
      });
      
      setTimeout(() => {
        handleCloseModal();
      }, 2000);
      
    } catch (error) {
      console.error('Error buying stock:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to buy stock. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const getTotalCost = () => {
    if (!stockPrice) return 0;
    return stockPrice * quantity;
  };

  return (
    <div className="trading-section1-container">
    <div className="portfolio-section3">
      <div className="section3-header">
        <h2 className="section3-title">Buy Stocks</h2>
        <p className="section3-subtitle">Select a category and choose stocks to invest</p>
      </div>

      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search by symbol or name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="category-filters">
        {categories.map(category => (
          <button
            key={category}
            className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="stocks-grid">
        {getFilteredStocks().map(stock => (
          <div
            key={stock.symbol}
            className="stock-card"
            onClick={() => handleStockSelect(stock)}
          >
            <div className="stock-symbol">{stock.symbol}</div>
            <div className="stock-name">{stock.name}</div>
          </div>
        ))}
      </div>

      {getFilteredStocks().length === 0 && (
        <div className="no-results">
          <p>No stocks found matching your criteria</p>
        </div>
      )}

      {selectedStock && (
        <>
          <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-buy" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseModal}>✕</button>
            
            <div className="modal-header">
              <h3 className="modal-title">{selectedStock.symbol}</h3>
              <p className="modal-subtitle">{selectedStock.name}</p>
            </div>

            <div className="modal-price">
              {loadingPrice ? (
                <div className="price-loading">
                  <div className="loading-spinner-small"></div>
                  <span>Loading price...</span>
                </div>
              ) : stockPrice ? (
                <>
                  <div className="price-label">Current Price</div>
                  <div className="price-value">${formatCurrency(stockPrice)}</div>
                </>
              ) : (
                <div className="price-error">Price unavailable</div>
              )}
            </div>

            <div className="modal-controls">
              <div className="quantity-control">
                <label className="quantity-label">Quantity:</label>
                <div className="quantity-input-group">
                  <button
                    className="quantity-btn"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={isLoading}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    className="quantity-input"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    disabled={isLoading}
                  />
                  <button
                    className="quantity-btn"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={isLoading}
                  >
                    +
                  </button>
                </div>
              </div>

              {stockPrice && (
                <div className="total-cost">
                  <span className="total-label">Total Cost:</span>
                  <span className="total-value">${formatCurrency(getTotalCost())}</span>
                </div>
              )}

              <button
                className="modal-buy-btn"
                onClick={handleBuyStock}
                disabled={isLoading || !stockPrice}
              >
                {isLoading ? 'Processing...' : `Buy ${quantity} Share${quantity > 1 ? 's' : ''}`}
              </button>

              {message.text && (
                <div className={`message ${message.type}`}>
                  {message.text}
                </div>
              )}
            </div>
          </div>
          </div>
        </>
      )}
    </div>
    </div>
  );
}