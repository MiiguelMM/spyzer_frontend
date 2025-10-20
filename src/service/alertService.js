// src/services/alertService.js
import BaseService from './baseService';

class AlertService extends BaseService {
  constructor() {
    super('/alerts');
  }

  /**
   * Crear una nueva alerta
   * @param {number} userId - ID del usuario
   * @param {Object} alertData - Datos de la alerta
   * @param {string} alertData.symbol - Símbolo de la acción
   * @param {string} alertData.tipo - Tipo de alerta (PRICE_UP, PRICE_DOWN, PRICE_EQUAL)
   * @param {number} alertData.valorTrigger - Valor que dispara la alerta
   * @param {string} alertData.mensajePersonalizado - Mensaje personalizado
   * @returns {Promise<Object>} Alerta creada
   */
  async crearAlerta(userId, alertData) {
    return this.post(`/${userId}`, alertData);
  }

  /**
   * Obtener todas las alertas de un usuario
   * @param {number} userId - ID del usuario
   * @returns {Promise<Array>} Lista de alertas
   */
  async obtenerAlertas(userId) {
    return this.get(`/${userId}`);
  }

  /**
   * Obtener solo las alertas activas de un usuario
   * @param {number} userId - ID del usuario
   * @returns {Promise<Array>} Lista de alertas activas
   */
  async obtenerAlertasActivas(userId) {
    return this.get(`/${userId}/activas`);
  }

  /**
   * Activar/Desactivar una alerta
   * @param {number} userId - ID del usuario
   * @param {number} alertaId - ID de la alerta
   * @returns {Promise<Object>} Alerta actualizada
   */
  async toggleAlerta(userId, alertaId) {
    return this.patch(`/${userId}/${alertaId}/toggle`);
  }

  /**
   * Reactivar una alerta ya disparada
   * @param {number} userId - ID del usuario
   * @param {number} alertaId - ID de la alerta
   * @returns {Promise<Object>} Alerta reactivada
   */
  async reactivarAlerta(userId, alertaId) {
    return this.patch(`/${userId}/${alertaId}/reactivar`);
  }

  /**
   * Eliminar una alerta
   * @param {number} userId - ID del usuario
   * @param {number} alertaId - ID de la alerta
   * @returns {Promise<Object>} Confirmación de eliminación
   */
  async eliminarAlerta(userId, alertaId) {
    return this.delete(`/${userId}/${alertaId}`);
  }

  /**
   * Actualizar mensaje personalizado de una alerta
   * @param {number} userId - ID del usuario
   * @param {number} alertaId - ID de la alerta
   * @param {string} nuevoMensaje - Nuevo mensaje
   * @returns {Promise<Object>} Alerta actualizada
   */
  async actualizarMensaje(userId, alertaId, nuevoMensaje) {
    return this.patch(`/${userId}/${alertaId}/mensaje`, { nuevoMensaje });
  }

  /**
   * Actualizar valor trigger de una alerta
   * @param {number} userId - ID del usuario
   * @param {number} alertaId - ID de la alerta
   * @param {number} nuevoValor - Nuevo valor trigger
   * @returns {Promise<Object>} Alerta actualizada
   */
  async actualizarTrigger(userId, alertaId, nuevoValor) {
    return this.patch(`/${userId}/${alertaId}/trigger`, { nuevoValor });
  }

  /**
   * Obtener estadísticas de alertas del usuario
   * @param {number} userId - ID del usuario
   * @returns {Promise<Object>} Estadísticas
   */
  async obtenerEstadisticas(userId) {
    return this.get(`/${userId}/estadisticas`);
  }

  /**
   * Contar alertas activas
   * @param {number} userId - ID del usuario
   * @returns {Promise<number>} Número de alertas activas
   */
  async contarAlertasActivas(userId) {
    const result = await this.get(`/${userId}/count-activas`);
    return result.alertasActivas;
  }

  /**
   * Verificar alertas para un símbolo (testing)
   * @param {string} symbol - Símbolo
   * @param {number} precioActual - Precio actual
   * @returns {Promise<Object>} Resultado de verificación
   */
  async verificarAlertas(symbol, precioActual) {
    return this.post(`/verificar/${symbol}`, { precioActual });
  }

  // Métodos de conveniencia

