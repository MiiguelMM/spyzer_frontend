// src/service/stocksService.js
import marketDataService from './marketDataService.js';

// Lista COMPLETA de los 51 símbolos gestionados por el backend (Armonizada)
const POPULAR_STOCKS = [
  'SPY', 'QQQ', 'DAX', 'IBEX', // Índices/ETFs Principales
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'NVDA', 'NFLX', // Mega Tech
  'JPM', 'V', 'MA', 'WFC', 'GS', // Financieros
  'JNJ', 'PFE', 'UNH', 'ABT', 'TMO', // Salud
  'WMT', 'HD', 'MCD', 'NKE', 'SBUX', 'KO', 'PG', // Consumo
  'XOM', 'CVX', 'COP', // Energía
  'DIS', 'CMCSA', // Media
  'ORCL', 'CRM', 'ADBE', 'CSCO', 'INTC', 'AMD', 'QCOM', // Tech adicional
  'IWM', 'DIA', 'VTI', 'XLF', 'XLK', 'XLE', // ETFs principales
  'BABA', 'TSM', 'NVO', 'ASML' // Otros populares
];

const obtenerAccionesPopulares = async () => {
  try {
    // Llamada al endpoint de múltiples símbolos
    const response = await marketDataService.obtenerMultiplesDatos(POPULAR_STOCKS);
    
    // El backend devuelve { total: N, solicitados: M, datos: { symbol: MarketData } }
    return Object.values(response.datos);
  } catch (error) {
    console.error('Error obteniendo acciones populares:', error);
    throw error;
  }
};

const obtenerAccionConHistorico = async (symbol) => {
  try {
    const data = await marketDataService.obtenerDatos(symbol);
    // Asumiendo que marketDataService.get() construye la URL base correctamente
    const historical = await marketDataService.get(`/${symbol}/historical?days=365`);
    
    return {
      ...data,
      historicalData: historical.data || []
    };
  } catch (error) {
    console.error(`Error obteniendo ${symbol}:`, error);
    throw error;
  }
};

const buscarAcciones = async (query, limite = 10) => {
  // Llama al endpoint GET /api/market-data/buscar?q=...&limite=...
  return marketDataService.buscarSimbolos(query, limite);
};

export default {
  obtenerAccionesPopulares,
  obtenerAccionConHistorico,
  buscarAcciones,
  POPULAR_STOCKS
};