// src/services/tradingService.js
import BaseService from './baseService';

class TradingService extends BaseService {
  constructor() {
    super('/trading');
  }

  /**
   * Comprar acciones
   * @param {number} userId - ID del usuario
   * @param {Object} orderData - Datos de la orden
   * @param {string} orderData.symbol - Símbolo de la acción
   * @param {number} orderData.cantidad - Cantidad de acciones
   * @param {string} orderData.ejecutadaPor - 'MANUAL' o 'BOT'
   * @returns {Promise<Object>} Transacción creada
   */
  async comprarAccion(userId, orderData) {
    return this.post(`/${userId}/comprar`, orderData);
  }

  /**
   * Vender acciones
   * @param {number} userId - ID del usuario
   * @param {Object} orderData - Datos de la orden
   * @param {string} orderData.symbol - Símbolo de la acción
   * @param {number} orderData.cantidad - Cantidad de acciones
   * @param {string} orderData.ejecutadaPor - 'MANUAL' o 'BOT'
   * @returns {Promise<Object>} Transacción creada
   */
  async venderAccion(userId, orderData) {
    return this.post(`/${userId}/vender`, orderData);
  }

  /**
   * Obtener cotización sin ejecutar la operación
   * @param {Object} quoteData - Datos para cotización
   * @param {string} quoteData.symbol - Símbolo de la acción
   * @param {number} quoteData.cantidad - Cantidad de acciones
   * @param {boolean} quoteData.esCompra - true para compra, false para venta
   * @returns {Promise<Object>} Cotización
   */
  async obtenerCotizacion(quoteData) {
    return this.post('/cotizacion', quoteData);
  }

  /**
   * Verificar si puede comprar acciones
   * @param {number} userId - ID del usuario
   * @param {Object} validationData - Datos para validar
   * @param {string} validationData.symbol - Símbolo de la acción
   * @param {number} validationData.cantidad - Cantidad de acciones
   * @returns {Promise<Object>} Resultado de validación
   */
  async puedeComprar(userId, validationData) {
    return this.post(`/${userId}/puede-comprar`, validationData);
  }

  /**
   * Verificar si puede vender acciones
   * @param {number} userId - ID del usuario
   * @param {Object} validationData - Datos para validar
   * @param {string} validationData.symbol - Símbolo de la acción
   * @param {number} validationData.cantidad - Cantidad de acciones
   * @returns {Promise<Object>} Resultado de validación
   */
  async puedeVender(userId, validationData) {
    return this.post(`/${userId}/puede-vender`, validationData);
  }

  /**
   * Validar múltiples operaciones
   * @param {number} userId - ID del usuario
   * @param {Array} operaciones - Array de operaciones a validar
   * @returns {Promise<Object>} Resultados de validación
   */
  async validarOperaciones(userId, operaciones) {
    return this.post(`/${userId}/validar-operaciones`, { operaciones });
  }

  // Métodos de conveniencia para crear órdenes

  /**
   * Crear orden de compra con validación previa
   * @param {number} userId - ID del usuario
   * @param {string} symbol - Símbolo de la acción
   * @param {number} cantidad - Cantidad de acciones
   * @param {boolean} validarAntes - Validar antes de ejecutar
   * @returns {Promise<Object>} Resultado de la operación
   */
  async crearOrdenCompra(userId, symbol, cantidad, validarAntes = true) {
    try {
      // Validar primero si está habilitado
      if (validarAntes) {
        const validacion = await this.puedeComprar(userId, { symbol, cantidad });
        if (!validacion.puedeComprar) {
          throw new Error('No se puede ejecutar la compra: balance insuficiente');
        }
      }

      // Ejecutar compra
      return await this.comprarAccion(userId, {
        symbol,
        cantidad,
        ejecutadaPor: 'MANUAL'
      });
    } catch (error) {
      console.error('Error en orden de compra:', error);
      throw error;
    }
  }

  /**
   * Crear orden de venta con validación previa
   * @param {number} userId - ID del usuario
   * @param {string} symbol - Símbolo de la acción
   * @param {number} cantidad - Cantidad de acciones
   * @param {boolean} validarAntes - Validar antes de ejecutar
   * @returns {Promise<Object>} Resultado de la operación
   */
  async crearOrdenVenta(userId, symbol, cantidad, validarAntes = true) {
    try {
      // Validar primero si está habilitado
      if (validarAntes) {
        const validacion = await this.puedeVender(userId, { symbol, cantidad });
        if (!validacion.puedeVender) {
          throw new Error('No se puede ejecutar la venta: acciones insuficientes');
        }
      }

      // Ejecutar venta
      return await this.venderAccion(userId, {
        symbol,
        cantidad,
        ejecutadaPor: 'MANUAL'
      });
    } catch (error) {
      console.error('Error en orden de venta:', error);
      throw error;
    }
  }

  /**
   * Obtener cotización rápida para mostrar en UI
   * @param {string} symbol - Símbolo de la acción
   * @param {number} cantidad - Cantidad de acciones
   * @returns {Promise<Object>} Cotización para compra y venta
   */
  async obtenerCotizacionRapida(symbol, cantidad = 1) {
    try {
      const [cotizacionCompra, cotizacionVenta] = await Promise.all([
        this.obtenerCotizacion({ symbol, cantidad, esCompra: true }),
        this.obtenerCotizacion({ symbol, cantidad, esCompra: false })
      ]);

      return {
        symbol,
        cantidad,
        compra: cotizacionCompra.cotizacion,
        venta: cotizacionVenta.cotizacion,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error obteniendo cotización rápida:', error);
      throw error;
    }
  }

  /**
   * Validar y ejecutar orden (compra o venta)
   * @param {number} userId - ID del usuario
   * @param {Object} orderData - Datos de la orden
   * @param {string} orderData.tipo - 'COMPRA' o 'VENTA'
   * @param {string} orderData.symbol - Símbolo de la acción
   * @param {number} orderData.cantidad - Cantidad de acciones
   * @returns {Promise<Object>} Resultado de la operación
   */
  async ejecutarOrden(userId, orderData) {
    const { tipo, symbol, cantidad } = orderData;
    
    if (tipo === 'COMPRA') {
      return this.crearOrdenCompra(userId, symbol, cantidad);
    } else if (tipo === 'VENTA') {
      return this.crearOrdenVenta(userId, symbol, cantidad);
    } else {
      throw new Error('Tipo de orden inválido. Use "COMPRA" o "VENTA"');
    }
  }
}

// Exportar instancia singleton
export default new TradingService();