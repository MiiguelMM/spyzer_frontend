import { useState, useEffect } from 'react';
import portfolioService from '../../service/portfolioService';
import transactionService from '../../service/transactionService';
import userService from '../../service/userService';
import tradingService from '../../service/tradingService';
import '../../css/TradingSection2.css';

const TradingSection2 = () => {
  const [userId, setUserId] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  
  // States for selling
  const [sellAmount, setSellAmount] = useState('');
  const [isShowingSell, setIsShowingSell] = useState(false);
  const [isProcessingSell, setIsProcessingSell] = useState(false);

  useEffect(() => {
    const user = userService.obtenerUsuarioSesion(); // Assuming service names remain

    if (user) {
      setUserId(user.id);
    } else {
      console.error('No user in session');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchPortfolioData();
    }
  }, [userId]);

  const fetchPortfolioData = async () => {
    setLoading(true);
    try {
      const positions = await portfolioService.obtenerPortfolioOrdenado(userId);
      
      // =================================================================
      // 🟢 START: Symbol Name Mapping (short and descriptive names)
      // =================================================================
      const SYMBOL_NAMES_MAP = {
        // Indices/Major ETFs
        'SPY': 'S&P 500 ETF (SPDR)',
        'QQQ': 'Nasdaq 100 ETF (Invesco)',
        'DAX': 'German Index (DAX)',
        'FXI': 'China Large-Cap ETF',

        // Mega Tech
        'AAPL': 'Apple',
        'MSFT': 'Microsoft',
        'GOOGL': 'Alphabet (Google)',
        'AMZN': 'Amazon',
        'META': 'Meta Platforms',
        'TSLA': 'Tesla',
        'NVDA': 'NVIDIA',
        'NFLX': 'Netflix',

        // Financials
        'JPM': 'JPMorgan Chase',
        'V': 'Visa',
        'MA': 'Mastercard',
        'WFC': 'Wells Fargo',
        'GS': 'Goldman Sachs',

        // Health
        'JNJ': 'Johnson & Johnson',
        'PFE': 'Pfizer',
        'UNH': 'UnitedHealth Group',
        'ABT': 'Abbott Labs',
        'TMO': 'Thermo Fisher Scientific',

        // Consumer
        'WMT': 'Walmart',
        'HD': 'Home Depot',
        'MCD': 'McDonald\'s',
        'NKE': 'Nike',
        'SBUX': 'Starbucks',
        'KO': 'Coca-Cola',
        'PG': 'P&G',

        // Energy
        'XOM': 'Exxon Mobil',
        'CVX': 'Chevron',
        'COP': 'ConocoPhillips',

        // Media
        'DIS': 'Disney',
        'CMCSA': 'Comcast',

        // Additional Tech
        'ORCL': 'Oracle',
        'CRM': 'Salesforce',
        'ADBE': 'Adobe',
        'CSCO': 'Cisco',
        'INTC': 'Intel',
        'AMD': 'AMD',
        'QCOM': 'Qualcomm',

        // Major ETFs
        'IWM': 'Russell 2000 ETF',
        'DIA': 'Dow Jones ETF (SPDR)',
        'VTI': 'Total Stock Mkt ETF (Vanguard)',
        'XLF': 'Financials ETF (SPDR)',
        'XLK': 'Technology ETF (SPDR)',
        'XLE': 'Energy ETF (SPDR)',

        // Other popular ones
        'BABA': 'Alibaba',
        'TSM': 'Taiwan Semi. (TSMC)',
        'NVO': 'Novo Nordisk',
        'ASML': 'ASML Holding'
      };
      // =================================================================
      // 🔴 END: Symbol Name Mapping
      // =================================================================

      console.log('Positions from backend:', positions);

      const positionsWithCalculations = positions.map(pos => {
        const amount = parseFloat(pos.cantidad) || 0;
        const averagePrice = parseFloat(pos.precioPromedio) || 0;
        const currentPrice = parseFloat(pos.precioActual) || 0;
        const marketValue = parseFloat(pos.valorMercado) || 0;
        const profitLoss = parseFloat(pos.gananciaPerdida) || 0;

        console.log(`${pos.symbol}:`, {
          averagePrice,
          currentPrice,
          profitLoss,
          'are they equal?': averagePrice === currentPrice
        });

        const profitPercentage = averagePrice > 0 
          ? ((currentPrice - averagePrice) / averagePrice) * 100 
          : 0;

        // Name assignment logic: 
        // 1. Use name from the map if it exists.
        // 2. If not, use the name from the backend (pos.nombre).
        // 3. As a last resort, use the symbol (pos.symbol).
        const nameDisplay = SYMBOL_NAMES_MAP[pos.symbol] || pos.nombre || pos.symbol;
        
        return {
          id: pos.id,
          symbol: pos.symbol,
          name: nameDisplay, // <-- Using the short/descriptive name!
          amount,
          averagePrice,
          currentPrice,
          marketValue,
          profitLoss,
          profitPercentage: parseFloat(profitPercentage.toFixed(2))
        };
      });

      const totalValue = positionsWithCalculations.reduce((sum, pos) => sum + pos.marketValue, 0);
      const totalProfitLoss = positionsWithCalculations.reduce((sum, pos) => sum + pos.profitLoss, 0);
      const totalCost = totalValue - totalProfitLoss;
      const profitLossPercentage = totalCost > 0 ? ((totalProfitLoss / totalCost) * 100) : 0;

      const currentMoney = await userService.obtenerBalance(userId); // Assuming this service name might remain

      const calculatedMetrics = {
        totalValue,
        totalProfitLoss,
        profitLossPercentage: parseFloat(profitLossPercentage.toFixed(2)),
        numberOfPositions: positionsWithCalculations.length,
        positionsWithGain: positionsWithCalculations.filter(p => p.profitLoss > 0).length,
        currentMoney,
        positionsWithLoss: positionsWithCalculations.filter(p => p.profitLoss < 0).length
      };

      console.log('Processed positions:', positionsWithCalculations);
      console.log('Calculated metrics:', calculatedMetrics);

      setPortfolio(positionsWithCalculations);
      setMetrics(calculatedMetrics);
    } catch (error) {
      console.error('Error loading portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePositionClick = async (position) => {
    if (selectedPosition?.symbol === position.symbol) {
      setSelectedPosition(null);
      setTransactions([]);
      setIsShowingSell(false);
      setSellAmount('');
      return;
    }

    setSelectedPosition(position);
    setIsShowingSell(false);
    setSellAmount('');
    setLoadingTransactions(true);

    try {
      const trans = await transactionService.obtenerPorSimbolo(userId, position.symbol); // Assuming this service name might remain
      setTransactions(trans);
    } catch (error) {
      console.error('Error loading transactions:', error);
      setTransactions([]);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const handleShowSell = () => {
    setIsShowingSell(!isShowingSell);
    setSellAmount('');
  };

  const handleSellShares = async () => {
    if (!sellAmount || sellAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (parseFloat(sellAmount) > selectedPosition.amount) {
      alert('You cannot sell more shares than you own');
      return;
    }

    const totalSale = parseFloat(sellAmount) * selectedPosition.currentPrice;
    const confirmation = window.confirm(
      `Confirm sale of ${sellAmount} shares of ${selectedPosition.symbol} at $${selectedPosition.currentPrice.toFixed(2)}?\n\n` +
      `Total to receive: $${totalSale.toFixed(2)}`
    );

    if (!confirmation) {
      return;
    }

    setIsProcessingSell(true);

    try {
      // Call trading service to sell shares
      const result = await tradingService.crearOrdenVenta( // Assuming this service name might remain
        userId,
        selectedPosition.symbol,
        parseFloat(sellAmount),
        true // validate before execution
      );

      console.log('Successful sale:', result);

      alert(`✓ Successful sale!\n\n${sellAmount} shares of ${selectedPosition.symbol}\nTotal: $${totalSale.toFixed(2)}`);

      // Reload portfolio data
      await fetchPortfolioData();

      // Reset sell state
      setIsShowingSell(false);
      setSellAmount('');
      setSelectedPosition(null);

    } catch (error) {
      console.error('Error selling shares:', error);

      // Show more specific error message
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Error processing the sale. Please try again.';

      alert(`✗ Sale Error\n\n${errorMessage}`);
    } finally {
      setIsProcessingSell(false);
    }
  };

  if (loading || !userId) {
    return (
      <div className="trading-section2-container">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="trading-section2-container">
      <div className="section2-header">
        <h2 className="section2-title">My Portfolio</h2>
        
        {metrics && (
          <div className="metricas-grid">
            <div className="metrica-item">
              <span className="metrica-label">Total Value</span>
              <p className="metrica-value">
                ${metrics.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
            
            <div className="metrica-item">
              <span className="metrica-label">Profit/Loss</span>
              <p className={`metrica-value ${metrics.totalProfitLoss >= 0 ? 'positive' : 'negative'}`}>
                {metrics.totalProfitLoss >= 0 ? '+' : ''}
                ${metrics.totalProfitLoss.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
            
            <div className="metrica-item">
              <span className="metrica-label">Return</span>
              <p className={`metrica-value ${metrics.profitLossPercentage >= 0 ? 'positive' : 'negative'}`}>
                {metrics.profitLossPercentage >= 0 ? '+' : ''}
                {metrics.profitLossPercentage}%
              </p>
            </div>
            
            <div className="metrica-item">
              <span className="metrica-label">Money Left</span>
              <p className="metrica-value">
              ${metrics.currentMoney.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="positions-list">
        {portfolio.length === 0 ? (
          <div className="empty-state">
            <p>You have no active positions in your portfolio</p>
          </div>
        ) : (
          portfolio.map((position, index) => (
            <div key={position.symbol} style={{ animationDelay: `${index * 0.05}s` }}>
              <div
                className={`position-card ${selectedPosition?.symbol === position.symbol ? 'selected' : ''}`}
                onClick={() => handlePositionClick(position)}
              >
                <div className="position-main">
                  <div className="position-info">
                    <div className="position-symbol-wrapper">
                      <span className="position-symbol">{position.symbol}</span>
                      <span className="position-nombre">{position.name}</span>
                    </div>
                    <div className="position-cantidad">
                      {position.amount} shares
                    </div>
                  </div>

                  <div className="position-values">
                    <div className="value-item">
                      <span className="value-label">Market Value</span>
                      <span className="value-amount">
                        ${position.marketValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="value-item">
                      <span className="value-label">P/L</span>
                      <span className={`value-amount ${position.profitLoss >= 0 ? 'positive' : 'negative'}`}>
                        {position.profitLoss >= 0 ? '+' : ''}
                        ${Math.abs(position.profitLoss).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        <span className="percentage">
                          ({position.profitPercentage >= 0 ? '+' : ''}{position.profitPercentage}%)
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {selectedPosition?.symbol === position.symbol && (
                  <div className="position-detail">
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="detail-label">Average Price</span>
                        <span className="detail-value">
                          ${position.averagePrice.toFixed(2)}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Current Price</span>
                        <span className="detail-value">
                          ${position.currentPrice.toFixed(2)}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Amount</span>
                        <span className="detail-value">{position.amount}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Total Investment</span>
                        <span className="detail-value">
                          ${(position.averagePrice * position.amount).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Sell Section */}
                    <div className="sell-section">
                      {!isShowingSell ? (
                        <button 
                          className="sell-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShowSell();
                          }}
                        >
                          SELL
                        </button>
                      ) : (
                        <div className="sell-form" onClick={(e) => e.stopPropagation()}>
                          <div className="sell-form-header">
                            <h4>Sell {position.symbol}</h4>
                            <span className="disponible">Available: {position.amount} shares</span>
                          </div>
                          
                          <div className="sell-input-group">
                            <label htmlFor="sellAmount">Amount to sell:</label>
                            <input
                              id="sellAmount"
                              type="number"
                              min="1"
                              max={position.amount}
                              value={sellAmount}
                              onChange={(e) => setSellAmount(e.target.value)}
                              placeholder="0"
                              className="sell-input"
                            />
                            <div className="quick-buttons">
                              <button onClick={(e) => { e.stopPropagation(); setSellAmount(Math.floor(position.amount * 0.25)); }}>25%</button>
                              <button onClick={(e) => { e.stopPropagation(); setSellAmount(Math.floor(position.amount * 0.5)); }}>50%</button>
                              <button onClick={(e) => { e.stopPropagation(); setSellAmount(Math.floor(position.amount * 0.75)); }}>75%</button>
                              <button onClick={(e) => { e.stopPropagation(); setSellAmount(position.amount); }}>100%</button>
                            </div>
                          </div>

                          {sellAmount > 0 && (
                            <div className="sell-summary">
                              <div className="summary-row">
                                <span>Current price:</span>
                                <span>${position.currentPrice.toFixed(2)}</span>
                              </div>
                              <div className="summary-row">
                                <span>Amount:</span>
                                <span>{sellAmount} shares</span>
                              </div>
                              <div className="summary-row total">
                                <span>Total to receive:</span>
                                <span>${(sellAmount * position.currentPrice).toFixed(2)}</span>
                              </div>
                            </div>
                          )}

                          <div className="sell-actions">
                            <button 
                              className="cancel-button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleShowSell();
                              }}
                              disabled={isProcessingSell}
                            >
                              Cancel
                            </button>
                            <button 
                              className="confirm-sell-button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSellShares();
                              }}
                              disabled={isProcessingSell || !sellAmount || sellAmount <= 0}
                            >
                              {isProcessingSell ? 'Processing...' : 'Confirm Sale'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="transactions-section">
                      <h3 className="transactions-title">Transaction History</h3>
                      
                      {loadingTransactions ? (
                        <div className="loading-spinner small" />
                      ) : transactions.length === 0 ? (
                        <p className="no-transactions">No transactions</p>
                      ) : (
                        <div className="transactions-list">
                          {transactions.map((trans, idx) => (
                            <div key={idx} className="transaction-item">
                              <div className="transaction-header">
                                <span className={`transaction-type ${trans.tipo.toLowerCase()}`}>
                                  {trans.tipo === 'BUY' ? 'BUY' : 'SELL'}
                                </span>
                                <span className="transaction-date">
                                  {new Date(trans.timestamp || trans.fecha).toLocaleDateString('en-US', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                              <div className="transaction-details">
                                <span>{trans.cantidad} shares @ ${parseFloat(trans.precio).toFixed(2)}</span>
                                <span className="transaction-total">
                                  ${(parseFloat(trans.cantidad) * parseFloat(trans.precio)).toFixed(2)}
                                </span>
                              </div>
                              {trans.ejecutadaPor && (
                                <span className="transaction-executed">
                                  {trans.ejecutadaPor === 'MANUAL' ? 'Manual' : 'Bot'}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TradingSection2;