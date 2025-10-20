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
  const [metricas, setMetricas] = useState(null);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  
  // Estados para la venta
  const [cantidadVenta, setCantidadVenta] = useState('');
  const [mostrandoVenta, setMostrandoVenta] = useState(false);
  const [procesandoVenta, setProcesandoVenta] = useState(false);

  useEffect(() => {
    const usuario = userService.obtenerUsuarioSesion();
    
    if (usuario) {
      setUserId(usuario.id);
    } else {
      console.error('No hay usuario en sesión');
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
      const posiciones = await portfolioService.obtenerPortfolioOrdenado(userId);
      
      console.log('Posiciones del backend:', posiciones);
      
      const posicionesConCalculos = posiciones.map(pos => {
        const cantidad = parseFloat(pos.cantidad) || 0;
        const precioPromedio = parseFloat(pos.precioPromedio) || 0;
        const precioActual = parseFloat(pos.precioActual) || 0;
        const valorMercado = parseFloat(pos.valorMercado) || 0;
        const gananciaPerdida = parseFloat(pos.gananciaPerdida) || 0;
        
        console.log(`${pos.symbol}:`, {
          precioPromedio,
          precioActual,
          gananciaPerdida,
          'son iguales?': precioPromedio === precioActual
        });
        
        const porcentajeGanancia = precioPromedio > 0 
          ? ((precioActual - precioPromedio) / precioPromedio) * 100 
          : 0;
        
        return {
          id: pos.id,
          symbol: pos.symbol,
          nombre: pos.nombre || pos.symbol,
          cantidad,
          precioPromedio,
          precioActual,
          valorMercado,
          gananciaPerdida,
          porcentajeGanancia: parseFloat(porcentajeGanancia.toFixed(2))
        };
      });
      
      const valorTotal = posicionesConCalculos.reduce((sum, pos) => sum + pos.valorMercado, 0);
      const gananciaPerdidaTotal = posicionesConCalculos.reduce((sum, pos) => sum + pos.gananciaPerdida, 0);
      const costoTotal = valorTotal - gananciaPerdidaTotal;
      const porcentajeGananciaPerdida = costoTotal > 0 ? ((gananciaPerdidaTotal / costoTotal) * 100) : 0;

      const dineroActual = await userService.obtenerBalance(userId);
      
      const metricasCalculadas = {
        valorTotal,
        gananciaPerdidaTotal,
        porcentajeGananciaPerdida: parseFloat(porcentajeGananciaPerdida.toFixed(2)),
        numeroPosiciones: posicionesConCalculos.length,
        posicionesConGanancia: posicionesConCalculos.filter(p => p.gananciaPerdida > 0).length,
        dineroActual,
        posicionesConPerdida: posicionesConCalculos.filter(p => p.gananciaPerdida < 0).length
      };
      
      console.log('Posiciones procesadas:', posicionesConCalculos);
      console.log('Métricas calculadas:', metricasCalculadas);
      
      setPortfolio(posicionesConCalculos);
      setMetricas(metricasCalculadas);
    } catch (error) {
      console.error('Error cargando portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePositionClick = async (position) => {
    if (selectedPosition?.symbol === position.symbol) {
      setSelectedPosition(null);
      setTransactions([]);
      setMostrandoVenta(false);
      setCantidadVenta('');
      return;
    }

    setSelectedPosition(position);
    setMostrandoVenta(false);
    setCantidadVenta('');
    setLoadingTransactions(true);
    
    try {
      const trans = await transactionService.obtenerPorSimbolo(userId, position.symbol);
      setTransactions(trans);
    } catch (error) {
      console.error('Error cargando transacciones:', error);
      setTransactions([]);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const handleMostrarVenta = () => {
    setMostrandoVenta(!mostrandoVenta);
    setCantidadVenta('');
  };

  const handleVenderAcciones = async () => {
    if (!cantidadVenta || cantidadVenta <= 0) {
      alert('Por favor ingresa una cantidad válida');
      return;
    }

    if (parseFloat(cantidadVenta) > selectedPosition.cantidad) {
      alert('No puedes vender más acciones de las que tienes');
      return;
    }

    const totalVenta = parseFloat(cantidadVenta) * selectedPosition.precioActual;
    const confirmacion = window.confirm(
      `¿Confirmar venta de ${cantidadVenta} acciones de ${selectedPosition.symbol} a $${selectedPosition.precioActual.toFixed(2)}?\n\n` +
      `Total a recibir: $${totalVenta.toFixed(2)}`
    );

    if (!confirmacion) {
      return;
    }

    setProcesandoVenta(true);
    
    try {
      // Llamar al servicio de trading para vender acciones
      const resultado = await tradingService.crearOrdenVenta(
        userId,
        selectedPosition.symbol,
        parseFloat(cantidadVenta),
        true // validar antes de ejecutar
      );

      console.log('Venta exitosa:', resultado);
      
      alert(`✓ Venta exitosa!\n\n${cantidadVenta} acciones de ${selectedPosition.symbol}\nTotal: $${totalVenta.toFixed(2)}`);
      
      // Recargar datos del portfolio
      await fetchPortfolioData();
      
      // Resetear estado de venta
      setMostrandoVenta(false);
      setCantidadVenta('');
      setSelectedPosition(null);
      
    } catch (error) {
      console.error('Error vendiendo acciones:', error);
      
      // Mostrar mensaje de error más específico
      const mensajeError = error.response?.data?.message || 
                          error.message || 
                          'Error al procesar la venta. Por favor intenta nuevamente.';
      
      alert(`✗ Error en la venta\n\n${mensajeError}`);
    } finally {
      setProcesandoVenta(false);
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
        <h2 className="section2-title">Mi Portfolio</h2>
        
        {metricas && (
          <div className="metricas-grid">
            <div className="metrica-item">
              <span className="metrica-label">Valor Total</span>
              <p className="metrica-value">
                ${metricas.valorTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
            
            <div className="metrica-item">
              <span className="metrica-label">Ganancia/Pérdida</span>
              <p className={`metrica-value ${metricas.gananciaPerdidaTotal >= 0 ? 'positive' : 'negative'}`}>
                {metricas.gananciaPerdidaTotal >= 0 ? '+' : ''}
                ${metricas.gananciaPerdidaTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
            
            <div className="metrica-item">
              <span className="metrica-label">Rendimiento</span>
              <p className={`metrica-value ${metricas.porcentajeGananciaPerdida >= 0 ? 'positive' : 'negative'}`}>
                {metricas.porcentajeGananciaPerdida >= 0 ? '+' : ''}
                {metricas.porcentajeGananciaPerdida}%
              </p>
            </div>
            
            <div className="metrica-item">
              <span className="metrica-label">Money Left</span>
              <p className="metrica-value">
              ${metricas.dineroActual.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="positions-list">
        {portfolio.length === 0 ? (
          <div className="empty-state">
            <p>No tienes posiciones activas en tu portfolio</p>
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
                      <span className="position-nombre">{position.nombre}</span>
                    </div>
                    <div className="position-cantidad">
                      {position.cantidad} acciones
                    </div>
                  </div>

                  <div className="position-values">
                    <div className="value-item">
                      <span className="value-label">Valor Mercado</span>
                      <span className="value-amount">
                        ${position.valorMercado.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="value-item">
                      <span className="value-label">G/P</span>
                      <span className={`value-amount ${position.gananciaPerdida >= 0 ? 'positive' : 'negative'}`}>
                        {position.gananciaPerdida >= 0 ? '+' : ''}
                        ${Math.abs(position.gananciaPerdida).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        <span className="percentage">
                          ({position.porcentajeGanancia >= 0 ? '+' : ''}{position.porcentajeGanancia}%)
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {selectedPosition?.symbol === position.symbol && (
                  <div className="position-detail">
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="detail-label">Precio Promedio</span>
                        <span className="detail-value">
                          ${position.precioPromedio.toFixed(2)}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Precio Actual</span>
                        <span className="detail-value">
                          ${position.precioActual.toFixed(2)}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Cantidad</span>
                        <span className="detail-value">{position.cantidad}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Inversión Total</span>
                        <span className="detail-value">
                          ${(position.precioPromedio * position.cantidad).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Sección de venta */}
                    <div className="sell-section">
                      {!mostrandoVenta ? (
                        <button 
                          className="sell-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMostrarVenta();
                          }}
                        >
                          SELL
                        </button>
                      ) : (
                        <div className="sell-form" onClick={(e) => e.stopPropagation()}>
                          <div className="sell-form-header">
                            <h4>Vender {position.symbol}</h4>
                            <span className="disponible">Disponible: {position.cantidad} acciones</span>
                          </div>
                          
                          <div className="sell-input-group">
                            <label htmlFor="cantidadVenta">Cantidad a vender:</label>
                            <input
                              id="cantidadVenta"
                              type="number"
                              min="1"
                              max={position.cantidad}
                              value={cantidadVenta}
                              onChange={(e) => setCantidadVenta(e.target.value)}
                              placeholder="0"
                              className="sell-input"
                            />
                            <div className="quick-buttons">
                              <button onClick={(e) => { e.stopPropagation(); setCantidadVenta(Math.floor(position.cantidad * 0.25)); }}>25%</button>
                              <button onClick={(e) => { e.stopPropagation(); setCantidadVenta(Math.floor(position.cantidad * 0.5)); }}>50%</button>
                              <button onClick={(e) => { e.stopPropagation(); setCantidadVenta(Math.floor(position.cantidad * 0.75)); }}>75%</button>
                              <button onClick={(e) => { e.stopPropagation(); setCantidadVenta(position.cantidad); }}>100%</button>
                            </div>
                          </div>

                          {cantidadVenta > 0 && (
                            <div className="sell-summary">
                              <div className="summary-row">
                                <span>Precio actual:</span>
                                <span>${position.precioActual.toFixed(2)}</span>
                              </div>
                              <div className="summary-row">
                                <span>Cantidad:</span>
                                <span>{cantidadVenta} acciones</span>
                              </div>
                              <div className="summary-row total">
                                <span>Total a recibir:</span>
                                <span>${(cantidadVenta * position.precioActual).toFixed(2)}</span>
                              </div>
                            </div>
                          )}

                          <div className="sell-actions">
                            <button 
                              className="cancel-button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMostrarVenta();
                              }}
                              disabled={procesandoVenta}
                            >
                              Cancelar
                            </button>
                            <button 
                              className="confirm-sell-button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleVenderAcciones();
                              }}
                              disabled={procesandoVenta || !cantidadVenta || cantidadVenta <= 0}
                            >
                              {procesandoVenta ? 'Procesando...' : 'Confirmar Venta'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="transactions-section">
                      <h3 className="transactions-title">Historial de Transacciones</h3>
                      
                      {loadingTransactions ? (
                        <div className="loading-spinner small" />
                      ) : transactions.length === 0 ? (
                        <p className="no-transactions">No hay transacciones</p>
                      ) : (
                        <div className="transactions-list">
                          {transactions.map((trans, idx) => (
                            <div key={idx} className="transaction-item">
                              <div className="transaction-header">
                                <span className={`transaction-type ${trans.tipo.toLowerCase()}`}>
                                  {trans.tipo === 'BUY' ? 'COMPRA' : 'VENTA'}
                                </span>
                                <span className="transaction-date">
                                  {new Date(trans.timestamp || trans.fecha).toLocaleDateString('es-ES', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                              <div className="transaction-details">
                                <span>{trans.cantidad} acciones @ ${parseFloat(trans.precio).toFixed(2)}</span>
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