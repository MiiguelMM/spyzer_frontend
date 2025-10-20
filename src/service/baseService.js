// src/services/baseService.js
import apiClient from '../config/axiosConfig';

/**
 * Clase base para todos los services
 * Proporciona métodos comunes para hacer requests HTTP
 */
class BaseService {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  /**
   * GET request
   * @param {string} endpoint - Endpoint relativo
   * @param {Object} params - Parámetros de query
   * @returns {Promise} Response data
   */
  async get(endpoint = '', params = {}) {
    try {
      const response = await apiClient.get(`${this.baseURL}${endpoint}`, { params });
      return response.data;
    } catch (error) {
      this.handleError(error, 'GET', endpoint);
      throw error;
    }
  }

  /**
   * POST request
   * @param {string} endpoint - Endpoint relativo
   * @param {Object} data - Datos a enviar
   * @returns {Promise} Response data
   */
  async post(endpoint = '', data = {}) {
    try {
      const response = await apiClient.post(`${this.baseURL}${endpoint}`, data);
      return response.data;
    } catch (error) {
      this.handleError(error, 'POST', endpoint);
      throw error;
    }
  }

  /**
   * PUT request
   * @param {string} endpoint - Endpoint relativo
   * @param {Object} data - Datos a enviar
   * @returns {Promise} Response data
   */
  async put(endpoint = '', data = {}) {
    try {
      const response = await apiClient.put(`${this.baseURL}${endpoint}`, data);
      return response.data;
    } catch (error) {
      this.handleError(error, 'PUT', endpoint);
      throw error;
    }
  }

  /**
 * PATCH request
 * @param {string} endpoint - Endpoint relativo
 * @param {Object} data - Datos a enviar
 * @returns {Promise} Response data
 */
  async patch(endpoint = '', data = {}) {
    try {
      const response = await apiClient.patch(`${this.baseURL}${endpoint}`, data);
      return response.data;
    } catch (error) {
      this.handleError(error, 'PATCH', endpoint);
      throw error;
    }
  }

  /**
   * DELETE request
   * @param {string} endpoint - Endpoint relativo
   * @returns {Promise} Response data
   */
  async delete(endpoint = '') {
    try {
      const response = await apiClient.delete(`${this.baseURL}${endpoint}`);
      return response.data;
    } catch (error) {
      this.handleError(error, 'DELETE', endpoint);
      throw error;
    }
  }

  /**
   * Manejo centralizado de errores
   * @param {Error} error - Error object
   * @param {string} method - HTTP method
   * @param {string} endpoint - Endpoint
   */
  handleError(error, method, endpoint) {
    const errorInfo = {
      method,
      endpoint: `${this.baseURL}${endpoint}`,
      status: error.response?.status,
      message: error.response?.data?.error || error.message,
      timestamp: new Date().toISOString()
    };

    console.error(`API Error [${method}]:`, errorInfo);

    // Puedes agregar aquí logging a servicios externos
    // o notificaciones toast específicas
  }

  /**
   * Construir URL con parámetros de path
   * @param {string} template - Template con placeholders {id}
   * @param {Object} params - Parámetros para reemplazar
   * @returns {string} URL construida
   */
  buildUrl(template, params = {}) {
    let url = template;
    Object.keys(params).forEach(key => {
      url = url.replace(`{${key}}`, params[key]);
    });
    return url;
  }

  /**
   * Formatear response para manejo consistente
   * @param {Object} response - Response del servidor
   * @returns {Object} Response formateado
   */
  formatResponse(response) {
    return {
      data: response.data || response,
      success: true,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Construir parámetros de query string
   * @param {Object} params - Parámetros
   * @returns {URLSearchParams} Query params
   */
  buildQueryParams(params = {}) {
    const searchParams = new URLSearchParams();

    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        searchParams.append(key, params[key]);
      }
    });

    return searchParams;
  }
}

export default BaseService;