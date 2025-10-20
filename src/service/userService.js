// src/services/userService.js
import BaseService from './baseService';

class UserService extends BaseService {
  constructor() {
    super('/users');
  }

  /**
   * Obtener perfil del usuario
   * @param {number} userId - ID del usuario
   * @returns {Promise<Object>} Perfil del usuario
   */
  async obtenerPerfil(userId) {
    return this.get(`/${userId}/perfil`);
  }

  /**
   * Obtener ranking completo de usuarios
   * @returns {Promise<Array>} Ranking de usuarios
   */
  async obtenerRanking() {
    return this.get('/ranking');
  }

  /**
   * Obtener top del ranking
   * @param {number} limite - Número de usuarios top
   * @returns {Promise<Array>} Top usuarios
   */
  async obtenerTopRanking(limite = 10) {
    return this.get(`/ranking/top/${limite}`);
  }

  /**
   * Obtener posición de un usuario en el ranking
   * @param {number} userId - ID del usuario
   * @returns {Promise<Object>} Posición en ranking
   */
  async obtenerPosicionRanking(userId) {
    return this.get(`/${userId}/posicion-ranking`);
  }

  /**
   * Obtener balance actual del usuario
   * @param {number} userId - ID del usuario
   * @returns {Promise<number>} Balance actual
   */
  async obtenerBalance(userId) {
    const result = await this.get(`/${userId}/balance`);
    return result.balanceActual;
  }

  /**
   * Verificar si tiene suficiente balance
   * @param {number} userId - ID del usuario
   * @param {number} cantidad - Cantidad a verificar
   * @returns {Promise<Object>} Resultado de verificación
   */
  async verificarBalance(userId, cantidad) {
    return this.post(`/${userId}/verificar-balance`, { cantidad });
  }

  /**
   * Crear o encontrar usuario por OAuth
   * @param {Object} userData - Datos del usuario OAuth
   * @param {string} userData.googleId - ID de Google
   * @param {string} userData.email - Email
   * @param {string} userData.name - Nombre
   * @param {string} userData.avatar - URL del avatar
   * @returns {Promise<Object>} Usuario creado/encontrado
   */
  async crearOEncontrarUsuario(userData) {
    return this.post('/oauth', userData);
  }

  /**
   * Obtener estadísticas generales del usuario
   * @param {number} userId - ID del usuario
   * @returns {Promise<Object>} Estadísticas del usuario
   */
  async obtenerEstadisticas(userId) {
    return this.get(`/${userId}/estadisticas`);
  }

  // Métodos de autenticación y sesión

  /**
   * Inicializar sesión de usuario
   * @param {Object} authData - Datos de autenticación
   * @returns {Promise<Object>} Datos del usuario autenticado
   */
  async inicializarSesion(authData) {
    try {
      const usuario = await this.crearOEncontrarUsuario(authData);
      
      // Guardar datos en localStorage
      localStorage.setItem('userId', usuario.id);
      localStorage.setItem('userEmail', usuario.email);
      localStorage.setItem('userName', usuario.name);
      
      return usuario;
    } catch (error) {
      console.error('Error inicializando sesión:', error);
      throw error;
    }
  }

