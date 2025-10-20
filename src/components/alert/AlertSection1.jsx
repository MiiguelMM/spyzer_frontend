import React, { useState, useEffect } from 'react';
import alertService from '../../service/alertService';
import userService from '../../service/userService';
import stockService from '../../service/stockService';
import marketDataService from '../../service/marketDataService'; // ← AGREGADO
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
          console.error('No hay usuario en sesión');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error cargando usuario y alertas:', error);
        setLoading(false);
      }
    };

    loadUserAndAlerts();
    loadPopularStocks();
  }, []);

  const loadPopularStocks = async () => {
    try {
      console.log('📦 Cargando acciones populares...');
      const stocks = await stockService.obtenerAccionesPopulares();
      console.log('✅ Acciones cargadas:', stocks);
      
      const stocksMap = {};
      stocks.forEach(stock => {
        stocksMap[stock.symbol] = stock;
      });
      setStocksData(stocksMap);
      console.log('💾 Stocks guardados en state:', stocksMap);
    } catch (error) {
      console.error('Error cargando acciones populares:', error);
    }
  };

  const loadAlerts = async (uid) => {
    try {
      setLoading(true);
      const data = await alertService.obtenerAlertas(uid);
      setAlerts(data);
    } catch (error) {
      console.error('Error cargando alertas:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentPrice = async (symbol) => {
    console.log('🔍 Buscando precio para:', symbol);
    
    // Primero intentar obtener del caché que ya cargamos
    if (stocksData[symbol]) {
      console.log('✅ Precio encontrado en caché:', stocksData[symbol].precio);
      setCurrentPrice(stocksData[symbol].precio);
      return;
    }
    
    // Si no está en caché, hacer petición individual SIN históricos
    try {
      setLoadingPrice(true);
      setCurrentPrice(null);
      
      // ✅ CORREGIDO: Solo obtener precio actual, NO históricos
      const data = await marketDataService.obtenerDatos(symbol);
      console.log('📊 Datos recibidos de API:', data);
      
      if (data && data.precio) {
        console.log('✅ Precio encontrado:', data.precio);
        setCurrentPrice(data.precio);
      } else {
        console.log('❌ No hay precio en los datos');
      }
    } catch (error) {
      console.error('Error obteniendo precio actual:', error);
      setCurrentPrice(null);
    } finally {
      setLoadingPrice(false);
    }
  };

  const handleCreateAlert = async () => {
    if (!userId) {
      alert('No hay usuario en sesión');
      return;
    }

    if (!SIMBOLOS_DISPONIBLES.includes(formData.symbol.toUpperCase())) {
      alert('El símbolo ingresado no es válido. Por favor selecciona uno de la lista.');
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
      console.error('Error creando alerta:', error);
      alert('Error al crear la alerta');
    }
  };

  const handleSymbolSelect = async (symbol) => {
    setFormData({...formData, symbol: symbol});
    setSymbolSearch(symbol);
    setShowSuggestions(false);
    await fetchCurrentPrice(symbol);
  };

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
      console.error('Error toggling alerta:', error);
    }
  };

  const handleDeleteAlert = async (alertaId) => {
    if (!userId) return;
    if (!window.confirm('¿Eliminar esta alerta?')) return;
    
    try {
      await alertService.eliminarAlerta(userId, alertaId);
      loadAlerts(userId);
    } catch (error) {
      console.error('Error eliminando alerta:', error);
    }
  };

  const handleReactivateAlert = async (alertaId) => {
    if (!userId) return;
    
    try {
      await alertService.reactivarAlerta(userId, alertaId);
      loadAlerts(userId);
    } catch (error) {
      console.error('Error reactivando alerta:', error);
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
      case 'PRICE_UP': return '📈';
      case 'PRICE_DOWN': return '📉';
      case 'PRICE_EQUAL': return '🎯';
      case 'VOLUME_HIGH': return '📊';
      default: return '🔔';
    }
  };

  const getTipoText = (tipo) => {
    switch(tipo) {
      case 'PRICE_UP': return 'Sube a';
      case 'PRICE_DOWN': return 'Baja a';
      case 'PRICE_EQUAL': return 'Llega a';
      case 'VOLUME_HIGH': return 'Volumen';
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
          <span>Cargando sesión...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="alert-section1">
      <div className="alert-section1-header">
        <h2 className="alert-section1-title">Mis Alertas</h2>
        <p className="alert-section1-subtitle">Gestiona tus notificaciones de precio</p>
      </div>

      <div className="controls-row">
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Buscar por símbolo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button 
          className="create-alert-btn-main"
          onClick={() => setShowCreateModal(true)}
        >
          <span className="btn-icon">+</span>
          <span className="btn-text">Nueva Alerta</span>
        </button>
      </div>

      <div className="category-filters">
        <button 
          className={`alert-category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('all')}
        >
          Todas
          <span className="count-badge">{stats.total}</span>
        </button>
        <button 
          className={`alert-category-btn ${selectedCategory === 'active' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('active')}
        >
          Activas
          <span className="count-badge">{stats.activas}</span>
        </button>
        <button 
          className={`alert-category-btn ${selectedCategory === 'triggered' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('triggered')}
        >
          Disparadas
          <span className="count-badge">{stats.disparadas}</span>
        </button>
        <button 
          className={`alert-category-btn ${selectedCategory === 'inactive' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('inactive')}
        >
          Inactivas
          <span className="count-badge">{stats.inactivas}</span>
        </button>
      </div>

      {loading ? (
        <div className="alert-loading">
          <div className="loading-spinner-small"></div>
          <span>Cargando alertas...</span>
        </div>
      ) : (
        <div className="alerts-grid">
          {getFilteredAlerts().length === 0 ? (
            <div className="no-results">
              <p>No hay alertas para mostrar</p>
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
                    {alert.disparada && <span className="triggered-badge">Disparada</span>}
                  </div>
                  
                  <div className="alert-info">
                    <span className="alert-tipo">{getTipoText(alert.tipoAlerta)}</span>
                    <span className="alert-price">{formatPrice(alert.valorTrigger)}</span>
                  </div>

                  <div className="alert-actions">
                    <button
                      className="action-icon-btn"
                      onClick={() => handleToggleAlert(alert.id)}
                      title={alert.activa ? 'Desactivar' : 'Activar'}
                    >
                      {alert.activa ? '🔔' : '🔕'}
                    </button>
                    {alert.disparada && (
                      <button
                        className="action-icon-btn"
                        onClick={() => handleReactivateAlert(alert.id)}
                        title="Reactivar"
                      >
                        🔄
                      </button>
                    )}
                    <button
                      className="action-icon-btn delete"
                      onClick={() => handleDeleteAlert(alert.id)}
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {alert.mensajePersonalizado && (
                  <div className="alert-message">
                    💬 {alert.mensajePersonalizado}
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
              ✕
            </button>

            <div className="alert-modal-header">
              <h3 className="alert-modal-title">Nueva Alerta</h3>
              <p className="alert-modal-subtitle">Configura tu notificación de precio</p>
            </div>

            <div className="alert-modal-form">
              <div className="alert-form-group">
                <label>Símbolo</label>
                <div className="alert-symbol-input-wrapper">
                  <input
                    type="text"
                    className="alert-symbol-input"
                    placeholder="Busca: AAPL, TSLA, MSFT..."
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
                        No se encontró el símbolo
                      </div>
                    </div>
                  )}
                </div>
                
                {formData.symbol && (
                  <div className="current-price-display">
                    {loadingPrice ? (
                      <div className="price-loading-inline">
                        <div className="loading-spinner-tiny"></div>
                        <span>Cargando precio...</span>
                      </div>
                    ) : currentPrice ? (
                      <div className="price-info-inline">
                        <span className="price-label">Precio actual:</span>
                        <span className="price-value-inline">${currentPrice.toFixed(2)}</span>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>

              <div className="alert-form-group">
                <label>Tipo de Alerta</label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                >
                  <option value="PRICE_UP">📈 Precio sube a</option>
                  <option value="PRICE_DOWN">📉 Precio baja a</option>
                  <option value="PRICE_EQUAL">🎯 Precio llega a</option>
                  <option value="VOLUME_HIGH">📊 Volumen supera</option>
                </select>
              </div>

              <div className="alert-form-group">
                <label>Valor Objetivo ($)</label>
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
                <label>Mensaje Personalizado (Opcional)</label>
                <textarea
                  placeholder="Añade una nota..."
                  value={formData.mensajePersonalizado}
                  onChange={(e) => setFormData({...formData, mensajePersonalizado: e.target.value})}
                  rows="3"
                />
              </div>

              <button 
                className="alert-create-btn"
                onClick={handleCreateAlert}
              >
                Crear Alerta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertSection1;