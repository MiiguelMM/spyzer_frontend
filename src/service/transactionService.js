// src/services/transactionService.js
import BaseService from './baseService';

class TransactionService extends BaseService {
  constructor() {
    super('/transactions');
  }

  /**
   * Obtener historial completo de transacciones
   * @param {number} userId - ID del usuario
   * @returns {Promise<Array>} Lista de transacciones
   */
  async obtenerHistorial(userId) {
    return this.get(`/${userId}`);
  }

  /**
   * Obtener transacciones recientes (últimas 10)
   * @param {number} userId - ID del usuario
   * @returns {Promise<Array>} Transacciones recientes
   */
  async obtenerRecientes(userId) {
    return this.get(`/${userId}/recientes`);
  }

  /**
   * Obtener transacciones por tipo
   * @param {number} userId - ID del usuario
   * @param {string} tipo - 'BUY' o 'SELL'
   * @returns {Promise<Array>} Transacciones filtradas
   */
  async obtenerPorTipo(userId, tipo) {
    return this.get(`/${userId}/tipo/${tipo}`);
  }

  /**
   * Obtener transacciones de un símbolo específico
   * @param {number} userId - ID del usuario
   * @param {string} symbol - Símbolo de la acción
   * @returns {Promise<Array>} Transacciones del símbolo
   */
  async obtenerPorSimbolo(userId, symbol) {
    return this.get(`/${userId}/symbol/${symbol}`);
  }

  /**
   * Obtener estadísticas de trading
   * @param {number} userId - ID del usuario
   * @returns {Promise<Object>} Estadísticas
   */
  async obtenerEstadisticas(userId) {
    return this.get(`/${userId}/estadisticas`);
  }

  /**
   * Obtener volumen total operado
   * @param {number} userId - ID del usuario
   * @returns {Promise<number>} Volumen total
   */
  async obtenerVolumenTotal(userId) {
    const result = await this.get(`/${userId}/volumen-total`);
    return result.volumenTotal;
  }

  /**
   * Obtener volumen operado por símbolo
   * @param {number} userId - ID del usuario
   * @returns {Promise<Object>} Volumen por símbolo
   */
  async obtenerVolumenPorSimbolo(userId) {
    return this.get(`/${userId}/volumen-por-simbolo`);
  }

  /**
   * Obtener actividad diaria
   * @param {number} userId - ID del usuario
   * @param {Date} desde - Fecha inicio
   * @param {Date} hasta - Fecha fin
   * @returns {Promise<Array>} Actividad por día
   */
  async obtenerActividadDiaria(userId, desde, hasta) {
    return this.get(`/${userId}/actividad-diaria`, {
      desde: desde.toISOString(),
      hasta: hasta.toISOString()
    });
  }

  /**
   * Obtener top símbolos más operados
   * @param {number} userId - ID del usuario
   * @param {number} limite - Límite de resultados
   * @returns {Promise<Array>} Top símbolos
   */
  async obtenerTopSimbolos(userId, limite = 10) {
    return this.get(`/${userId}/top-simbolos`, { limite });
  }

  /**
   * Contar total de transacciones
   * @param {number} userId - ID del usuario
   * @returns {Promise<number>} Total de transacciones
   */
  async contarTransacciones(userId) {
    const result = await this.get(`/${userId}/count`);
    return result.totalTransacciones;
  }

  /**
   * Contar transacciones por tipo
   * @param {number} userId - ID del usuario
   * @param {string} tipo - 'BUY' o 'SELL'
   * @returns {Promise<number>} Número de transacciones
   */
  async contarPorTipo(userId, tipo) {
    const result = await this.get(`/${userId}/count/${tipo}`);
    return result.count;
  }

  /**
   * Verificar si ha operado un símbolo
   * @param {number} userId - ID del usuario
   * @param {string} symbol - Símbolo
   * @returns {Promise<boolean>} True si ha operado
   */
  async haOperadoSimbolo(userId, symbol) {
    const result = await this.get(`/${userId}/ha-operado/${symbol}`);
    return result.haOperado;
  }

