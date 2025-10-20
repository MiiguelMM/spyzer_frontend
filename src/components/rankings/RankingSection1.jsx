import React, { useState, useEffect } from 'react';
import '../../css/RankingSection1.css';
import userService from '../../service/userService';
import portfolioService from '../../service/portfolioService';

const RankingSection1 = () => {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    cargarRanking();
  }, []);

  const cargarRanking = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener usuario actual
      const usuarioActual = userService.obtenerUsuarioSesion();
      if (usuarioActual) {
        setCurrentUserId(usuarioActual.id);
      }

      // Obtener ranking base de usuarios
      const rankingData = await userService.obtenerRanking();

      // Enriquecer cada usuario con valor del portfolio
      const rankingEnriquecido = await Promise.all(
        rankingData.map(async (usuario) => {
          try {
            // Obtener resumen completo del portfolio
            const resumenPortfolio = await portfolioService.obtenerResumen(usuario.id);
            
            const valorPortfolio = parseFloat(resumenPortfolio.valorTotal || 0);
            const balanceInicial = 50000;
            const balanceActual = parseFloat(usuario.balanceActual || balanceInicial);
            
            // Balance Total = Balance Actual (cash) + Valor Portfolio (acciones)
            const balanceTotal = balanceActual + valorPortfolio;
            
            // Ganancia/Pérdida Total = Balance Total - Balance Inicial
            const gananciaPerdidaTotal = balanceTotal - balanceInicial;
            
            // Rentabilidad = ((Balance Total - Balance Inicial) / Balance Inicial) * 100
            const rentabilidadTotal = ((gananciaPerdidaTotal / balanceInicial) * 100);

            console.log(`📊 Usuario ${usuario.name}:`, {
              balanceInicial: `${balanceInicial.toLocaleString()}`,
              balanceActual: `${balanceActual.toLocaleString()}`,
              valorPortfolio: `${valorPortfolio.toLocaleString()}`,
              balanceTotal: `${balanceTotal.toLocaleString()}`,
              gananciaPerdidaTotal: `${gananciaPerdidaTotal.toLocaleString()}`,
              rentabilidadTotal: `${rentabilidadTotal.toFixed(2)}%`
            });

            return {
              ...usuario,
              balanceTotal,
              rentabilidadTotal
            };
          } catch (err) {
            console.warn(`Error fetching portfolio for user ${usuario.id}:`, err);
            const balanceInicial = 50000;
            const balanceActual = parseFloat(usuario.balanceActual || balanceInicial);
            const gananciaPerdidaTotal = balanceActual - balanceInicial;
            const rentabilidadTotal = ((gananciaPerdidaTotal / balanceInicial) * 100);
            
            return {
              ...usuario,
              balanceTotal: balanceActual,
              rentabilidadTotal
            };
          }
        })
      );

      // Ordenar por balance total (descendente)
      const rankingOrdenado = rankingEnriquecido.sort((a, b) => b.balanceTotal - a.balanceTotal);

      setRanking(rankingOrdenado);
    } catch (err) {
      console.error('Error loading ranking:', err);
      setError('Error loading ranking');
    } finally {
      setLoading(false);
    }
  };

  const formatearBalance = (balance) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(balance);
  };

  const formatearPorcentaje = (porcentaje) => {
    const signo = porcentaje >= 0 ? '+' : '';
    return `${signo}${porcentaje.toFixed(2)}%`;
  };

  const obtenerMedalla = (posicion) => {
    switch(posicion) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      case 4: return '4️⃣';
      case 5: return '5️⃣';
      case 6: return '6️⃣';
      case 7: return '7️⃣';
      case 8: return '8️⃣';
      case 9: return '9️⃣';
      case 10: return '🔟';
      default: return posicion <= 150 ? `#${posicion}` : null;
    }
  };

  const obtenerColorPorcentaje = (porcentaje) => {
    return porcentaje >= 0 ? 'positive' : 'negative';
  };

  if (loading) {
    return (
      <div className="ranking-section1-container">
        <div className="section1-header">
          <h2 className="section1-title">🏆 Traders Ranking</h2>
          <p className="section1-subtitle">Top traders by performance</p>
        </div>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ranking-section1-container">
        <div className="section1-header">
          <h2 className="section1-title">🏆 Traders Ranking</h2>
          <p className="section1-subtitle">Top traders by performance</p>
        </div>
        <div className="error-state">
          <p>{error}</p>
          <button onClick={cargarRanking} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ranking-section1-container">
      <div className="section1-header">
        <h2 className="section1-title">🏆 Traders Ranking</h2>
        <p className="section1-subtitle">
          Top 150 investors by total capital
        </p>
      </div>

      {ranking.length === 0 ? (
        <div className="empty-state">
          <p>No ranking data available</p>
        </div>
      ) : (
        <div className="ranking-list">
          {ranking.slice(0, 150).map((usuario, index) => {
            const posicion = index + 1;
            const medalla = obtenerMedalla(posicion);
            const esUsuarioActual = usuario.id === currentUserId;
            const rentabilidadTotal = usuario.rentabilidadTotal || 0;

            return (
              <div 
                key={usuario.id} 
                className={`ranking-card ${esUsuarioActual ? 'current-user' : ''} ${posicion <= 10 ? 'top-ten' : ''}`}
                style={{
                  animationDelay: `${index * 0.05}s`
                }}
              >
                {/* Posición */}
                <div className="ranking-position">
                  {medalla || `#${posicion}`}
                </div>

                {/* Usuario */}
                <div className="ranking-user-info">
                  <div className="user-details">
                    <div className="user-name">
                      {usuario.name}
                      {esUsuarioActual && <span className="you-badge">TÚ</span>}
                    </div>
                  </div>
                </div>

                {/* Estadísticas */}
                <div className="ranking-stats">
                  <div className="stat-item">
                    <div className="stat-label">Total Capital</div>
                    <div className="stat-value">
                      {formatearBalance(usuario.balanceTotal)}
                    </div>
                  </div>
                  
                  <div className="stat-item">
                    <div className="stat-label">Return</div>
                    <div className={`stat-value ${obtenerColorPorcentaje(rentabilidadTotal)}`}>
                      {formatearPorcentaje(rentabilidadTotal)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RankingSection1;