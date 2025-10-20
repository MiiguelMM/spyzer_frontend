// src/services/tradingBotService.js
import BaseService from './baseService';

class TradingBotService extends BaseService {
  constructor() {
    super('/trading-bots');
  }

  /**
   * Crear un nuevo bot de trading
   * @param {number} userId - ID del usuario
   * @param {Object} botData - Datos del bot
   * @param {string} botData.nombre - Nombre del bot
   * @param {string} botData.estrategia - Estrategia del bot
   * @param {Object} botData.parametros - Parámetros de configuración
   * @param {number} botData.budget - Presupuesto del bot
   * @param {number} botData.stopLoss - Stop loss porcentual
   * @returns {Promise<Object>} Bot creado
   */
  async crearBot(userId, botData) {
    return this.post(`/${userId}`, botData);
  }

  /**
   * Obtener todos los bots de un usuario
   * @param {number} userId - ID del usuario
   * @returns {Promise<Array>} Lista de bots
   */
  async obtenerBots(userId) {
    return this.get(`/${userId}`);
  }

  /**
   * Obtener solo los bots activos de un usuario
   * @param {number} userId - ID del usuario
   * @returns {Promise<Array>} Lista de bots activos
   */
  async obtenerBotsActivos(userId) {
    return this.get(`/${userId}/activos`);
  }

  /**
   * Obtener un bot específico
   * @param {number} userId - ID del usuario
   * @param {number} botId - ID del bot
   * @returns {Promise<Object>} Bot específico
   */
  async obtenerBot(userId, botId) {
    return this.get(`/${userId}/${botId}`);
  }

  /**
   * Activar/Desactivar un bot
   * @param {number} userId - ID del usuario
   * @param {number} botId - ID del bot
   * @returns {Promise<Object>} Bot actualizado
   */
  async toggleBot(userId, botId) {
    return this.put(`/${userId}/${botId}/toggle`);
  }

  /**
   * Actualizar configuración de un bot
   * @param {number} userId - ID del usuario
   * @param {number} botId - ID del bot
   * @param {Object} botData - Nuevos datos del bot
   * @returns {Promise<Object>} Bot actualizado
   */
  async actualizarBot(userId, botId, botData) {
    return this.put(`/${userId}/${botId}`, botData);
  }

  /**
   * Eliminar un bot
   * @param {number} userId - ID del usuario
   * @param {number} botId - ID del bot
   * @returns {Promise<Object>} Confirmación de eliminación
   */
  async eliminarBot(userId, botId) {
    return this.delete(`/${userId}/${botId}`);
  }

  /**
   * Ejecutar trade manual para un bot (testing)
   * @param {number} botId - ID del bot
   * @param {number} gananciaOPerdida - Resultado del trade
   * @returns {Promise<Object>} Bot actualizado
   */
  async ejecutarTrade(botId, gananciaOPerdida) {
    return this.post(`/${botId}/ejecutar-trade`, { gananciaOPerdida });
  }

  /**
   * Obtener estadísticas de bots del usuario
   * @param {number} userId - ID del usuario
   * @returns {Promise<Object>} Estadísticas
   */
  async obtenerEstadisticas(userId) {
    return this.get(`/${userId}/estadisticas`);
  }

  /**
   * Obtener ranking de bots por performance
   * @param {number} userId - ID del usuario
   * @param {number} limite - Límite de resultados
   * @returns {Promise<Array>} Ranking de bots
   */
  async obtenerRanking(userId, limite = 10) {
    return this.get(`/${userId}/ranking`, { limite });
  }

  /**
   * Contar bots activos
   * @param {number} userId - ID del usuario
   * @returns {Promise<number>} Número de bots activos
   */
  async contarBotsActivos(userId) {
    const result = await this.get(`/${userId}/count-activos`);
    return result.botsActivos;
  }

  /**
   * Contar total de bots
   * @param {number} userId - ID del usuario
   * @returns {Promise<number>} Número total de bots
   */
  async contarTotalBots(userId) {
    const result = await this.get(`/${userId}/count-total`);
    return result.totalBots;
  }

  /**
   * Pausar todos los bots (emergencia)
   * @param {number} userId - ID del usuario
   * @returns {Promise<Object>} Confirmación
   */
  async pausarTodosLosBots(userId) {
    return this.post(`/${userId}/pausar-todos`);
  }

  // Métodos de conveniencia

  /**
   * Crear bot con configuración básica
   * @param {number} userId - ID del usuario
   * @param {string} nombre - Nombre del bot
   * @param {string} estrategia - Estrategia
   * @param {number} budget - Presupuesto
   * @returns {Promise<Object>} Bot creado
   */
  async crearBotBasico(userId, nombre, estrategia, budget) {
    const parametrosDefault = this.obtenerParametrosDefault(estrategia);
    
    return this.crearBot(userId, {
      nombre,
      estrategia,
      parametros: parametrosDefault,
      budget,
      stopLoss: 15.0 // Stop loss por defecto 15%
    });
  }