  /**
   * Crear alerta rápida de precio
   * @param {number} userId - ID del usuario
   * @param {string} symbol - Símbolo
   * @param {number} precio - Precio objetivo
   * @param {boolean} esAlza - True para alerta de alza, false para baja
   * @param {string} mensaje - Mensaje personalizado opcional
   * @returns {Promise<Object>} Alerta creada
   */
  async crearAlertaPrecio(userId, symbol, precio, esAlza = true, mensaje = '') {
    return this.crearAlerta(userId, {
      symbol: symbol.toUpperCase(),
      tipo: esAlza ? 'PRICE_UP' : 'PRICE_DOWN',
      valorTrigger: precio,
      mensajePersonalizado: mensaje
    });
  }

  /**
   * Crear múltiples alertas de una vez
   * @param {number} userId - ID del usuario
   * @param {Array} alertas - Array de alertas a crear
   * @returns {Promise<Array>} Resultados de creación
   */
  async crearMultiplesAlertas(userId, alertas) {
    const promesas = alertas.map(alerta => 
      this.crearAlerta(userId, alerta).catch(error => ({
        error: error.message,
        alerta
      }))
    );

    return Promise.all(promesas);
  }

  /**
   * Obtener alertas agrupadas por estado
   * @param {number} userId - ID del usuario
   * @returns {Promise<Object>} Alertas agrupadas
   */
  async obtenerAlertasAgrupadas(userId) {
    const alertas = await this.obtenerAlertas(userId);
    
    return {
      activas: alertas.filter(a => a.activa && !a.disparada),
      inactivas: alertas.filter(a => !a.activa),
      disparadas: alertas.filter(a => a.disparada),
      total: alertas.length
    };
  }

  /**
   * Obtener alertas por símbolo
   * @param {number} userId - ID del usuario
   * @param {string} symbol - Símbolo
   * @returns {Promise<Array>} Alertas del símbolo
   */
  async obtenerAlertasPorSimbolo(userId, symbol) {
    const alertas = await this.obtenerAlertas(userId);
    return alertas.filter(alerta => 
      alerta.symbol.toUpperCase() === symbol.toUpperCase()
    );
  }

  /**
   * Validar datos de alerta antes de crear
   * @param {Object} alertData - Datos de la alerta
   * @returns {Object} Resultado de validación
   */
  validarAlerta(alertData) {
    const errores = [];

    if (!alertData.symbol || alertData.symbol.trim() === '') {
      errores.push('El símbolo es requerido');
    }

    if (!alertData.tipo) {
      errores.push('El tipo de alerta es requerido');
    }

    if (!alertData.valorTrigger || alertData.valorTrigger <= 0) {
      errores.push('El valor trigger debe ser mayor a 0');
    }

    const tiposValidos = ['PRICE_UP', 'PRICE_DOWN', 'PRICE_EQUAL', 'VOLUME_HIGH'];
    if (alertData.tipo && !tiposValidos.includes(alertData.tipo)) {
      errores.push('Tipo de alerta inválido');
    }

    return {
      esValida: errores.length === 0,
      errores
    };
  }

  /**
   * Formatear alerta para display
   * @param {Object} alerta - Alerta a formatear
   * @returns {Object} Alerta formateada
   */
  formatearAlerta(alerta) {
    const tipoTexto = {
      'PRICE_UP': 'Precio sube a',
      'PRICE_DOWN': 'Precio baja a',
      'PRICE_EQUAL': 'Precio llega a',
      'VOLUME_HIGH': 'Volumen supera'
    };

    return {
      ...alerta,
      tipoTexto: tipoTexto[alerta.tipoAlerta] || alerta.tipoAlerta,
      estadoTexto: alerta.disparada ? 'Disparada' : (alerta.activa ? 'Activa' : 'Inactiva'),
      estadoClase: alerta.disparada ? 'triggered' : (alerta.activa ? 'active' : 'inactive'),
      fechaCreacion: new Date(alerta.createdAt).toLocaleDateString(),
      fechaDisparo: alerta.triggeredAt ? new Date(alerta.triggeredAt).toLocaleDateString() : null
    };
  }

  /**
   * Obtener resumen de alertas para dashboard
   * @param {number} userId - ID del usuario
   * @returns {Promise<Object>} Resumen de alertas
   */
  async obtenerResumen(userId) {
    try {
      const [alertasAgrupadas, estadisticas] = await Promise.all([
        this.obtenerAlertasAgrupadas(userId),
        this.obtenerEstadisticas(userId)
      ]);

      return {
        ...alertasAgrupadas,
        estadisticas,
        ultimasDisparadas: alertasAgrupadas.disparadas
          .sort((a, b) => new Date(b.triggeredAt) - new Date(a.triggeredAt))
          .slice(0, 5)
      };
    } catch (error) {
      console.error('Error obteniendo resumen de alertas:', error);
      throw error;
    }
  }
}

// Exportar instancia singleton
export default new AlertService();