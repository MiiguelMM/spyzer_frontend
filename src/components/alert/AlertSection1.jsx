import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  BarChart3, 
  Bell, 
  BellOff, 
  RotateCcw, 
  Trash2, 
  Plus,
  X,
  MessageSquare,
  Layers,
  CheckCircle2,
  AlertCircle,
  BellRing
} from 'lucide-react';
import alertService from '../../service/alertService';
import userService from '../../service/userService';
import stockService from '../../service/stockService';
import marketDataService from '../../service/marketDataService';
import '../../css/AlertSection1.css';

const AlertSection1 = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [symbolSearch, setSymbolSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [userId, setUserId] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [stocksData, setStocksData] = useState({});
  
  const [formData, setFormData] = useState({
    symbol: '',
    tipo: 'PRICE_UP',
    valorTrigger: '',
    mensajePersonalizado: ''
  });

  const SIMBOLOS_DISPONIBLES = stockService.POPULAR_STOCKS;

  const filteredSymbols = SIMBOLOS_DISPONIBLES.filter(symbol =>
    symbol.toLowerCase().includes(symbolSearch.toLowerCase())
  ).slice(0, 10);

  useEffect(() => {
    const loadUserAndAlerts = async () => {
      try {
        setLoading(true);
        const usuario = userService.obtenerUsuarioSesion();
        
        if (usuario) {
          setUserId(usuario.id);
          await loadAlerts(usuario.id);
        } else {
          console.error('No user in session');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error loading user and alerts:', error);
        setLoading(false);
      }
    };

    loadUserAndAlerts();
    loadPopularStocks();
  }, []);

  const loadPopularStocks = async () => {
    try {
      console.log('📦 Loading popular stocks...');
      const stocks = await stockService.obtenerAccionesPopulares();
      console.log('✅ Stocks loaded:', stocks);
      
      const stocksMap = {};
      stocks.forEach(stock => {
        stocksMap[stock.symbol] = stock;
      });
      setStocksData(stocksMap);
      console.log('💾 Stocks saved in state:', stocksMap);
    } catch (error) {
      console.error('Error loading popular stocks:', error);
    }
  };

  const loadAlerts = async (uid) => {
    try {
      setLoading(true);
      const data = await alertService.obtenerAlertas(uid);
      setAlerts(data);
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentPrice = async (symbol) => {
    console.log('🔍 Searching price for:', symbol);
    
    if (stocksData[symbol]) {
      console.log('✅ Price found in cache:', stocksData[symbol].precio);
      setCurrentPrice(stocksData[symbol].precio);
      return;
    }
    
    try {
      setLoadingPrice(true);
      setCurrentPrice(null);
      
      const data = await marketDataService.obtenerDatos(symbol);
      console.log('📊 Data received from API:', data);
      
      if (data && data.precio) {
        console.log('✅ Price found:', data.precio);
        setCurrentPrice(data.precio);
      } else {
        console.log('❌ No price in data');
      }
    } catch (error) {
      console.error('Error getting current price:', error);
      setCurrentPrice(null);
    } finally {
      setLoadingPrice(false);
    }
  };

  const handleCreateAlert = async () => {
    if (!userId) {
      alert('No user in session');
      return;
    }

    if (!SIMBOLOS_DISPONIBLES.includes(formData.symbol.toUpperCase())) {
      alert('The entered symbol is not valid. Please select one from the list.');
      return;
    }

    const validation = alertService.validarAlerta(formData);
    if (!validation.esValida) {
      alert(validation.errores.join('\n'));
      return;
    }

    try {
      await alertService.crearAlerta(userId, formData);
      setShowCreateModal(false);
      resetForm();
      loadAlerts(userId);
    } catch (error) {
      console.error('Error creating alert:', error);
      alert('Error creating alert');
    }
  };

  const handleSymbolSelect = async (symbol) => {
    setFormData({...formData, symbol: symbol});
    setSymbolSearch(symbol);
    setShowSuggestions(false);
    await fetchCurrentPrice(symbol);
  };

  useEffect(() => {
    if (formData.symbol && formData.valorTrigger && formData.tipo) {
      const tipoTexts = {
        'PRICE_UP': 'rises to',
        'PRICE_DOWN': 'drops to',
        'PRICE_EQUAL': 'reaches'
      };
      const autoMessage = `Alert for when ${formData.symbol} ${tipoTexts[formData.tipo]} $${formData.valorTrigger}`;
      setFormData(prev => ({...prev, mensajePersonalizado: autoMessage}));
    }
  }, [formData.symbol, formData.tipo, formData.valorTrigger]);

  const handleSymbolInputChange = (value) => {
    setSymbolSearch(value);
    setFormData({...formData, symbol: value.toUpperCase()});
    setShowSuggestions(value.length > 0);
  };

  const handleToggleAlert = async (alertaId) => {
    if (!userId) return;
    
    try {
      await alertService.toggleAlerta(userId, alertaId);
      loadAlerts(userId);
    } catch (error) {
      console.error('Error toggling alert:', error);
    }
  };

  const handleDeleteAlert = async (alertaId) => {
    if (!userId) return;
    if (!window.confirm('Delete this alert?')) return;
    
    try {
      await alertService.eliminarAlerta(userId, alertaId);
      loadAlerts(userId);
    } catch (error) {
      console.error('Error deleting alert:', error);
    }
  };

  const handleReactivateAlert = async (alertaId) => {
    if (!userId) return;
    
    try {
      await alertService.reactivarAlerta(userId, alertaId);
      loadAlerts(userId);
    } catch (error) {
      console.error('Error reactivating alert:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      symbol: '',
      tipo: 'PRICE_UP',
      valorTrigger: '',
      mensajePersonalizado: ''
    });
    setSymbolSearch('');
    setShowSuggestions(false);
    setCurrentPrice(null);
    setLoadingPrice(false);
  };

  const getFilteredAlerts = () => {
    let filtered = alerts;

    if (selectedCategory === 'active') {
      filtered = filtered.filter(a => a.activa && !a.disparada);
    } else if (selectedCategory === 'triggered') {
      filtered = filtered.filter(a => a.disparada);
    } else if (selectedCategory === 'inactive') {
      filtered = filtered.filter(a => !a.activa);
    }

    if (searchTerm) {
      filtered = filtered.filter(a => 
        a.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price);
  };

  const getAlertIcon = (tipo) => {
    switch(tipo) {
      case 'PRICE_UP': return <TrendingUp size={18} />;
      case 'PRICE_DOWN': return <TrendingDown size={18} />;
      case 'PRICE_EQUAL': return <Target size={18} />;

      default: return <Bell size={18} />;
    }
  };

  const getTipoText = (tipo) => {
    switch(tipo) {
      case 'PRICE_UP': return 'Rises to';
      case 'PRICE_DOWN': return 'Drops to';
      case 'PRICE_EQUAL': return 'Reaches';
  
      default: return tipo;
    }
  };

  const stats = {
    total: alerts.length,
    activas: alerts.filter(a => a.activa && !a.disparada).length,
    disparadas: alerts.filter(a => a.disparada).length,
    inactivas: alerts.filter(a => !a.activa).length
  };

  if (!userId) {
    return (
      <div className="alert-section1">
        <div className="alert-loading">
          <div className="loading-spinner-small"></div>
          <span>Loading session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="alert-section1">
      <div className="alert-section1-header">
        <h2 className="alert-section1-title">My Alerts</h2>
        <p className="alert-section1-subtitle">Manage your price notifications</p>
      </div>

      <div className="controls-row">
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search by symbol..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button 
          className="create-alert-btn-main"
          onClick={() => setShowCreateModal(true)}
        >
          <span className="btn-icon"><Plus size={18} /></span>
          <span className="btn-text">New Alert</span>
        </button>
      </div>

      <div className="category-filters">
        <button 
          className={`alert-category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('all')}
        >
          <span className="category-icon"><Layers size={16} /></span>
          All
          <span className="count-badge">{stats.total}</span>
        </button>
        <button 
          className={`alert-category-btn ${selectedCategory === 'active' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('active')}
        >
          <span className="category-icon"><CheckCircle2 size={16} /></span>
          Active
          <span className="count-badge">{stats.activas}</span>
        </button>
        <button 
          className={`alert-category-btn ${selectedCategory === 'triggered' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('triggered')}
        >
          <span className="category-icon"><BellRing size={16} /></span>
          Triggered
          <span className="count-badge">{stats.disparadas}</span>
        </button>
        <button 
          className={`alert-category-btn ${selectedCategory === 'inactive' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('inactive')}
        >
          <span className="category-icon"><AlertCircle size={16} /></span>
          Inactive
          <span className="count-badge">{stats.inactivas}</span>
        </button>
      </div>

      {loading ? (
        <div className="alert-loading">
          <div className="loading-spinner-small"></div>
          <span>Loading alerts...</span>
        </div>
      ) : (
        <div className="alerts-grid">
          {getFilteredAlerts().length === 0 ? (
            <div className="no-results">
              <p>No alerts to display</p>
            </div>
          ) : (
            getFilteredAlerts().map((alert) => (
              <div 
                key={alert.id}
                className={`alert-card ${alert.disparada ? 'triggered' : alert.activa ? 'active' : 'inactive'}`}
              >
                <div className="alert-card-main">
                  <div className="alert-symbol-section">
                    <span className="alert-icon">{getAlertIcon(alert.tipoAlerta)}</span>
                    <span className="alert-symbol">{alert.symbol}</span>
                    {alert.disparada && <span className="triggered-badge">Triggered</span>}
                  </div>
                  
                  <div className="alert-info">
                    <span className="alert-tipo">{getTipoText(alert.tipoAlerta)}</span>
                    <span className="alert-price">{formatPrice(alert.valorTrigger)}</span>
                  </div>

                  <div className="alert-actions">
                    <button
                      className="action-icon-btn"
                      onClick={() => handleToggleAlert(alert.id)}
                      title={alert.activa ? 'Deactivate' : 'Activate'}
                    >
                      {alert.activa ? <Bell size={16} /> : <BellOff size={16} />}
                    </button>
                    {alert.disparada && (
                      <button
                        className="action-icon-btn"
                        onClick={() => handleReactivateAlert(alert.id)}
                        title="Reactivate"
                      >
                        <RotateCcw size={16} />
                      </button>
                    )}
                    <button
                      className="action-icon-btn delete"
                      onClick={() => handleDeleteAlert(alert.id)}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {alert.mensajePersonalizado && (
                  <div className="alert-message">
                    <MessageSquare size={14} style={{ display: 'inline', marginRight: '6px' }} />
                    {alert.mensajePersonalizado}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {showCreateModal && (
        <div className="alert-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="alert-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="alert-modal-close" onClick={() => setShowCreateModal(false)}>
              <X size={20} />
            </button>

            <div className="alert-modal-header">
              <h3 className="alert-modal-title">New Alert</h3>
              <p className="alert-modal-subtitle">Set up your price notification</p>
            </div>

            <div className="alert-modal-form">
              <div className="alert-form-group">
                <label>Symbol</label>
                <div className="alert-symbol-input-wrapper">
                  <input
                    type="text"
                    className="alert-symbol-input"
                    placeholder="Search: AAPL, TSLA, MSFT..."
                    value={symbolSearch}
                    onChange={(e) => handleSymbolInputChange(e.target.value)}
                    onFocus={() => setShowSuggestions(symbolSearch.length > 0)}
                  />
                  {showSuggestions && filteredSymbols.length > 0 && (
                    <div className="alert-symbol-suggestions">
                      {filteredSymbols.map((symbol) => (
                        <div
                          key={symbol}
                          className="alert-symbol-suggestion-item"
                          onClick={() => handleSymbolSelect(symbol)}
                        >
                          <span className="alert-suggestion-symbol">{symbol}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {symbolSearch.length > 0 && filteredSymbols.length === 0 && (
                    <div className="alert-symbol-suggestions">
                      <div className="alert-no-symbol-found">
                        Symbol not found
                      </div>
                    </div>
                  )}
                </div>
                
                {formData.symbol && (
                  <div className="current-price-display">
                    {loadingPrice ? (
                      <div className="price-loading-inline">
                        <div className="loading-spinner-tiny"></div>
                        <span>Loading price...</span>
                      </div>
                    ) : currentPrice ? (
                      <div className="price-info-inline">
                        <span className="price-label">Current price:</span>
                        <span className="price-value-inline">${currentPrice.toFixed(2)}</span>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>

              <div className="alert-form-group">
                <label>Alert Type</label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                >
                  <option value="PRICE_UP">↗ Price rises to</option>
                  <option value="PRICE_DOWN">↘ Price drops to</option>
                  <option value="PRICE_EQUAL">→ Price reaches</option>
                
                </select>
              </div>

              <div className="alert-form-group">
                <label>Target Value ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="150.00"
                  value={formData.valorTrigger}
                  onChange={(e) => setFormData({...formData, valorTrigger: e.target.value})}
                />
              </div>

              <div className="alert-form-group">
                <label>Alert Message (auto-generated, editable)</label>
                <textarea
                  placeholder="Auto-generated message will appear here..."
                  value={formData.mensajePersonalizado}
                  onChange={(e) => setFormData({...formData, mensajePersonalizado: e.target.value})}
                  rows="3"
                />
              </div>

              <button 
                className="alert-create-btn"
                onClick={handleCreateAlert}
              >
                Create Alert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertSection1;