  /**
   * Cerrar sesión
   */
  cerrarSesion() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
  }

  /**
   * Obtener datos del usuario de la sesión actual
   * @returns {Object|null} Datos del usuario o null
   */
  obtenerUsuarioSesion() {
    const userId = localStorage.getItem('userId');
    const userEmail = localStorage.getItem('userEmail');
    const userName = localStorage.getItem('userName');
    
    if (userId && userEmail && userName) {
      return {
        id: parseInt(userId),
        email: userEmail,
        name: userName
      };
    }
    
    return null;
  }

  /**
   * Verificar si hay sesión activa
   * @returns {boolean} True si hay sesión activa
   */
  hayeSesionActiva() {
    return this.obtenerUsuarioSesion() !== null;
  }

  // Métodos de conveniencia para análisis

  /**
   * Obtener dashboard completo del usuario
   * @param {number} userId - ID del usuario
   * @returns {Promise<Object>} Dashboard completo
   */
  async obtenerDashboard(userId) {
    try {
      const [perfil, estadisticas, posicionRanking, balance] = await Promise.all([
        this.obtenerPerfil(userId),
        this.obtenerEstadisticas(userId),
        this.obtenerPosicionRanking(userId).catch(() => null),
        this.obtenerBalance(userId)
      ]);

      return {
        perfil,
        estadisticas,
        posicionRanking,
        balance,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error obteniendo dashboard:', error);
      throw error;
    }
  }

  /**
   * Calcular métricas de performance del usuario
   * @param {Object} estadisticas - Estadísticas del usuario
   * @returns {Object} Métricas calculadas
   */
  calcularMetricasPerformance(estadisticas) {
    const { perfil, gananciaPerdida, porcentajeGanancia } = estadisticas;
    
    const nivelRiesgo = this.calcularNivelRiesgo(porcentajeGanancia);
    const clasificacionInversor = this.clasificarInversor(gananciaPerdida, porcentajeGanancia);
    
    return {
      balanceInicial: perfil.balanceInicial,
      balanceActual: perfil.balanceActual || perfil.balanceInicial,
      gananciaPerdida,
      porcentajeGanancia,
      nivelRiesgo,
      clasificacionInversor,
      diasDesdeRegistro: this.calcularDiasDesdeRegistro(perfil.createdAt),
      retornoDiario: this.calcularRetornoDiario(porcentajeGanancia, perfil.createdAt)
    };
  }

  /**
   * Calcular nivel de riesgo basado en la variación
   * @param {number} porcentajeGanancia - Porcentaje de ganancia
   * @returns {string} Nivel de riesgo
   */
  calcularNivelRiesgo(porcentajeGanancia) {
    const variacion = Math.abs(porcentajeGanancia);
    
    if (variacion < 5) return 'Conservador';
    if (variacion < 15) return 'Moderado';
    if (variacion < 30) return 'Agresivo';
    return 'Muy Agresivo';
  }

  /**
   * Clasificar tipo de inversor
   * @param {number} gananciaPerdida - Ganancia/pérdida absoluta
   * @param {number} porcentajeGanancia - Porcentaje de ganancia
   * @returns {string} Clasificación del inversor
   */
  clasificarInversor(gananciaPerdida, porcentajeGanancia) {
    if (porcentajeGanancia > 20) return 'Experto';
    if (porcentajeGanancia > 10) return 'Avanzado';
    if (porcentajeGanancia > 0) return 'Intermedio';
    if (porcentajeGanancia > -10) return 'Principiante';
    return 'Aprendiz';
  }

  /**
   * Calcular días desde el registro
   * @param {string} fechaRegistro - Fecha de registro
   * @returns {number} Días desde el registro
   */
  calcularDiasDesdeRegistro(fechaRegistro) {
    const registro = new Date(fechaRegistro);
    const ahora = new Date();
    const diferencia = ahora - registro;
    return Math.floor(diferencia / (1000 * 60 * 60 * 24));
  }

  /**
   * Calcular retorno diario promedio
   * @param {number} porcentajeGanancia - Porcentaje total de ganancia
   * @param {string} fechaRegistro - Fecha de registro
   * @returns {number} Retorno diario promedio
   */
  calcularRetornoDiario(porcentajeGanancia, fechaRegistro) {
    const dias = this.calcularDiasDesdeRegistro(fechaRegistro);
    return dias > 0 ? (porcentajeGanancia / dias) : 0;
  }

  /**
   * Formatear balance para display
   * @param {number} balance - Balance a formatear
   * @param {string} moneda - Moneda (default: USD)
   * @returns {string} Balance formateado
   */
  formatearBalance(balance, moneda = 'USD') {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: moneda,
      minimumFractionDigits: 2
    }).format(balance);
  }

  /**
   * Validar datos de usuario para OAuth
   * @param {Object} userData - Datos del usuario
   * @returns {Object} Resultado de validación
   */
  validarDatosUsuario(userData) {
    const errores = [];

    if (!userData.googleId || userData.googleId.trim() === '') {
      errores.push('Google ID es requerido');
    }

    if (!userData.email || !this.validarEmail(userData.email)) {
      errores.push('Email válido es requerido');
    }

    if (!userData.name || userData.name.trim() === '') {
      errores.push('Nombre es requerido');
    }

    return {
      esValido: errores.length === 0,
      errores
    };
  }

  /**
   * Validar formato de email
   * @param {string} email - Email a validar
   * @returns {boolean} True si es válido
   */
  validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
}

// Exportar instancia singleton
export default new UserService();