// src/services/portfolioService.js
import BaseService from './baseService';

class PortfolioService extends BaseService {
  constructor() {
    super('/portfolio');
  }

  /**
   * Obtener portfolio completo del usuario
   * @param {number} userId - ID del usuario
   * @returns {Promise<Array>} Lista de posiciones
   */
  async obtenerPortfolio(userId) {
    return this.get(`/${userId}`);
  }

  /**
   * Obtener portfolio ordenado por valor de mercado
   * @param {number} userId - ID del usuario
   * @returns {Promise<Array>} Lista de posiciones ordenadas
   */
  async obtenerPortfolioOrdenado(userId) {
    return this.get(`/${userId}/ordenado`);
  }

  /**
   * Obtener posición específica por símbolo
   * @param {number} userId - ID del usuario
   * @param {string} symbol - Símbolo de la acción
   * @returns {Promise<Object>} Posición específica
   */
  async obtenerPosicion(userId, symbol) {
    return this.get(`/${userId}/posicion/${symbol}`);
  }

  /**
   * Verificar si tiene posición en un símbolo
   * @param {number} userId - ID del usuario
   * @param {string} symbol - Símbolo de la acción
   * @returns {Promise<boolean>} True si tiene posición
   */
  async tienePosicion(userId, symbol) {
    const result = await this.get(`/${userId}/tiene/${symbol}`);
    return result.tienePosicion;
  }

  /**
   * Obtener valor total del portfolio
   * @param {number} userId - ID del usuario
   * @returns {Promise<number>} Valor total
   */
  async obtenerValorTotal(userId) {
    const result = await this.get(`/${userId}/valor-total`);
    return result.valorTotal;
  }

  /**
   * Obtener ganancia/pérdida total
   * @param {number} userId - ID del usuario
   * @returns {Promise<number>} Ganancia/pérdida total
   */
  async obtenerGananciaPerdida(userId) {
    const result = await this.get(`/${userId}/ganancia-perdida`);
    return result.gananciaPerdida;
  }

  /**
   * Obtener resumen completo del portfolio
   * @param {number} userId - ID del usuario
   * @returns {Promise<Object>} Resumen completo
   */
  async obtenerResumen(userId) {
    return this.get(`/${userId}/resumen`);
  }

  /**
   * Actualizar precio actual de una posición
   * @param {number} userId - ID del usuario
   * @param {string} symbol - Símbolo de la acción
   * @param {number} nuevoPrecio - Nuevo precio
   * @returns {Promise<Object>} Respuesta de actualización
   */
  async actualizarPrecio(userId, symbol, nuevoPrecio) {
    return this.put(`/${userId}/actualizar-precio`, {
      symbol,
      nuevoPrecio
    });
  }

  /**
   * Eliminar una posición completamente
   * @param {number} userId - ID del usuario
   * @param {string} symbol - Símbolo de la acción
   * @returns {Promise<Object>} Respuesta de eliminación
   */
  async eliminarPosicion(userId, symbol) {
    return this.delete(`/${userId}/eliminar/${symbol}`);
  }

  // Métodos de conveniencia para análisis

  /**
   * Calcular distribución del portfolio por posición
   * @param {Array} posiciones - Array de posiciones
   * @returns {Array} Distribución porcentual
   */
  calcularDistribucion(posiciones) {
    if (!posiciones || posiciones.length === 0) return [];

    const valorTotal = posiciones.reduce((sum, pos) => sum + parseFloat(pos.valorMercado || 0), 0);

    return posiciones.map(posicion => ({
      ...posicion,
      porcentaje: valorTotal > 0 ? ((parseFloat(posicion.valorMercado) / valorTotal) * 100).toFixed(2) : 0
    })).sort((a, b) => parseFloat(b.porcentaje) - parseFloat(a.porcentaje));
  }

