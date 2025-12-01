// src/config/axiosConfig.js
import axios from 'axios';
import authService from '../service/authService';

// Configuración base de Axios
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Crear instancia de axios con configuración base
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 segundos - alineado con backend
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor - Para agregar token de autenticación
apiClient.interceptors.request.use(
  (config) => {
    // Agregar token si existe
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log de requests en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data
      });
    }

    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Para manejo global de errores
apiClient.interceptors.response.use(
  (response) => {
    // Log de responses en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data
      });
    }

    return response;
  },
  (error) => {
    // Manejo global de errores
    if (error.response) {
      // Error con respuesta del servidor
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Token expirado o no autorizado
          console.warn('⚠️ Sesión expirada o no autorizada. Redirigiendo al login...');
          authService.logout();
          break;
        case 403:
          console.error('🚫 Acceso prohibido');
          authService.logout();
          break;
        case 404:
          console.error('🔍 Recurso no encontrado');
          break;
        case 500:
          console.error('💥 Error interno del servidor');
          break;
        default:
          console.error(`❌ Error ${status}:`, data?.error || 'Error desconocido');
      }
    } else if (error.request) {
      // Error de red
      console.error('🌐 Error de conexión:', error.message);
    } else {
      // Error en la configuración
      console.error('⚙️ Error de configuración:', error.message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;