  /**
   * Obtener parámetros por defecto según estrategia
   * @param {string} estrategia - Tipo de estrategia
   * @returns {Object} Parámetros por defecto
   */
  obtenerParametrosDefault(estrategia) {
    const defaults = {
      'BUY_LOW_SELL_HIGH': {
        buy_drop: 5,
        sell_gain: 10,
        check_interval: 300
      },
      'MOVING_AVERAGE': {
        short_period: 20,
        long_period: 50,
        signal_threshold: 2
      },
      'MOMENTUM': {
        momentum_period: 14,
        signal_strength: 70
      },
      'SCALPING': {
        profit_target: 0.5,
        max_trades_per_day: 10
      },
      'SWING_TRADING': {
        hold_period_days: 3,
        profit_target: 5
      }
    };

    return defaults[estrategia] || {};
  }

  /**
   * Obtener dashboard completo de bots
   * @param {number} userId - ID del usuario
   * @returns {Promise<Object>} Dashboard de bots
   */
  async obtenerDashboard(userId) {
    try {
      const [bots, estadisticas, ranking] = await Promise.all([
        this.obtenerBots(userId),
        this.obtenerEstadisticas(userId),
        this.obtenerRanking(userId, 5)
      ]);

      return {
        bots,
        estadisticas,
        ranking,
        totalBots: bots.length,
        botsActivos: bots.filter(b => b.activo).length,
        performanceTotal: bots.reduce((sum, b) => sum + parseFloat(b.performance || 0), 0),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error obteniendo dashboard de bots:', error);
      throw error;
    }
  }

  /**
   * Validar configuración de bot
   * @param {Object} botData - Datos del bot
   * @returns {Object} Resultado de validación
   */
  validarConfiguracion(botData) {
    const errores = [];

    if (!botData.nombre || botData.nombre.trim() === '') {
      errores.push('El nombre del bot es requerido');
    }

    if (!botData.estrategia) {
      errores.push('La estrategia es requerida');
    }

    if (!botData.budget || botData.budget <= 0) {
      errores.push('El budget debe ser mayor a 0');
    }

    if (!botData.stopLoss || botData.stopLoss <= 0 || botData.stopLoss >= 100) {
      errores.push('El stop loss debe estar entre 0% y 100%');
    }

    const estrategiasValidas = [
      'BUY_LOW_SELL_HIGH',
      'MOVING_AVERAGE',
      'MOMENTUM',
      'SCALPING',
      'SWING_TRADING'
    ];

    if (botData.estrategia && !estrategiasValidas.includes(botData.estrategia)) {
      errores.push('Estrategia inválida');
    }

    return {
      esValida: errores.length === 0,
      errores
    };
  }

  /**
   * Calcular ROI de un bot
   * @param {Object} bot - Datos del bot
   * @returns {number} ROI porcentual
   */
  calcularROI(bot) {
    if (!bot.budget || bot.budget === 0) return 0;
    return ((bot.performance / bot.budget) * 100).toFixed(2);
  }

  /**
   * Formatear bot para display
   * @param {Object} bot - Bot a formatear
   * @returns {Object} Bot formateado
   */
  formatearBot(bot) {
    const roi = this.calcularROI(bot);
    const esRentable = parseFloat(bot.performance || 0) > 0;

    return {
      ...bot,
      roi: parseFloat(roi),
      esRentable,
      estadoTexto: bot.activo ? 'Activo' : 'Inactivo',
      estadoClase: bot.activo ? 'active' : 'inactive',
      performanceClase: esRentable ? 'positive' : 'negative',
      performanceFormatted: `${esRentable ? '+' : ''}${bot.performance}`,
      roiFormatted: `${roi}%`
    };
  }

  /**
   * Obtener estrategias disponibles con descripciones
   * @returns {Array} Lista de estrategias
   */
  obtenerEstrategiasDisponibles() {
    return [
      {
        id: 'BUY_LOW_SELL_HIGH',
        nombre: 'Comprar Bajo, Vender Alto',
        descripcion: 'Estrategia básica que compra cuando el precio baja y vende cuando sube',
        nivelRiesgo: 'Bajo',
        recomendadoPara: 'Principiantes'
      },
      {
        id: 'MOVING_AVERAGE',
        nombre: 'Media Móvil',
        descripcion: 'Utiliza medias móviles para identificar tendencias',
        nivelRiesgo: 'Medio',
        recomendadoPara: 'Intermedios'
      },
      {
        id: 'MOMENTUM',
        nombre: 'Momentum Trading',
        descripcion: 'Sigue la fuerza del movimiento del precio',
        nivelRiesgo: 'Alto',
        recomendadoPara: 'Avanzados'
      },
      {
        id: 'SCALPING',
        nombre: 'Scalping',
        descripcion: 'Operaciones rápidas buscando pequeñas ganancias',
        nivelRiesgo: 'Muy Alto',
        recomendadoPara: 'Expertos'
      },
      {
        id: 'SWING_TRADING',
        nombre: 'Swing Trading',
        descripcion: 'Mantiene posiciones por varios días aprovechando oscilaciones',
        nivelRiesgo: 'Medio',
        recomendadoPara: 'Intermedios'
      }
    ];
  }
}

// Exportar instancia singleton
export default new TradingBotService();