// src/service/stocksService.js
import marketDataService from './marketDataService.js';

// Lista COMPLETA de los 80 símbolos gestionados por el backend (Armonizada)
const POPULAR_STOCKS = [
  // === GRUPO PREMIUM (20 símbolos) ===
  // Índices principales
  'SPY', 'QQQ', 'DAX',
  // Mega Tech
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'NVDA', 'NFLX', 'AMD',
  // Top Financieros
  'JPM', 'V', 'MA',
  // International Tech
  'BABA', 'TSM', 'ADBE',
  // Enterprise Software
  'ORCL', 'CRM',

  // === GRUPO STANDARD (42 símbolos) ===
  // ETF China
  'FXI',
  // Financieros adicionales
  'WFC', 'GS',
  // Salud
  'JNJ', 'PFE', 'UNH', 'ABT', 'TMO',
  // Consumo
  'WMT', 'HD', 'MCD', 'NKE', 'SBUX', 'KO', 'PG',
  // Energía
  'XOM', 'CVX', 'COP',
  // Media
  'DIS', 'CMCSA',
  // Tech adicional
  'CSCO', 'INTC', 'QCOM',
  // ETFs
  'IWM', 'DIA', 'VTI', 'XLF', 'XLK', 'XLE',
  // European ADRs
  'NVO', 'ASML',
  // Semiconductors adicionales
  'SMH', 'SOXX',
  // Fintech
  'PYPL', 'SQ', 'COIN',
  // E-commerce/Gig
  'SHOP', 'UBER', 'LYFT',

  // === GRUPO EXTENDED (18 símbolos) ===
  // ETFs de Innovación/Growth
  'ARKK',
  // Commodities & Treasuries
  'TLT', 'GLD', 'SLV',
  // Biotech
  'XBI', 'IBB',
  // Clean Energy
  'TAN', 'ICLN',
  // Retail
  'XRT',
  // Homebuilders
  'XHB', 'ITB',
  // Regional Banks
  'KRE',
  // Streaming/Entertainment
  'SPOT', 'ROKU',
  // Cloud/Cybersecurity
  'NET', 'CRWD', 'ZS'
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