  /**
   * Obtener top ganancias y pérdidas
   * @param {Array} posiciones - Array de posiciones
   * @param {number} limite - Cantidad de elementos a retornar
   * @returns {Object} Top ganancias y pérdidas
   */
  obtenerTopGananciasPerdidas(posiciones, limite = 5) {
    if (!posiciones || posiciones.length === 0) {
      return { ganancias: [], perdidas: [] };
    }

    const conGanancias = posiciones
      .filter(pos => parseFloat(pos.gananciaPerdida || 0) > 0)
      .sort((a, b) => parseFloat(b.gananciaPerdida) - parseFloat(a.gananciaPerdida))
      .slice(0, limite);

    const conPerdidas = posiciones
      .filter(pos => parseFloat(pos.gananciaPerdida || 0) < 0)
      .sort((a, b) => parseFloat(a.gananciaPerdida) - parseFloat(b.gananciaPerdida))
      .slice(0, limite);

    return {
      ganancias: conGanancias,
      perdidas: conPerdidas
    };
  }

  /**
   * Calcular métricas del portfolio
   * @param {Array} posiciones - Array de posiciones
   * @returns {Object} Métricas calculadas
   */
  calcularMetricas(posiciones) {
    if (!posiciones || posiciones.length === 0) {
      return {
        valorTotal: 0,
        gananciaPerdidaTotal: 0,
        porcentajeGananciaPerdida: 0,
        numeroPosiciones: 0,
        posicionesConGanancia: 0,
        posicionesConPerdida: 0
      };
    }

    const valorTotal = posiciones.reduce((sum, pos) => sum + parseFloat(pos.valorMercado || 0), 0);
    const gananciaPerdidaTotal = posiciones.reduce((sum, pos) => sum + parseFloat(pos.gananciaPerdida || 0), 0);
    const costoTotal = valorTotal - gananciaPerdidaTotal;
    const porcentajeGananciaPerdida = costoTotal > 0 ? ((gananciaPerdidaTotal / costoTotal) * 100) : 0;

    const posicionesConGanancia = posiciones.filter(pos => parseFloat(pos.gananciaPerdida || 0) > 0).length;
    const posicionesConPerdida = posiciones.filter(pos => parseFloat(pos.gananciaPerdida || 0) < 0).length;

    return {
      valorTotal,
      gananciaPerdidaTotal,
      porcentajeGananciaPerdida: parseFloat(porcentajeGananciaPerdida.toFixed(2)),
      numeroPosiciones: posiciones.length,
      posicionesConGanancia,
      posicionesConPerdida,
      costoTotal
    };
  }

  /**
   * Obtener portfolio con métricas calculadas
   * @param {number} userId - ID del usuario
   * @returns {Promise<Object>} Portfolio con métricas
   */
  async obtenerPortfolioConMetricas(userId) {
    try {
      const posiciones = await this.obtenerPortfolioOrdenado(userId);
      const metricas = this.calcularMetricas(posiciones);
      const distribucion = this.calcularDistribucion(posiciones);
      const topGananciasPerdidas = this.obtenerTopGananciasPerdidas(posiciones);

      return {
        posiciones,
        metricas,
        distribucion,
        topGananciasPerdidas,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error obteniendo portfolio con métricas:', error);
      throw error;
    }
  }

  /**
   * Verificar si una posición necesita actualización de precio
   * @param {Object} posicion - Posición a verificar
   * @param {number} minutosMax - Máximo de minutos de antigüedad
   * @returns {boolean} True si necesita actualización
   */
  necesitaActualizacionPrecio(posicion, minutosMax = 15) {
    if (!posicion.timestamp) return true;
    
    const timestampPosicion = new Date(posicion.timestamp);
    const ahora = new Date();
    const diferencia = (ahora - timestampPosicion) / (1000 * 60); // diferencia en minutos
    
    return diferencia > minutosMax;
  }
}

// Exportar instancia singleton
export default new PortfolioService();