  // Métodos de análisis y conveniencia

  /**
   * Obtener dashboard de transacciones
   * @param {number} userId - ID del usuario
   * @returns {Promise<Object>} Dashboard completo
   */
  async obtenerDashboard(userId) {
    try {
      const [recientes, estadisticas, topSimbolos] = await Promise.all([
        this.obtenerRecientes(userId),
        this.obtenerEstadisticas(userId),
        this.obtenerTopSimbolos(userId, 5)
      ]);

      return {
        recientes,
        estadisticas,
        topSimbolos,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error obteniendo dashboard de transacciones:', error);
      throw error;
    }
  }

  /**
   * Obtener actividad del último mes
   * @param {number} userId - ID del usuario
   * @returns {Promise<Array>} Actividad del mes
   */
  async obtenerActividadMesActual(userId) {
    const hoy = new Date();
    const hace30Dias = new Date();
    hace30Dias.setDate(hoy.getDate() - 30);

    return this.obtenerActividadDiaria(userId, hace30Dias, hoy);
  }

  /**
   * Obtener resumen de compras vs ventas
   * @param {number} userId - ID del usuario
   * @returns {Promise<Object>} Resumen
   */
  async obtenerResumenComprasVentas(userId) {
    try {
      const [compras, ventas] = await Promise.all([
        this.contarPorTipo(userId, 'BUY'),
        this.contarPorTipo(userId, 'SELL')
      ]);

      const total = compras + ventas;
      const porcentajeCompras = total > 0 ? (compras / total) * 100 : 0;
      const porcentajeVentas = total > 0 ? (ventas / total) * 100 : 0;

      return {
        compras,
        ventas,
        total,
        porcentajeCompras: parseFloat(porcentajeCompras.toFixed(2)),
        porcentajeVentas: parseFloat(porcentajeVentas.toFixed(2))
      };
    } catch (error) {
      console.error('Error obteniendo resumen compras/ventas:', error);
      throw error;
    }
  }

  /**
   * Calcular métricas de trading
   * @param {Array} transacciones - Lista de transacciones
   * @returns {Object} Métricas calculadas
   */
  calcularMetricas(transacciones) {
    if (!transacciones || transacciones.length === 0) {
      return {
        totalTransacciones: 0,
        volumenTotal: 0,
        promedioOperacion: 0,
        transaccionMasGrande: 0,
        transaccionMasPequena: 0
      };
    }

    const valores = transacciones.map(t => 
      parseFloat(t.cantidad) * parseFloat(t.precio)
    );

    const volumenTotal = valores.reduce((sum, val) => sum + val, 0);
    const promedioOperacion = volumenTotal / transacciones.length;
    const transaccionMasGrande = Math.max(...valores);
    const transaccionMasPequena = Math.min(...valores);

    return {
      totalTransacciones: transacciones.length,
      volumenTotal: parseFloat(volumenTotal.toFixed(2)),
      promedioOperacion: parseFloat(promedioOperacion.toFixed(2)),
      transaccionMasGrande: parseFloat(transaccionMasGrande.toFixed(2)),
      transaccionMasPequena: parseFloat(transaccionMasPequena.toFixed(2))
    };
  }

  /**
   * Agrupar transacciones por período
   * @param {Array} transacciones - Lista de transacciones
   * @param {string} periodo - 'dia', 'semana', 'mes'
   * @returns {Object} Transacciones agrupadas
   */
  agruparPorPeriodo(transacciones, periodo = 'dia') {
    const agrupadas = {};

    transacciones.forEach(transaccion => {
      const fecha = new Date(transaccion.timestamp);
      let clave;

      switch (periodo) {
        case 'dia':
          clave = fecha.toISOString().split('T')[0];
          break;
        case 'semana':
          const inicioSemana = new Date(fecha);
          inicioSemana.setDate(fecha.getDate() - fecha.getDay());
          clave = inicioSemana.toISOString().split('T')[0];
          break;
        case 'mes':
          clave = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
          break;
        default:
          clave = fecha.toISOString().split('T')[0];
      }

      if (!agrupadas[clave]) {
        agrupadas[clave] = [];
      }
      agrupadas[clave].push(transaccion);
    });

    return agrupadas;
  }

  /**
   * Formatear transacción para display
   * @param {Object} transaccion - Transacción a formatear
   * @returns {Object} Transacción formateada
   */
  formatearTransaccion(transaccion) {
    const esCompra = transaccion.tipo === 'BUY';
    const valorTotal = parseFloat(transaccion.cantidad) * parseFloat(transaccion.precio);

    return {
      ...transaccion,
      tipoTexto: esCompra ? 'Compra' : 'Venta',
      tipoClase: esCompra ? 'buy' : 'sell',
      tipoColor: esCompra ? '#4CAF50' : '#f44336',
      valorTotal: valorTotal.toFixed(2),
      fechaFormato: new Date(transaccion.timestamp).toLocaleString('es-ES'),
      ejecutadaPorTexto: transaccion.ejecutadaPor === 'MANUAL' ? 'Manual' : 'Bot'
    };
  }

  /**
   * Filtrar transacciones por múltiples criterios
   * @param {Array} transacciones - Lista de transacciones
   * @param {Object} filtros - Criterios de filtrado
   * @returns {Array} Transacciones filtradas
   */
  filtrarTransacciones(transacciones, filtros = {}) {
    let resultado = [...transacciones];

    // Filtrar por tipo
    if (filtros.tipo) {
      resultado = resultado.filter(t => t.tipo === filtros.tipo);
    }

    // Filtrar por símbolo
    if (filtros.symbol) {
      resultado = resultado.filter(t => 
        t.symbol.toLowerCase().includes(filtros.symbol.toLowerCase())
      );
    }

    // Filtrar por ejecutada por
    if (filtros.ejecutadaPor) {
      resultado = resultado.filter(t => t.ejecutadaPor === filtros.ejecutadaPor);
    }

    // Filtrar por rango de fechas
    if (filtros.desde) {
      const desde = new Date(filtros.desde);
      resultado = resultado.filter(t => new Date(t.timestamp) >= desde);
    }

    if (filtros.hasta) {
      const hasta = new Date(filtros.hasta);
      resultado = resultado.filter(t => new Date(t.timestamp) <= hasta);
    }

    // Filtrar por rango de valor
    if (filtros.valorMin !== undefined) {
      resultado = resultado.filter(t => {
        const valor = parseFloat(t.cantidad) * parseFloat(t.precio);
        return valor >= filtros.valorMin;
      });
    }

    if (filtros.valorMax !== undefined) {
      resultado = resultado.filter(t => {
        const valor = parseFloat(t.cantidad) * parseFloat(t.precio);
        return valor <= filtros.valorMax;
      });
    }

    return resultado;
  }

  /**
   * Exportar transacciones a CSV
   * @param {Array} transacciones - Lista de transacciones
   * @returns {string} Contenido CSV
   */
  exportarACSV(transacciones) {
    const headers = ['Fecha', 'Tipo', 'Símbolo', 'Cantidad', 'Precio', 'Valor Total', 'Ejecutada Por'];
    const rows = transacciones.map(t => {
      const valorTotal = parseFloat(t.cantidad) * parseFloat(t.precio);
      return [
        new Date(t.timestamp).toLocaleString('es-ES'),
        t.tipo === 'BUY' ? 'Compra' : 'Venta',
        t.symbol,
        t.cantidad,
        t.precio,
        valorTotal.toFixed(2),
        t.ejecutadaPor === 'MANUAL' ? 'Manual' : 'Bot'
      ];
    });

    const csv = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');

    return csv;
  }
}

// Exportar instancia singleton
export default new TransactionService();