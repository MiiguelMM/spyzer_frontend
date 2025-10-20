// src/service/marketDataClient.js

// Importamos el cliente de Axios configurado
import apiClient from '../config/axiosConfig'; 

/* * NOTA DE RUTA: 
 * El apiClient ya tiene la base: http://localhost:8080/api.
 * Los endpoints de Java usan: /market-data/...
 * Por lo tanto, todas las llamadas usan '/market-data' como prefijo.
 */

const obtenerDatos = async (symbol) => {
  const response = await apiClient.get(`/market-data/${symbol}`);
  return response.data;
};

// Función genérica para rutas más complejas (ej. históricos)
const get = async (url) => {
  // Concatena /market-data con el resto de la URL (ej. /AAPL/historical?days=365)
  const response = await apiClient.get(`/market-data${url}`);
  return response.data;
};

const obtenerMultiplesDatos = async (symbols) => {
  const response = await apiClient.post('/market-data/multiple', { symbols });
  // El controlador de Java devuelve el DTO con el campo 'datos'
  return response.data; 
};

const obtenerIndicesPrincipales = async () => {
  const response = await apiClient.get('/market-data/indices');
  return response.data;
};

const buscarSimbolos = async (query, limite) => {
    const response = await apiClient.get(`/market-data/buscar?q=${query}&limite=${limite}`);
    return response.data;
};

export default {
    obtenerDatos,
    get,
    obtenerMultiplesDatos,
    obtenerIndicesPrincipales,
    buscarSimbolos
};